<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { fade, fly, slide } from "svelte/transition";

    let isLogin = true;
    let username = "";
    let password = "";
    let email = "";

    function handleSubmit() {
        console.log(isLogin ? "Logging in..." : "Registering...");
        console.log({ username, password, email });
    }

    function toggleForm() {
        isLogin = !isLogin;
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
    >
        <!-- Wrapping the content with a container for height animation -->
        <div
            class="transition-container"
            style="overflow: hidden; transition: height 0.4s ease;"
            style:height={isLogin ? "300px" : "400px"} 
        >
            <Dialog.Header class="flex flex-col items-center">
                <Dialog.Title class="text-2xl font-semibold">
                    <span out:fade={{ duration: 300 }}
                    in:fade={{ duration: 300, delay: 300 }}>{isLogin ? "Login" : "Register"}</span>
                    
                </Dialog.Title>
                
                <Dialog.Description
    class="text-sm text-gray-500 mt-2 transition-container"
>
    {#key isLogin}
        <span 
            class="transition-text"
            style="--position: {isLogin ? '20%' : '15%'}"
            out:fade={{ duration: 300 }}
            in:fade={{ duration: 300, delay: 300 }}
        >
            {isLogin
                ? "Welcome back! Please login to your account."
                : "Create a new account to get started."}
        </span>
    {/key}
</Dialog.Description>
            </Dialog.Header>
            <div class="my-4 mt-6">
                <form on:submit|preventDefault={handleSubmit} class="grid gap-4">
                    <div class="space-y-4">
                        {#if !isLogin}
                            <!-- Adding fly animation for the email field -->
                            <div in:fly={{ duration: 500, x: -100, delay: 200 }} out:fly={{ duration: 500, x: 100 }}>
                                <div class="grid gap-2">
                                    <Label for="email" class="text-sm font-medium">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        bind:value={email}
                                        class="rounded-full w-full"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>
                        {/if}

                        <div class="grid gap-2">
                            <Label for="username" class="text-sm font-medium">Username</Label>
                            <Input
                                id="username"
                                bind:value={username}
                                class="rounded-full w-full"
                                placeholder={isLogin ? "Enter your username" : "Choose a username"}
                            />
                        </div>
                        <div class="grid gap-2">
                            <Label for="password" class="text-sm font-medium">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                bind:value={password}
                                class="rounded-full w-full"
                                placeholder={isLogin ? "Enter your password" : "Choose a password"}
                            />
                        </div>
                    </div>
                </form>
            </div>

            <Dialog.Footer class="flex items-center mb-4 flex-col">
                <Button
                    type="submit"
                    on:click={handleSubmit}
                    class="z-20 font-bold h-12 relative mx-auto flex items-center justify-center w-full rounded-full 
                        bg-white p-4 text-xs uppercase text-black tracking-wide md:p-4 md:text-sm 
                        transition duration-300 ease-in-out hover:bg-black border-white border-2 
                        hover:text-white focus:outline-none mb-4"
                >
                    {isLogin ? "Login" : "Register"}
                </Button>

                <p class="text-sm text-center">
                    {#key isLogin}
                        <span transition:fade={{ duration: 200 }}>
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                on:click={toggleForm}
                                class="text-blue-500 hover:underline focus:outline-none ml-1"
                            >
                                {isLogin ? "Register" : "Login"}
                            </button>
                        </span>
                    {/key}
                </p>
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
</style>
