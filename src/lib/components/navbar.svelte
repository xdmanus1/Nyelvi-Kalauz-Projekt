<script lang="ts">
    import Dropdown from './dropdown.svelte';
    import { Button } from "$lib/components/ui/button";
    import { User, Menu } from "lucide-svelte";
    import { page } from "$app/stores";
    import { goto } from '$app/navigation';
    import {
        Sheet,
        SheetContent,
        SheetTrigger,
    } from "$lib/components/ui/sheet";
    import { onMount } from 'svelte';
    import { authStore, type AuthState } from './stores/AuthStore';
    import { toast } from "svelte-sonner";
    import LoginModal from "./login-modal.svelte";
    import { Motion } from "svelte-motion";

    let isBrowser = false;

    onMount(() => {
        isBrowser = true;
    });

    const authState = authStore;
    $: user = $authState.user;
    $: initials = user ? getInitials(user.email || user.id) : '';
    $: learningLink = $authState.lastVisitedAppId
        ? `/?openApp=${encodeURIComponent($authState.lastVisitedAppId)}`
        : '/';

    let navs = [
        { name: "Home", link: "/", isLearningLink: false },
        { name: "Learning", link: "/", isLearningLink: true },
        { name: "Quiz", link: "/Quiz", isLearningLink: false },
    ];

    $: {
        navs = navs.map(nav => {
            if (nav.isLearningLink) {
                return { ...nav, link: learningLink };
            }
            return nav;
        });
    }

    function getInitials(name: string): string {
        if (!name) return '';
        return name.split(' ').map((part) => part[0]).join('');
    }

    let left = 0;
    let width = 0;
    let opacity = 0;
    let motionRef: HTMLElement | null = null;

    let positionMotion = (node: HTMLElement) => {
        const handleMouseEnter = () => {
            if (!node || !motionRef) return;
            const rect = node.getBoundingClientRect();
            const parentRect = motionRef.getBoundingClientRect();
            left = rect.left - parentRect.left + motionRef.scrollLeft;
            width = rect.width;
            opacity = 1;
        };
        node.addEventListener("mouseenter", handleMouseEnter);
        return {
            destroy() {
                node.removeEventListener("mouseenter", handleMouseEnter);
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
                goto('/');
            }
        });
    }

    function profile() {
        console.log("Navigating to profile");
    }

    function handleLearningClick(event: MouseEvent) {
        event.preventDefault();
        const targetUrl = learningLink;
        console.log("Navbar: handleLearningClick triggered. Navigating to:", targetUrl);
        goto(targetUrl);
    }

</script>

{#if isBrowser}
<nav class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20 sticky top-0">
    <div class="container relative flex h-14 max-w-screen-2xl items-center justify-between">
        <!-- Left Section -->
        <div class="flex items-center w-full lg:w-auto justify-between lg:justify-start">
            <!-- Logos -->
            <div class="max-lg:hidden w-full mt-14">
                <div class="border-2 border-black bg-white p-1 rounded-full">
                    <a href="/" class="h-12 relative mx-auto flex items-center justify-center w-full rounded-full bg-white p-4 text-xs uppercase text-black font-semibold tracking-wide md:p-6 md:text-base transition duration-300 ease-in-out hover:bg-black hover:text-white focus:outline-none">
                        <span class="z-10 font-bold">Phrase Passport</span>
                    </a>
                </div>
            </div>
            <a href="/" class="lg:hidden flex items-center space-x-2">
                <span class="font-bold text-md">Phrase Passport</span>
            </a>

            <!-- Mobile Menu Button -->
            <div class="lg:hidden">
                <Sheet>
                    <SheetTrigger asChild let:builder>
                         <Button variant="ghost" size="icon" builders={[builder]}>
                            <Menu class="h-5 w-5" />
                            <span class="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" class="w-72 flex flex-col items-center justify-center p-0">
                        <nav class="flex flex-col items-center justify-center space-y-4 w-full h-full">
                            <a href="/"
                               class="..."
                               aria-current={$page.url.pathname === '/' && !$page.url.searchParams.has('openApp') ? 'page' : undefined}>
                               Home
                            </a>
                            <a href={learningLink}
                               on:click={handleLearningClick} 
                               class="..."
                               aria-current={$page.url.searchParams.has('openApp') ? 'page' : undefined}>
                               Learning
                            </a>
                            <a href="/Quiz"
                               class="..."
                               aria-current={$page.url.pathname === '/Quiz' ? 'page' : undefined}>
                               Quiz
                            </a>

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
        <div class="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center space-x-2">
            <div class="w-full mt-14">
                <ul
                    on:mouseleave={() => { opacity = 0; }}
                    class="relative mx-auto flex w-fit rounded-full border-2 border-black bg-white p-1"
                    bind:this={motionRef}
                >
                    {#each navs as item (item.name)}
                        <li
                            use:positionMotion
                            class="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-5 md:py-3 md:text-base"
                        >
                            {#if item.isLearningLink}
                                <a href={item.link}
                                   on:click={handleLearningClick} 
                                   aria-current={$page.url.searchParams.has('openApp') ? 'page' : undefined}
                                >
                                    {item.name}
                                </a>
                            {:else}
                                <a href={item.link}
                                   aria-current={$page.url.pathname === item.link ? 'page' : undefined}
                                >
                                    {item.name}
                                </a>
                            {/if}
                        </li>
                    {/each}
                    <Motion
                        animate={{ left, width, opacity }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        let:motion
                    >
                        <li use:motion class="absolute z-0 h-7 rounded-full bg-black md:h-12" aria-hidden="true"></li>
                    </Motion>
                </ul>
            </div>
        </div>

        <!-- Auth Section -->
        <div class="hidden lg:flex items-center justify-end space-x-2">
            {#if user}
                <Button variant="ghost" size="icon" class="relative h-8 w-8 rounded-full mt-14 mr-11">
                    <Dropdown/>
                </Button>
            {:else}
                <div class="w-full mt-14">
                    <div class="border-2 border-black bg-white p-1 rounded-full">
                        <LoginModal on:login={handleLogin} />
                    </div>
                </div>
            {/if}
        </div>
    </div>
</nav>
{/if}
