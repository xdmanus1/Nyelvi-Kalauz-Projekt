<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { User } from "lucide-svelte";
    import LogOut from "lucide-svelte/icons/log-out";
    import { Button } from "./ui/button";
    import { Avatar, AvatarFallback } from "./ui/avatar";
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import { authStore } from '../components/stores/AuthStore';

    let initials: string;
    let username: string;

    // Subscribe to authStore to get the current user
    authStore.subscribe(({ user }) => {
        if (user) {
            username = user.user_metadata.username || '';
            initials = getInitials(user.email || user.id); // Use email or id if username is not available
        } else {
            username = '';
            initials = '';
        }
    });

    function getInitials(name: string): string {
        if (!name) return '';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return parts[0].slice(0, 2) + parts[1][0]; // First two characters of first name and first character of last name
        } else {
            return parts[0].slice(0, 2); // First two characters of the single name
        }
    }

    function logout() {
        authStore.signOut().then(({ error }) => {
            if (error) {
                console.error('Logout error:', error.message);
                toast.error("Failed to log out.");
            } else {
                toast.success("Logged Out successfully!");
            }
        });
    }

    function profile() {
        goto("/Profile");
    }
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        <div class="border-2 border-black bg-white p-1 rounded-full">
            <Button variant="ghost" size="icon" class="relative h-12 w-12 rounded-full">
                <Avatar class="h-12 w-12">
                    <AvatarFallback class="text-black text-lg font-semibold transition duration-300 ease-in-out hover:bg-black hover:text-white focus:outline-none bg-white" aria-label="User avatar">
                        {(username ? username.slice(0, 2) : initials).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </Button>
        </div>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="rounded-[1.4vw]">
        <DropdownMenu.Group>
            <DropdownMenu.Item on:click={profile} class="cursor-pointer rounded-full transition duration-150">
                <User class="mr-2 h-6 w-6" />
                <span>Profile</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item on:click={logout} class="cursor-pointer rounded-full transition duration-150">
                <LogOut class="mr-2 h-6 w-6 text-red-500" />
                <span class="text-red-500">Log Out</span>
            </DropdownMenu.Item>
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root>