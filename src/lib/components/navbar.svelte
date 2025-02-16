<script lang="ts">
    import Dropdown from './dropdown.svelte';
    import { Button } from "$lib/components/ui/button";
    import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
    import { User, Menu } from "lucide-svelte";
    import { page } from "$app/stores";
    import {
        Sheet,
        SheetContent,
        SheetTrigger,
    } from "$lib/components/ui/sheet";
    import { onMount } from 'svelte';
    import { authStore } from '../components/stores/AuthStore';
    import { toast } from "svelte-sonner";
    import LoginModal from "./login-modal.svelte";
    import { Motion } from "svelte-motion";

    let isBrowser = false;

    onMount(() => {
        isBrowser = true;
    });

    // Subscribe to authStore to get the current user
    let user: import('@supabase/gotrue-js').User | null = null;
    authStore.subscribe(({ user: currentUser }) => {
        user = currentUser;
    });

    function getInitials(name: string): string {
        if (!name) return '';
        return name
            .split(' ')
            .map((part) => part[0]) // Take the first letter of each word
            .join(''); // Combine them
    }

    $: initials = user ? getInitials(user.email || user.id) : '';

    let left = 0;
    let width = 0;
    let opacity = 0;
    let ref: any;

    let navs = [
        {
            name: "Home",
            link: "/",
        },
        {
            name: "Learning",
            link: "/Learning",
        },
        {
            name: "Quiz",
            link: "/Quiz",
        },
    ];

    let positionMotion = (node: HTMLElement) => {
        let refNode = () => {
            let mint = node.getBoundingClientRect();
            left = node.offsetLeft;
            width = mint.width;
            opacity = 1;
        };
        node.addEventListener("mouseenter", refNode);
        return {
            destroy() {
                node.removeEventListener("mouseenter", refNode);
            },
        };
    };

    function handleLogin(event: { detail: { success: boolean; }; }) {
        if (event.detail.success) {
            toast.success("Logged in successfully!");
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
        // Navigate to the profile page
        // You can use the `goto` function from `$app/navigation` if needed
        // import { goto } from "$app/navigation";
        // goto("/Profile");
        console.log("Navigating to profile");
    }
</script>

{#if isBrowser}
<nav class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20 sticky">
    <div class="container flex h-14 max-w-screen-2xl items-center justify-between">
        <!-- Left Section with Logo and Mobile Menu -->
        <div class="flex items-center w-full md:w-auto justify-between md:justify-start">
            <div class="max-md:hidden w-full mt-14">
                <div class="border-2 border-black bg-white p-1 rounded-full">
                    <a
                        href="/"
                        class="h-12 relative mx-auto flex items-center justify-center w-full rounded-full bg-white p-4 text-xs uppercase text-black font-semibold tracking-wide md:p-6 md:text-base transition duration-300 ease-in-out hover:bg-black hover:text-white focus:outline-none"
                    >
                        <span class="z-10 font-bold">BrandName</span>
                    </a>
                </div>
            </div>
            <a href="/" class="md:hidden flex items-center space-x-2">
                <span class="font-bold text-md">YourBrand</span>
            </a>

            <!-- Mobile Menu Button -->
            <div class="md:hidden">
                <Sheet>
                    <SheetTrigger>
                        <Button variant="ghost" size="icon">
                            <Menu class="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" class="w-72 flex flex-col items-center justify-center p-0">
                        <nav class="flex flex-col items-center justify-center space-y-4 w-full h-full">
                            {#each [
                                { href: "/", label: "Home" },
                                { href: "/Learning", label: "Learning" },
                                { href: "/Quiz", label: "Quiz" }
                            ] as route}
                                <a 
                                    href={route.href}
                                    class={`
                                        w-48 text-center
                                        px-4 py-2 font-bold text-md rounded-full transition-all duration-300
                                        border border-transparent
                                        ${$page.url.pathname === route.href ? 
                                        'border-primary bg-primary/10' : 
                                        'hover:border-primary hover:shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] hover:bg-primary/5'
                                        }
                                    `}
                                >
                                    {route.label}
                                </a>
                            {/each}
                            {#if user}
                            <Button variant="ghost" size="icon" class="relative h-8 w-8 rounded-full mt-14 mr-11">
                                <Dropdown/>
                            </Button>
                        {:else}
                            <div class="w-1/2 mt-2">
                                <div class="border-2 border-black bg-white p-1 rounded-full">
                                    <LoginModal on:login={handleLogin} />
                                </div>
                            </div>
                        {/if}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </div>

        <!-- Desktop Navigation Links -->
        <div class="hidden md:flex flex-1 items-center justify-center space-x-2">
            <div class="w-full mt-14">
                <ul
                    on:mouseleave={() => {
                        width = width;
                        left = left;
                        opacity = 0;
                    }}
                    class="relative mx-auto flex w-fit rounded-full border-2 border-black bg-white p-1"
                >
                    {#each navs as item}
                        <li
                            use:positionMotion
                            class="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-5 md:py-3 md:text-base"
                        >
                            <a href={item.link}>{item.name}</a>
                        </li>
                    {/each}
                    <Motion
                        animate={{
                            left: left,
                            width: width,
                            opacity: opacity,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                        }}
                        let:motion
                    >
                        <li
                            use:motion
                            class="absolute z-0 h-7 rounded-full bg-black md:h-12"
                        ></li>
                    </Motion>
                </ul>
            </div>
        </div>

        <!-- Auth Section -->
        <div class="hidden md:flex items-center justify-end space-x-2">
            {#if user}
                <Button variant="ghost" size="icon" class="relative h-8 w-8 rounded-full mt-14 mr-11">
                    <Dropdown/>
                </Button>
            {:else}
                <div class="py-20 w-full mt-14">
                    <div class="border-2 border-black bg-white p-1 rounded-full">
                        <LoginModal on:login={handleLogin} />
                    </div>
                </div>
            {/if}
        </div>
    </div>
</nav>
{/if}