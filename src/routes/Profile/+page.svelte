<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    // import CircleAlert from "lucide-svelte/icons/circle-alert"; // Not used
    // import * as Alert from "$lib/components/ui/alert"; // Not used
    import { Label } from "$lib/components/ui/label";
    import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu"; // Not used directly, but maybe by other components
    import { Switch } from "$lib/components/ui/switch";
    import { username as usernameStore } from '$lib/components/stores/user'; // Renamed to avoid conflict
    import { toast } from "svelte-sonner";
    import { supabase } from "$lib/supabaseClient";
    import { goto } from "$app/navigation";
    import { authStore } from '$lib/components/stores/AuthStore';
    import type { AuthState } from '$lib/components/stores/AuthStore'; // Import the type if needed elsewhere, not strictly necessary for $ syntax
    import { onMount } from "svelte"; // Not used currently, but good practice to keep if needed later
    import * as AlertDialog from "$lib/components/ui/alert-dialog/";
    import { LogOut, Trash2, Languages } from "lucide-svelte"; // Combined Lucide imports

    // Subscribe to authStore to get the current user object for updates
    let user: import('@supabase/gotrue-js').User | null = null;
    authStore.subscribe(state => { // Subscribe to the whole state to get the user object
        user = state.user;
    });

    // --- Reactive state derived from user or local state ---
    let name: string;
    $: name = user?.user_metadata.username || ''; // Use username from user metadata

    let beta = false; // Initial value, will be updated reactively
    $: beta = $authStore.user?.user_metadata.beta_features ?? false; // Update beta reactively from store

    let isSubmitting = false; // For the name change form
    let formErrors = {}; // Not currently used, but kept for structure

    // Alert Dialog State for Username Change
    let open = false;

    // Language Selection State
    const languagePairs = [
        { from: 'English', to: 'Japanese', unable: false },
        { from: 'Japanese', to: 'English', unable: true },
        { from: 'English', to: 'Hungarian', unable: true},
        { from: 'Hungarian', to: 'English', unable: true },
    ];
    // Initialize selectedPair from store or localStorage if available, otherwise default
    let selectedPair = languagePairs[0]; // Default
    $: {
        const currentLangFrom = $authStore.user?.user_metadata?.language_from;
        const currentLangTo = $authStore.user?.user_metadata?.language_to;
        if (currentLangFrom && currentLangTo) {
            const foundPair = languagePairs.find(p => p.from === currentLangFrom && p.to === currentLangTo);
            if (foundPair) {
                selectedPair = foundPair;
            } else {
                // Handle case where stored pair isn't in the list (maybe add it dynamically or log a warning)
                console.warn("Stored language pair not found in options:", currentLangFrom, currentLangTo);
            }
        } else {
            // Try localStorage as a fallback if needed
             if (typeof localStorage !== 'undefined') {
                 const storedLang = localStorage.getItem('selectedLanguage');
                 if (storedLang) {
                    try {
                        const parsedPair = JSON.parse(storedLang);
                        // Basic validation if the parsed pair is valid
                        if (parsedPair && parsedPair.from && parsedPair.to) {
                             const foundPair = languagePairs.find(p => p.from === parsedPair.from && p.to === parsedPair.to);
                             if (foundPair) selectedPair = foundPair;
                        }
                    } catch (e) {
                        console.error("Error parsing language from localStorage", e);
                         localStorage.removeItem('selectedLanguage'); // Clear invalid data
                    }
                 }
             }
        }
    }


    // --- Methods ---

    // Handles saving the username change (now triggers the alert dialog)
    function handleNameSaveClick() {
        // Basic validation if needed
        if (!name.trim()) {
            toast.error("Username cannot be empty.");
            return;
        }
         // Check if name actually changed
        if (name === (user?.user_metadata.username || '')) {
            toast.info("Username hasn't changed.");
            return;
        }
        open = true; // Open confirmation dialog
    }

    // Submits the username update after confirmation
    async function confirmUsernameChange() {
        open = false; // Close dialog
        isSubmitting = true;
        const { data, error } = await supabase.auth.updateUser({
            data: { username: name }
        });
        if (error) {
            console.error("Update username error:", error.message);
            toast.error(`Failed to update username: ${error.message}`);
        } else {
            console.log("Username updated successfully!", data);
            usernameStore.set(name); // Update the separate username store if still used elsewhere
            toast.success("Username updated successfully!");
            // authStore will update reactively via onAuthStateChange listener
        }
        isSubmitting = false;
    }

    // Logs the user out
    function logout() {
        authStore.signOut().then(({ error }) => {
            if (error) {
                console.error('Logout error:', error.message);
                toast.error("Failed to log out.");
            } else {
                toast.success("Logged Out successfully!");
                goto("/"); // Redirect to home page after logout
            }
        });
    }

    // Toggles beta features
    async function toggleBeta() {
        const currentBetaState = $authStore.betaFeatures; // Get current state from store
        const newBetaState = !currentBetaState;

        try {
            // Update Supabase user's app_metadata
            const { error } = await supabase.auth.updateUser({
                // Use app_metadata for flags not directly editable by user profile actions
                // Check Supabase policies if this is allowed client-side
                 // **Important**: Updating app_metadata directly might be restricted by default policies.
                 // Often, this requires a server-side function (Edge Function) for security.
                 // Assuming for now it's allowed or you'll adjust policies/use a function.
                 // If not allowed, this will fail silently or throw an error depending on setup.
                 // A safer approach is often to store such flags in user_metadata or a separate table.
                 // Let's proceed assuming user_metadata for simplicity as `beta_features` was there previously.
                data: { beta_features: newBetaState } // Stick to user_metadata based on original code
            });

            if (error) throw error;

            // No need to call authStore.initialize() here. The onAuthStateChange listener
            // in authStore should pick up the USER_UPDATED event and refresh the state.
            toast.success(`Beta features ${newBetaState ? 'enabled' : 'disabled'}!`);

        } catch (error: any) {
            console.error("Error updating beta features:", error);
            toast.error(`Failed to update beta features: ${error.message || 'Unknown error'}`);
            // Revert the switch visually if the update failed (optional)
             // Note: Because `beta` is derived reactively ($:), it will automatically revert
             // when the authStore updates (or fails to update) after the error.
        }
    }

    // Updates language preferences
    async function handleLanguageSelection() {
        // Check if selected pair is disabled
        if (selectedPair.unable) {
            toast.error("This language pair is not available yet.");
            return;
        }
        try {
            await authStore.updateUserLanguage(selectedPair);
            // No need to update localStorage here if authStore.updateUserLanguage already does it
            toast.success("Language preferences updated!");
        } catch (error) {
            console.error("Lang Update Error (Component):", error);
            toast.error("Failed to update language preferences");
        }
    }

    // Helper function for avatar fallback
    function getAvatarFallback(nameStr: string): string {
        if (!nameStr) return '??';
        const words = nameStr.split(' ').filter(Boolean);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        } else if (words.length === 1) {
            return nameStr.slice(0, 2).toUpperCase();
        }
        return '??';
    }

