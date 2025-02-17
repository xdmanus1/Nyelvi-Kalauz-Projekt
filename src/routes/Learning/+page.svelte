<!-- src/App.svelte -->
<script>
  import AppSelector from '$lib/components/AppSelector.svelte';
  import BirdApp from '$lib/components/BirdApp.svelte';
  import DogApp from '$lib/components/DogApp.svelte';
  import CatApp from '$lib/components/BirdApp.svelte';
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

<AppSelector {apps} />