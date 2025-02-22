<script>
// @ts-nocheck

  import AppSelector from '$lib/components/AppSelector.svelte';
  import BirdApp from '$lib/components/BirdApp.svelte';
  import DogApp from '$lib/components/DogApp.svelte';
  import CatApp from '$lib/components/BirdApp.svelte';

  // Instead of exporting an empty array, grab cards from the load function data.
  export let data;
  const { cards } = data;

  let apps = [
    { 
      emoji: "🐦", 
      where: { top: '10%', left: '10%' }, 
      content: { 
        title: "Bird App", 
        description: "Welcome to the Bird App!",
        component: BirdApp
      } 
    },
    { 
      emoji: "🐱", 
      where: { top: '20%', left: '20%' }, 
      content: { 
        title: "Cat App", 
        description: "Welcome to the Cat App!",
        component: CatApp
      } 
    },
    { 
      emoji: "🐶", 
      where: { top: '30%', left: '30%' }, 
      content: { 
        title: "Dog App", 
        description: "Welcome to the Dog App!",
        component: DogApp
      } 
    },
    // Add more apps as needed
  ];
</script>

<div class="budy">
  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ullam ab, obcaecati deleniti blanditiis placeat dolor quos debitis neque iste repellendus facere quidem magnam sint commodi, deserunt, in eos maiores fugiat.
  <AppSelector {apps} cards={cards} />
</div>

<style>
  .budy{
    background-image: url('$lib/components/map.png');
    margin-top: -5.1rem;
  }
</style>