</script>

<!-- {#if $authStore.user} -->
<main class="max-w-2xl mx-auto p-4 sm:p-6 space-y-8 mt-10">
    <!-- Profile Section -->
    <Card.Root>
        <Card.Header>
            <Card.Title>Profile</Card.Title>
            <Card.Description>Update your profile information.</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-6">
            <div class="flex items-center gap-4">
                <Avatar class="h-16 w-16 text-lg"> <!-- Make avatar slightly larger -->
                    <AvatarFallback aria-label="User avatar">
                        {getAvatarFallback(name)}
                    </AvatarFallback>
                    <!-- <AvatarImage src={user?.user_metadata.avatar_url} alt="User avatar" /> --> <!-- Add if you have avatar URLs -->
                </Avatar>
                <Button variant="outline" aria-label="Change avatar" disabled> <!-- Disabled for now -->
                    Change Avatar
                </Button>
            </div>
            <form on:submit|preventDefault={handleNameSaveClick} class="space-y-4">
                <div>
                    <Label for="name">Username</Label>
                    <Input
                        id="name"
                        bind:value={name}
                        class="mt-1"
                        aria-invalid={null}
                        aria-describedby={'name-error'}
                        disabled={isSubmitting}
                    />
                    <!-- Add error display here if needed -->
                </div>
                <!-- Removed Bio section as it wasn't implemented -->
                <Card.Footer class="flex justify-end pt-4 px-0 pb-0"> <!-- Adjusted padding -->
                    <Button type="submit" disabled={isSubmitting || name === (user?.user_metadata.username || '')}>
                        {isSubmitting ? 'Saving...' : 'Save Username'}
                    </Button>
                </Card.Footer>
            </form>
        </Card.Content>
    </Card.Root>

    <!-- Progress Section -->
    <Card.Root>
        <Card.Header>
            <Card.Title>Progress</Card.Title>
            <Card.Description>Your tracked progress across activities.</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
            <!-- Memory Game Progress -->
            <div class="flex items-center justify-between gap-4">
                <div class="space-y-0.5"> <!-- Reduced space inside label group -->
                    <Label>Memory Game Best Score</Label>
                    <p class="text-sm text-muted-foreground">Lowest flips to complete.</p>
                </div>
                <span class="font-medium text-lg tabular-nums"> <!-- Larger font, tabular nums -->
                    {#if $authStore.memoryGameMinFlips !== null && $authStore.memoryGameMinFlips !== undefined}
                        {$authStore.memoryGameMinFlips} <span class="text-sm font-normal text-muted-foreground">flips</span>
                    {:else}
                        N/A
                    {/if}
                </span>
            </div>
            <div class="flex items-center justify-between gap-4">
                <div class="space-y-0.5">
                    <Label>Memory Games Completed</Label>
                    <p class="text-sm text-muted-foreground">Total number of games finished.</p>
                </div>
                <span class="font-medium text-lg tabular-nums">
                    {$authStore.memoryGameCompleted ?? 0}
                </span>
            </div>
            <!-- Add other progress metrics here using $authStore -->
            <!-- e.g., Last Visited App -->
            <!-- <div class="flex items-center justify-between gap-4">
                <div class="space-y-0.5">
                    <Label>Last Activity</Label>
                     <p class="text-sm text-muted-foreground">The last learning app you visited.</p>
                 </div>
                 <span class="font-medium text-base">
                     {$authStore.lastVisitedAppId ? $authStore.lastVisitedAppId.replace('-', ' ') : 'None'}
                 </span>
            </div> -->
        </Card.Content>
    </Card.Root>

    <!-- Language Preferences -->
    <Card.Root>
        <Card.Header>
            <Card.Title>Language Preferences</Card.Title>
            <Card.Description>Choose your default learning language pair.</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="space-y-1 flex-shrink mb-2 sm:mb-0">
                    <Label for="language-select">Learning Pair</Label>
                    <p class="text-sm text-muted-foreground">
                        Select native → target language.
                    </p>
                </div>
                <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                     <select
                        id="language-select"
                        bind:value={selectedPair}
                        on:change={handleLanguageSelection}
                        class="flex-1 sm:flex-none w-full sm:max-w-[200px] p-2 h-10 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Select language pair"
                    >
                        {#each languagePairs as pair (pair.from + pair.to)}
                             <option value={pair} disabled={pair.unable}>
                                 {pair.from} → {pair.to} {pair.unable ? '(Soon)' : ''}
                             </option>
                        {/each}
                    </select>
                    <!-- The button might be redundant if selection triggers update -->
                    <!-- <Button variant="outline" on:click={handleLanguageSelection} class="hidden sm:inline-flex">
                        <Languages class="w-4 h-4 mr-2" /> Update
                    </Button> -->
                 </div>
            </div>
        </Card.Content>
    </Card.Root>

    <!-- Beta Features -->
    <Card.Root>
        <Card.Header>
            <Card.Title>Advanced</Card.Title>
            <Card.Description>Manage experimental features and account actions.</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-6">
             <div class="flex items-center justify-between gap-4 p-4 border rounded-lg">
                 <div class="space-y-1">
                     <Label for="beta-switch">Beta Features</Label>
                     <p class="text-sm text-muted-foreground">
                         Try out new experimental features. May be unstable.
                     </p>
                 </div>
                 <Switch
                    id="beta-switch"
                    bind:checked={beta}
                    on:click={toggleBeta}
                    aria-label="Toggle beta features"
                 />
             </div>

             <!-- Danger Zone Actions -->
             <div class="space-y-4 pt-4 border-t border-border">
                 <h4 class="text-base font-semibold text-destructive">Danger Zone</h4>
                 <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                     <div class="space-y-1 text-center sm:text-left">
                         <Label class="text-destructive">Logout</Label>
                         <p class="text-sm text-destructive/90">
                             Sign out of your current session on this device.
                         </p>
                     </div>
                     <Button variant="outline" class="w-full sm:w-auto border-destructive text-destructive hover:bg-destructive/10" on:click={logout}>
                         <LogOut class="w-4 h-4 mr-2" /> Logout
                     </Button>
                 </div>
                 <!-- Delete Account (Example - Implement carefully!) -->
                 <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                     <div class="space-y-1 text-center sm:text-left">
                         <Label class="text-destructive">Delete Account</Label>
                         <p class="text-sm text-destructive/90">
                             Permanently delete your account and all associated data. This cannot be undone.
                         </p>
                     </div>
                     <Button variant="destructive" class="w-full sm:w-auto" disabled> <!-- Add on:click handler when implemented -->
                         <Trash2 class="w-4 h-4 mr-2" /> Delete Account
                     </Button>
                 </div>
             </div>
        </Card.Content>
    </Card.Root>

    <!-- Alert Dialog for Username Change Confirmation -->
    <AlertDialog.Root bind:open={open}>
        <!-- Trigger removed as it's called programmatically -->
        <AlertDialog.Portal>
            <AlertDialog.Overlay /> <!-- Shadcn handles styling/animation -->
            <AlertDialog.Content>
                <AlertDialog.Header>
                    <AlertDialog.Title>Confirm Username Change</AlertDialog.Title>
                    <AlertDialog.Description>
                        Are you sure you want to change your username to <strong class="text-foreground">{name}</strong>?
                    </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                    <AlertDialog.Cancel asChild>
                      <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                        <Button
                            variant="destructive"
                            on:click={confirmUsernameChange}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Changing...' : 'Confirm Change'}
                        </Button>
                    </AlertDialog.Action>
                </AlertDialog.Footer>
            </AlertDialog.Content>
        </AlertDialog.Portal>
    </AlertDialog.Root>
</main>
<!-- {:else}
    <section class="flex justify-center items-center min-h-screen p-4">
        <div class="loading text-5xl">Loading User</div>
    </section>
{/if} --> 

<style>
    /* Keep your loading dots styles if you use the loading section */
    .loading::after {
        content: "";
        animation: dots 1.5s steps(4, end) infinite;
        display: inline-block; /* Ensures dots appear after text */
        width: 1.5em; /* Adjust width as needed */
        vertical-align: bottom;
    }
    @keyframes dots {
        0%, 20% { content: ""; }
        40% { content: "."; }
        60% { content: ".."; }
        80%, 100% { content: "..."; }
    }
</style>