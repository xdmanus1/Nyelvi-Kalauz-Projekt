import { writable, type Writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { User, Session } from '@supabase/gotrue-js';
import type { AuthError } from '@supabase/auth-js';

interface AuthState {
    user: User | null;
    betaFeatures: boolean | null;
}

interface AuthStore extends Writable<AuthState> {
    initialize: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
    signUp: (email: string, password: string, username: string) => Promise<{ user: User | null; error: AuthError | null }>;
    signOut: () => Promise<{ error: AuthError | null }>;
}

function createAuthStore(): AuthStore {
    const { subscribe, set, update } = writable<AuthState>({
        user: null,
        betaFeatures: null
    });

    return {
        subscribe,
        set,
        update,
        initialize: async () => {
            const {
                data: { session }
            } = await supabase.auth.getSession();

            if (session?.user) {
                const betaFeatures = session.user.app_metadata?.beta_features ?? null;
                set({ user: session.user, betaFeatures });
            }

            supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    const user = session?.user ?? null;
                    const betaFeatures = user?.app_metadata?.beta_features ?? null;
                    set({ user, betaFeatures });
                } else if (event === 'SIGNED_OUT') {
                    set({ user: null, betaFeatures: null });
                }
            });
        },
        signIn: async (email: string, password: string) => {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error('Error signing in:', error.message);
                return { user: null, error };
            }

            if (data.user) {
                const betaFeatures = data.user.app_metadata?.beta_features ?? null;
                set({ user: data.user, betaFeatures });
            }

            return { user: data.user, error: null };
        },
        signUp: async (email: string, password: string, username: string) => {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username
                    }
                }
            });

            if (error) {
                console.error('Error signing up:', error.message);
                return { user: null, error };
            }

            if (data.user) {
                const betaFeatures = data.user.app_metadata?.beta_features ?? null;
                set({ user: data.user, betaFeatures });
            }

            return { user: data.user, error: null };
        },
        signOut: async () => {
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('Error signing out:', error.message);
                return { error };
            }

            set({ user: null, betaFeatures: null });
            return { error: null };
        }
    };
}

export const authStore = createAuthStore();