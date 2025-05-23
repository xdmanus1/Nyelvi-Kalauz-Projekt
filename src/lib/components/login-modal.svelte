<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { fade, fly, scale, slide, draw } from "svelte/transition";
    import Navbar from "./navbar.svelte";
    import { authStore } from './stores/AuthStore';
    import { toast } from "svelte-sonner";
	import { Eye, EyeClosed } from "lucide-svelte";
    import { AnimatePresence, Motion } from 'svelte-motion';
	import { flyAndScale } from "$lib/utils";


    let isLogin = true;
    let password = "";
    let email = "";
    let username = "";
    let showPassword = false;

    $: fadeClass = isLogin ? "fade-in" : "fade-out";

    async function handleSubmit() {
        if (isLogin) {
            // Login logic
            const { user, error } = await authStore.signIn(email, password);
            if (error) {
                console.error("Login error:", error.message);
                if (error.message === "missing email or phone") {
                    toast.error("Please enter your email address and try again.");
                    
                }
                if (error.message === "Invalid login credentials") {
                    toast.error("Invalid email or password. Please try again.");
                }
            } else {
                console.log("Logged in successfully!", user);
                toast.success("Logged in successfully!");
            }
        } else {
            // Registration logic
            const { user, error } = await authStore.signUp(email, password, username);
            if (error) {
                console.error("Registration error:", error.message);
                toast.error("Registration failed. Please try again.");
                           } else {
                console.log("Registered successfully!", user);
                toast.success("Registration successful! Please check your email for verification.");
            }
        }
    }

    function toggleForm() {
        isLogin = !isLogin;
    }

    function togglePasswordVisibility() {
        showPassword = !showPassword;
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            handleSubmit();
        }
    }
</script>

<Dialog.Root>
    <Dialog.Trigger
        class="z-10 font-bold h-12 relative mx-auto flex items-center justify-center w-full rounded-full 
               bg-white p-4 text-xs uppercase text-black tracking-wide md:p-6 md:text-base 
               transition duration-300 ease-in-out hover:bg-black hover:text-white focus:outline-none"
    >
        {isLogin ? "LOGIN" : "REGISTER"}
    </Dialog.Trigger>
    <Dialog.Content
        class="sm:max-w-[425px] w-full max-w-full rounded-xl overflow-hidden p-6"
        transitionConfig={{ y: 100 }}
    >
        <!-- Wrapping the content with a container for height animation -->
        <div
            class="transition-container"
            style="overflow: hidden; transition: height 0.3s ease;"
            style:height={isLogin ? "300px" : "400px"} 
            transition:scale={{ duration: 400 }}
        >
            <Dialog.Header class="flex flex-col items-center">
                <Dialog.Title class="text-2xl font-semibold">
                    {#key isLogin}
                    <span class="login-title"
                    style="--position: {isLogin ? '9%' : '8%'}"
                    in:scale={{ duration: 300, delay: 100 }}>{isLogin ? "Login" : "Register"}</span>
                    {/key}
                </Dialog.Title>
                <Dialog.Description
                    class="text-sm text-gray-500 mt-2 transition-container"
                >
                    {#key isLogin}
                    <span 
                        class="transition-text"
                        style="--position: {isLogin ? '20%' : '15%'}"
                        in:scale={{ duration: 300, delay: 100 }}
                    >
                        {isLogin
                            ? "Welcome back! Please login to your account."
                            : "Create a new account to get started."}
                    </span>
                    {/key}
                </Dialog.Description>
            </Dialog.Header>
            <div class="my-4 mt-[4.5rem]">
                <form on:submit|preventDefault={handleSubmit} class="grid gap-4">
                    <div class="space-y-4">
                        {#if !isLogin}
                            <div in:scale={{ duration: 300, delay: 200 }} out:scale={{ duration: 400, opacity: 0 }}>
                                <div class="grid gap-2">
                                    <Label for="username" class="text-sm font-medium">Username</Label>
                                    <Input
                                        id="username"
                                        bind:value={username}
                                        class="rounded-full w-full transition-all duration-150"
                                        placeholder="Choose a username"
                                        on:keydown={handleKeyDown}
                                    />
                                </div>
                            </div>
                        {/if}
                        <div class="grid gap-2">
                            <Label for="email" class="text-sm font-medium">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                bind:value={email}
                                class="rounded-full w-full transition-all duration-150"
                                placeholder="Enter your email"
                                on:keydown={handleKeyDown}
                            />
                        </div>
                        <div class="grid gap-2">
                            <Label for="password" class="text-sm font-medium">Password</Label>
                            <div class="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    bind:value={password}
                                    class="rounded-full w-full pr-10 transition-all duration-150"
                                    placeholder={isLogin ? "Enter your password" : "Choose a password"}
                                    on:keydown={handleKeyDown}
                                />
                                {#key showPassword}
                                    
                                <button
                                type="button"
                                on:click={togglePasswordVisibility}
                                in:flyAndScale={{ duration: 400, y: 40, start: 0.1 }} out:flyAndScale={{ duration: 400, y: -40, start: 0.1 }}
                                class="absolute inset-y-0 right-0 flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:outline-none focus:border-0 transition-all duration-150"
                                >
                                {#if showPassword}
                                <EyeClosed />
                                {:else}
                                <Eye />
                                {/if}
                                
                                
                            </button>
                            {/key}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <Dialog.Footer class="flex flex-row items-center mb-2">
                {#key isLogin}
                <div class={` grow basis-1/2 mr-6 md:mr-[1px]`}>
                    <Button
                        type="submit"
                        on:click={handleSubmit}
                        class="z-20 font-bold h-12 relative mx-auto flex items-center justify-center w-full rounded-full 
                               bg-white p-4 text-xs uppercase text-black tracking-wide md:p-4 md:text-sm 
                               transition duration-300 ease-in-out hover:bg-black border-white border-2 
                               hover:text-white focus:outline-none mb-4"
                    >
                        <span class="transition-all">{isLogin ? "Login" : "Register"}</span>
                    </Button>
                </div>
                {/key}
                {#key isLogin}
                <p class="text-sm text-center basis-2/2">
                    <span>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            on:click={toggleForm}
                            class="text-blue-500 hover:underline focus:outline-none ml-1"
                        >
                            {isLogin ? "Register" : "Login"}
                        </button>
                    </span>
                </p>
                {/key}
            </Dialog.Footer>
        </div>
    </Dialog.Content>
</Dialog.Root>

<style>
    .transition-container {
        width: 100%; /* Full width of the dialog */
    }
    .transition-container {
        position: relative;
        min-height: 60px; /* Adjust based on your needs */
    }
    .login-title {
        position: absolute;
        width: 100%;
        text-align: center;
        top: var(--position);
        transform: translateY(-100%);
        opacity: 1;
        transition: top 0.3s ease;
        left: 0;
    }
    .transition-text {
        position: absolute;
        width: 100%;
        text-align: center;
        top: var(--position);
        transform: translateY(-100%);
        opacity: 1;
        transition: top 0.3s ease;
        left: 0;
    }
    .fade-in {
        opacity: 1;
        transition: opacity 0.5s ease-in;
    }
    .fade-out {
        opacity: 0;
        transition: opacity 0.5s ease-out;
    }
</style>