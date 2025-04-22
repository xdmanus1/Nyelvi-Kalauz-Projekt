// src/lib/components/stores/AuthStore.ts
import { writable, get, type Writable } from 'svelte/store'; // Import 'get'
import { supabase } from '$lib/supabaseClient'; // Make sure this path is correct
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { toast } from 'svelte-sonner'; // Assuming you use svelte-sonner

// Interface for language preference (already existed)
interface LanguagePair {
    from: string;
    to: string;
}

// Define the shape of the user metadata we expect/manage
// Exporting this might be useful if other components need it directly
export interface UserMetadata {
    language_from?: string;
    language_to?: string;
    last_visited_app_id?: string | null; // ID of the last app visited
    memory_game_min_flips?: number | null; // Best score (lowest flips)
    memory_game_completed?: number | null; // Total games completed
    username?: string; // Existing username
    beta_features?: boolean | null;
    // Add other metadata fields if you have them
}

// Define the state managed by the store
// --- ADD export HERE ---
export interface AuthState {
    user: User | null;
    betaFeatures: boolean | null; // From app_metadata
    lastVisitedAppId: string | null; // From user_metadata
    memoryGameMinFlips: number | null; // From user_metadata
    memoryGameCompleted: number | null; // From user_metadata
}

// Define the interface for the store itself, including custom methods
// Exporting this might be useful for advanced typing scenarios
export interface AuthStore extends Writable<AuthState> {
    initialize: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
    signUp: (email: string, password: string, username: string) => Promise<{ user: User | null; error: AuthError | null }>;
    signOut: () => Promise<{ error: AuthError | null }>;
    updateUserLanguage: (languagePair: LanguagePair) => Promise<{ error: AuthError | null }>;
    updateLastVisitedApp: (appId: string | null) => Promise<{ error: AuthError | null }>; // Method to update last visited app
    updateMemoryGameProgress: (
        progress: { currentFlips?: number; completed?: boolean }
    ) => Promise<{ error: AuthError | null }>; // Method to update game progress
}

