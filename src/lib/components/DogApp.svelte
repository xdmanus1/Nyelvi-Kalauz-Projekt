<script lang="ts">
    import { Motion } from "svelte-motion";
    import FilterComponent from '$lib/components/Filtercomponent.svelte';
	import { fly } from "svelte/transition";
	import { flyAndScale } from "$lib/utils";
  
  
    // Filter component properties
    const filterOptions = [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ];
  
    const allItems = [
      { id: 1, name: 'Item 1', category: 'option1' },
      { id: 2, name: 'Item 2', category: 'option2' },
      { id: 3, name: 'Item 3', category: 'option3' },
      { id: 4, name: 'Item 4', category: 'option1' },
      { id: 5, name: 'Item 5', category: 'option2' },
    ];
  
    let checkedState: boolean[] = filterOptions.map(() => false);
    let filteredItems = allItems;
  
    function handleCheckboxChange(index: number, checked: boolean) {
      checkedState[index] = checked;
      const selectedFilters = filterOptions
        .filter((_, idx) => checkedState[idx])
        .map(option => option.value);
  
      if (selectedFilters.length === 0) {
        filteredItems = allItems;
      } else {
        filteredItems = allItems.filter(item => selectedFilters.includes(item.category));
      }
  
      console.log(`Filtered Items:`, filteredItems);
    }
  

	function FadeandScale(arg0: HTMLLIElement, arg1: { y: number; duration: number; }): __sveltets_2_SvelteTransitionReturnType {
		throw new Error("Function not implemented.");
	}
</script>
  

      <FilterComponent
        {filterOptions}
        {checkedState}
        onCheckboxChange={handleCheckboxChange}
      />

      
        <div class="">
        <h2 class="text-2xl font-bold mb-4">Filtered Items</h2>
        <ul class="list-disc pl-6 h-32">
          {#each filteredItems as item (item.id)}
            
              <li in:flyAndScale="{{ y: -20, duration: 300, start: 0.4}}"
              out:flyAndScale="{{ y: 20, duration: 300, start: 0.4 }}" class=" whitespace-pre tracking-tighter ">
                {item.name} - Category: {item.category}
              </li>
            
          {/each}
        </ul>
      </div>
    

  