<!-- src/routes/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    import { Input } from '$lib/components/ui/input';
    import { Checkbox } from '$lib/components/ui/checkbox';
    const sampleData = [
  { id: 1, name: 'Apple', category: 'Fruit' },
  { id: 2, name: 'Banana', category: 'Fruit' },
  { id: 3, name: 'Carrot', category: 'Vegetable' },
  { id: 4, name: 'Broccoli', category: 'Vegetable' },
  { id: 5, name: 'Chicken', category: 'Meat' },
  { id: 6, name: 'Beef', category: 'Meat' },
];
    
  
    let searchTerm = '';
    let filters = {
      Fruit: false,
      Vegetable: false,
      Meat: false,
    };
    let filteredData = sampleData;
  
    function applyFilters() {
      filteredData = sampleData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = Object.keys(filters).some(category => filters[category] && item.category === category);
        return matchesSearch && (matchesCategory || !Object.values(filters).some(f => f));
      });
    }
  
    onMount(() => {
      applyFilters();
    });
  
    $: searchTerm, filters, applyFilters();
  </script>
  
  <div class="flex">
    <aside class="w-64 bg-gray-100 p-4">
      <div class="mb-4">
        <Input class="text-white" type="text" placeholder="Search..." bind:value={searchTerm} />
      </div>
      <div>
        <h3 class="font-bold mb-2">Categories</h3>
        {#each Object.keys(filters) as category}
          <label class="flex items-center space-x-2 mb-2">
            <Checkbox bind:checked={filters[category]} />
            <span>{category}</span>
          </label>
        {/each}
      </div>
    </aside>
    <main class="p-4 flex-1">
      <h1 class="text-2xl font-bold mb-4">Filtered Data</h1>
      <ul>
        {#each filteredData as item}
          <li class="border-b border-gray-200 py-2">
            <span class="font-bold">{item.name}</span> - {item.category}
          </li>
        {/each}
      </ul>
    </main>
  </div>
  
  <style>
    body {
      font-family: sans-serif;
    }
  </style>