// Factory function to create the store instance
function createAuthStore(): AuthStore {
    const initialState: AuthState = {
        user: null,
        betaFeatures: null,
        lastVisitedAppId: null,
        memoryGameMinFlips: null,
        memoryGameCompleted: null,
    };

    const { subscribe, set, update } = writable<AuthState>(initialState);

    // Helper to extract metadata and update store state
    const updateUserState = (user: User | null) => {
        const metadata = user?.user_metadata as UserMetadata | undefined;
        const appMetadata = user?.app_metadata; // For betaFeatures

        set({
            user: user,
            betaFeatures: metadata?.beta_features ?? null,
            lastVisitedAppId: metadata?.last_visited_app_id ?? null,
            memoryGameMinFlips: metadata?.memory_game_min_flips ?? null,
            memoryGameCompleted: metadata?.memory_game_completed ?? 0, // Default completed to 0
        });
        // Removed console log for brevity, uncomment if needed for debugging
        // console.log("AuthStore Updated:", {
        //     user: !!user,
        //     beta: appMetadata?.beta_features,
        //     lastApp: metadata?.last_visited_app_id,
        //     minFlips: metadata?.memory_game_min_flips,
        //     completed: metadata?.memory_game_completed
        // });
    };


    return {
        subscribe,
        set,
        update,

        // Initialize store on app load
        initialize: async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("AuthStore Init Error getting session:", error.message);
                    updateUserState(null); // Ensure user is null on error
                } else {
                    updateUserState(session?.user ?? null); // Update state with current user/metadata
                }

                // Listen for future auth changes
                supabase.auth.onAuthStateChange((event, session) => {
                    // console.log(`Auth Event: ${event}`); // Debug Log
                    if (event === 'SIGNED_OUT') {
                        set(initialState); // Reset to initial state on sign out
                    } else if (event === 'USER_UPDATED' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                        updateUserState(session?.user ?? null); // Update state on relevant events
                    } else if (!session?.user) {
                        // If session becomes null for other reasons, reset state
                        set(initialState);
                    }
                });
            } catch (initError) {
                console.error("AuthStore Initialization Failed:", initError);
                updateUserState(null); // Ensure user is null on failure
            }
        },

        // Sign In
        signIn: async (email, password) => {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                console.error('Sign In Error:', error.message);
                toast.error(`Sign In Failed: ${error.message}`); // User feedback
                return { user: null, error };
            }
            // State update handled by onAuthStateChange
            return { user: data.user, error: null };
        },

        // Sign Up
        signUp: async (email, password, username) => {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username } }
            });
            if (error) {
                console.error('Sign Up Error:', error.message);
                toast.error(`Sign Up Failed: ${error.message}`); // User feedback
                return { user: null, error };
            }
            // If sign up requires email confirmation, user won't be logged in immediately.
            // onAuthStateChange handles the logged-in state once confirmed/signed in.
            if (data.user) {
                toast.success("Sign up successful! Check your email for confirmation if needed.");
            } else {
                toast.info("Sign up request sent."); // Or handle specific cases like unconfirmed email
            }
            return { user: data.user, error: null };
        },

        // Sign Out
        signOut: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Sign Out Error:', error.message);
                toast.error("Sign Out Failed.");
                return { error };
            }
            // State reset is handled by onAuthStateChange ('SIGNED_OUT')
            return { error: null };
        },

        // Update Language Preference
        updateUserLanguage: async (languagePair) => {
            const { user } = get(authStore); // Get current user from state
            if (!user) return { error: { name: "AuthError", message: "User not logged in" } as AuthError };

            const { data, error } = await supabase.auth.updateUser({
                data: {
                    language_from: languagePair.from,
                    language_to: languagePair.to
                }
            });
            if (error) {
                console.error('Lang Update Error:', error.message);
                toast.error(`Failed to update language: ${error.message}`);
                return { error };
            }
            // Explicitly update state because onAuthStateChange might not trigger for metadata updates alone
            if (data.user) updateUserState(data.user);
            localStorage.setItem('selectedLanguage', JSON.stringify(languagePair));
            // toast.success("Language preference updated."); // Optional feedback
            return { error: null };
        },

        // Update Last Visited App
        updateLastVisitedApp: async (appId) => {
            const currentState = get(authStore);
            if (!currentState.user) {
                // console.warn("Cannot update last visited app: No user.");
                // Decide if this should be an error or silent failure
                return { error: null }; // Silently fail if no user
            }

            if (currentState.lastVisitedAppId === appId) {
                return { error: null }; // No change needed
            }

            // console.log(`AuthStore: Updating last_visited_app_id to ${appId}`);
            const { data, error } = await supabase.auth.updateUser({
                data: { last_visited_app_id: appId }
            });

            if (error) {
                console.error('Last App Update Error:', error.message);
                toast.error(`Error saving app preference: ${error.message}`);
                return { error };
            } else {
                // Explicitly update local state AFTER DB success
                update(state => ({ ...state, lastVisitedAppId: appId }));
                // console.log("AuthStore: lastVisitedAppId updated locally.");
                return { error: null };
            }
        },

        // Update Memory Game Progress
        updateMemoryGameProgress: async ({ currentFlips, completed }) => {
            const currentState = get(authStore);
            if (!currentState.user) {
                // console.warn("Cannot update game progress: No user.");
                return { error: null }; // Silently fail
            }

            const currentMeta = (currentState.user.user_metadata ?? {}) as UserMetadata;
            const updates: Partial<UserMetadata> = {};
            let stateUpdates: Partial<AuthState> = {};
            let needsDBUpdate = false;

            if (completed) {
                const newCompletedCount = (currentMeta.memory_game_completed ?? 0) + 1;
                updates.memory_game_completed = newCompletedCount;
                stateUpdates.memoryGameCompleted = newCompletedCount;
                needsDBUpdate = true;
                // console.log(`AuthStore: Incrementing games completed to ${newCompletedCount}`);

                if (currentFlips !== undefined) {
                    const currentBest = currentMeta.memory_game_min_flips;
                    if (currentBest === null || currentBest === undefined || currentFlips < currentBest) {
                        updates.memory_game_min_flips = currentFlips;
                        stateUpdates.memoryGameMinFlips = currentFlips;
                        needsDBUpdate = true;
                        // console.log(`AuthStore: Updating min flips to ${currentFlips}`);
                    }
                }
            }

            if (!needsDBUpdate) {
                // console.log("AuthStore: No game progress DB update needed.");
                return { error: null };
            }

            const { data, error } = await supabase.auth.updateUser({ data: updates });

            if (error) {
                console.error('Game Progress Update Error:', error.message);
                toast.error(`Error saving game progress: ${error.message}`);
                return { error };
            } else {
                // Update local store state *after* DB success
                update(state => ({ ...state, ...stateUpdates }));
                // console.log("AuthStore: Game progress updated locally.", stateUpdates);
                return { error: null };
            }
        },
    };
}

// Create and export the store instance
export const authStore = createAuthStore();

// Initialize the store when this module is imported
// Wrap in a check to avoid running initialization multiple times if module is re-imported
// (though standard ESM import behavior usually prevents this)
if (typeof window !== 'undefined') { // Basic check if running in a browser context
    authStore.initialize();
}