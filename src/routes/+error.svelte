<script>
    export let error;
</script>

<main>
    <h1>Oops!</h1>
    <p>Something went wrong.</p>
    {#if error}
        <p><strong>Error:</strong> {error.message}</p>
    {/if}
    <a href="/">Go back to the homepage</a>
</main>

<style>
    main {
        text-align: center;
        padding: 2rem;
    }
    h1 {
        color: #ff0000;
    }
    a {
        color: #0070f3;
        text-decoration: none;
    }
    a:hover {
        text-decoration: underline;
    }
</style> 
