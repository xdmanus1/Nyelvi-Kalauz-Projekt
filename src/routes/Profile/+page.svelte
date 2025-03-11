<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import CircleAlert from "lucide-svelte/icons/circle-alert";
    import * as Alert from "$lib/components/ui/alert";
    import { Label } from "$lib/components/ui/label";
    import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Switch } from "$lib/components/ui/switch";
    import { username } from '$lib/components/stores/user';
    import { toast } from "svelte-sonner";
    import { supabase } from "$lib/supabaseClient";
    import { goto } from "$app/navigation";
    import { authStore } from '$lib/components/stores/AuthStore';
    import { onMount } from "svelte";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/";
    import { LogOut, Trash2 } from "lucide-svelte";
    
    // Subscribe to authStore to get the current user
    let user: import('@supabase/gotrue-js').User | null = null;
    authStore.subscribe(({ user: currentUser }) => {
    user = currentUser;
    });
    
    // Reactive state
    let name: string;
    $: name = user?.user_metadata.username || ''; // Use username from user metadata
    let bio = "";
    let beta = false;
    let isSubmitting = false;
    let formErrors = {};
    
    // Methods
    async function handleSubmit2() {
    const { data, error } = await supabase.auth.updateUser({
    data: {
    username: name
    },
    });
    if (error) {
    console.error("Update username error:", error.message);
    toast.error("Failed to update username. Please try again.");
    } else {
    console.log("Username updated successfully!", data);
    username.set(name); // Update the local state
    toast.success("Username updated successfully!");
    }
    }
    
    function logout() {
    authStore.signOut().then(({ error }) => {
    if (error) {
    console.error('Logout error:', error.message);
    toast.error("Failed to log out.");
    } else {
    toast.success("Logged Out successfully!");
    goto("/"); // Redirect to login page after logout
    }
    });
    }
    
    const handleSubmit = async () => {
    isSubmitting = true;
    formErrors = {};
    if (Object.keys(formErrors).length === 0) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Handle successful submission
    }
    isSubmitting = false;
    };
    
    
    // Alert Dialog State
    let open = false;
    
    async function handleUsernameChange() {
    open = false;
    await handleSubmit2();
    }
  
    beta = user?.user_metadata.beta_features || false;
    async function toggleBeta() {

        
        try {
            // Update Supabase with the new beta_features value
            const { error } = await supabase.auth.updateUser({
                data: { beta_features: !beta }
            });
            
            if (error) throw error;

            // Refresh authentication state and show success
            await authStore.initialize();
            toast.success("Beta features updated!");
            
        } catch (error) {
            console.error("Error updating beta features:", error);
            toast.error("Failed to update beta features.");
        }
        
        console.log("Current beta state:", !beta);
    };

    </script>
    
    <!-- {#if user} -->
    <main class="max-w-2xl mx-auto p-6 space-y-8 mt-10">
    <!-- Profile Section -->
    <Card.Root>
    <Card.Header>
    <Card.Title>Profile</Card.Title>
    <Card.Description>Update your profile information</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-6">
    <div class="flex items-center gap-4">
    <Avatar>
    <AvatarFallback aria-label="User avatar">
    {name.slice(0, 2)}
    </AvatarFallback>
    </Avatar>
    <Button variant="outline" aria-label="Change avatar">
    Change Avatar
    </Button>
    </div>
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
    <Label for="name">Name</Label>
    <Input
    id="name"
    bind:value={name}
    class="mt-1"
    aria-invalid={null}
    aria-describedby={'name-error'}
    />
    </div>
    <Card.Footer class="flex justify-end pt-4">
    <Button type="button" disabled={isSubmitting} on:click={() => open = true}>
    {isSubmitting ? 'Saving...' : 'Save Changes'}
    </Button>
    </Card.Footer>
    </form>
    </Card.Content>
    </Card.Root>
    
    <!-- Beta Features -->
    <Card.Root>
    <Card.Header>
    <Card.Title>Beta Features</Card.Title>
    <Card.Description>Enable experimental features</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-6">
    <div class="flex items-center justify-between gap-4">
    <div class="space-y-1">
    <Label>Beta Features</Label>
    <p class="text-sm text-muted-foreground">
    Enable experimental features
    </p>
    </div>
    <Switch
    bind:checked={beta}
    on:click={toggleBeta}
    aria-label="Toggle beta features"
    />
    </div>
    </Card.Content>
    </Card.Root><!--
    <Card.Root class="border-destructive">
    <Card.Header>
    <Card.Title class="text-destructive">Danger Zone</Card.Title>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="space-y-1 text-center sm:text-left">
    <Label>Delete Account</Label>
    <p class="text-sm text-muted-foreground">
    Permanently delete your account and data
    </p>
    </div>
    <Button variant="destructive" class="w-full sm:w-auto">
    <Trash2 class="w-4 h-4 mr-2" /> Delete Account
    </Button>
    </div>
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="space-y-1 text-center sm:text-left">
    <Label>Logout</Label>
    <p class="text-sm text-muted-foreground">
    Sign out of your current session
    </p>
    </div>
    <Button variant="outline" class="w-full sm:w-auto" on:click={logout}>
    <LogOut class="w-4 h-4 mr-2" /> Logout
    </Button>
    </div>
    </Card.Content>
    </Card.Root> -->
    
    <!-- Alert Dialog for Username Change -->
    <AlertDialog.Root open={open} on:close={() => open = false}>
    <AlertDialog.Trigger asChild>
    <Button variant="outline" class="hidden">
    Open Alert Dialog
    </Button>
    </AlertDialog.Trigger>
    <AlertDialog.Portal>
    <AlertDialog.Overlay on:click="{() => open = false}"
    class="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <AlertDialog.Content class="fixed left-[50%] top-[50%] max-h-[85vh] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg bg-popover p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=closed]:slide-out-to-top-1/2 data-[state=open]:slide-in-from-bottom-1/2 data-[state=open]:slide-in-from-top-1/2 sm:zoom-in-90">
    <AlertDialog.Header class="flex flex-col space-y-2 text-center sm:text-left">
    <AlertDialog.Title class="text-lg font-semibold">
    Change Username
    </AlertDialog.Title>
    <AlertDialog.Description class="text-sm text-muted-foreground">
    Are you sure you want to change your username to "{name}"?
    </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer class="flex justify-center gap-4">
    <AlertDialog.Cancel asChild>
    <Button variant="outline" class="" on:click="{() => open = false}">
    Cancel
    </Button>
    </AlertDialog.Cancel>
    <AlertDialog.Action asChild>
    <Button variant="destructive" class="" on:click={handleUsernameChange}>
    Change Username
    </Button>
    </AlertDialog.Action>
    </AlertDialog.Footer>
    </AlertDialog.Content>
    </AlertDialog.Portal>
    </AlertDialog.Root></main>
    <!-- {:else}
    <section class="flex justify-center items-center min-h-screen p-4">
    <div class="loading text-5xl">Loading</div>
    </section>
    {/if}
    <style>
    .loading::after {
    content: "";
    animation: dots 1.5s steps(4, end) infinite;
    }
    @keyframes dots {
    0% { content: ""; }
    33% { content: "."; }
    66% { content: ".."; }
    100% { content: "..."; }
    }
    
    </style>
    -->