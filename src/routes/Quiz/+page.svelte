<!-- src/routes/learning/+page.svelte -->
<script>
    export let data; // Data passed from the load function
    import CardList from '$lib/components/CardList.svelte';
  </script>
  
  <h1>Learning Cards</h1>
  <CardList cards={data.cards} />
  