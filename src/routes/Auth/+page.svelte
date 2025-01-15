<script>
	import { Avatar, LightSwitch } from "@skeletonlabs/skeleton";

    let username = '';
    let password = '';

    function handleSubmit() {
        alert(`Username: ${username}, Password: ${password}`);
    }
</script>

<main>
    <h1>Login</h1> 
    <button type="button" class="btn variant-filled">Button</button>
    <LightSwitch />
    <Avatar src="https://images.unsplash.com/photo-1617296538902-887900d9b592?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzExMDB8&ixlib=rb-4.0.3&w=128&h=128&auto=format&fit=crop" width="w-32" rounded="rounded-full" />
    <form on:submit|preventDefault={handleSubmit}>
        <div>
            <label for="username">Username:</label>
            <input type="text" id="username" bind:value={username} />
        </div>
        <div>
            <label for="password">Password:</label>
            <input type="password" id="password" bind:value={password} />
        </div>
        <button type="submit">Login</button>
    </form>
</main>

