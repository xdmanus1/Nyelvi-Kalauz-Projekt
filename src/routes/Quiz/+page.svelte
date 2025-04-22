<!-- src/routes/memory/+page.svelte -->
<script lang="ts">
	import MemoryGameSystem from '$lib/components/MemoryGame.svelte';
	import type { PageData } from './$types'; // Assuming data loaded in +page.server.ts

	export let data: PageData; // Contains { cards: [...] } loaded from server

	// OR: Client-side fetch
	// import { onMount } from 'svelte';
	// import { supabase } from '$lib/supabaseClient'; // Your Supabase client instance
	// let cards = [];
	// let loading = true;
	// onMount(async () => {
	//     const { data: fetchedCards, error } = await supabase.from('your_table_name').select('*');
	//     if (error) console.error('Error fetching cards:', error);
	//     else cards = fetchedCards || [];
	//     loading = false;
	// });

</script>
<!-- 
<svelte:head>
	<title>Memory Game</title>
</svelte:head> -->

<div class="container mx-auto py-12">
	

    <!-- {#if loading}
        <p class="text-center">Loading cards...</p>
    {:else if cards && cards.length > 0} -->
    {#if data.cards && data.cards.length > 0}
		<MemoryGameSystem cards={data.cards} />
	{:else}
		<p class="text-center text-muted-foreground">Loading game data or no cards available...</p>
	{/if}
</div>