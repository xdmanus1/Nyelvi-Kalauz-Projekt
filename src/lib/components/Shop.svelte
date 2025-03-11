<!-- src/components/BirdApp.svelte -->

<script lang="ts">
    import { Motion } from "svelte-motion";
    import FilterComponent from '$lib/components/Filtercomponent.svelte';
    import { fly } from "svelte/transition";
    import { flyAndScale } from "$lib/utils";
    import * as Card from "$lib/components/ui/card";
    import MagicCard from "$lib/components/MagicCard.svelte";
    import nig from "$lib/components/map.png";
    import { supabase } from "$lib/supabaseClient";
	import { Play } from "lucide-svelte";
    
    // Filter component properties
    const filterOptions = [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ];
    
    export let cards: string | any[] = [];
  console.log(cards);
  
  
    const allItems = [
      { id: 1, name: 'Item 1', category: 'option1' },
      { id: 2, name: 'Item 2', category: 'option2' },
      { id: 3, name: 'Item 3', category: 'option3' },
      { id: 4, name: 'Item 4', category: 'option1' },
      { id: 5, name: 'Item 5', category: 'option2' },
      { id: 6, name: 'Item 6', category: 'option3' },
      { id: 7, name: 'Item 6', category: 'option3' },
      { id: 8, name: 'Item 6', category: 'option3' },
      { id: 9, name: 'Item 6', category: 'option3' },
      { id: 10, name: 'Item 6', category: 'option3' },
      { id: 11, name: 'Item 6', category: 'option3' },
      { id: 12, name: 'Item 6', category: 'option3' },
      { id: 13, name: 'Item 6', category: 'option3' },
      { id: 14, name: 'Item 6', category: 'option3' },
      { id: 15, name: 'Item 6', category: 'option3' },
      { id: 16, name: 'Item 6', category: 'option3' },
      { id: 17, name: 'Item 6', category: 'option3' },
      { id: 18, name: 'Item 6', category: 'option3' },
      { id: 19, name: 'Item 6', category: 'option3' },
      { id: 20, name: 'Item 6', category: 'option3' },
      { id: 21, name: 'Item 6', category: 'option3' },
      { id: 22, name: 'Item 6', category: 'option3' },
      { id: 24, name: 'Item 6', category: 'option3' },
      { id: 25, name: 'Item 6', category: 'option3' },
      { id: 26, name: 'Item 6', category: 'option3' },
      { id: 27, name: 'Item 6', category: 'option3' },
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
    let audio: HTMLAudioElement;
  let isPlaying = false;

  function togglePlay() {
    if (audio.paused) {
      audio.play();
      isPlaying = true;
    } else {
      audio.pause();
      isPlaying = false;
    }
  }

  // Function to check if a character is Kanji
  function isKanji(c: string) {
    const code = c.charCodeAt(0);
    return code >= 0x4e00 && code <= 0x9faf; // Unicode range for Kanji
  }
  
  // Function to extract furigana for a given Kanji
  function getFuriganaForKanji(japanese: string, furigana: string | null | undefined): Record<string, string> {
    furigana = furigana ?? "";
    const furiganaMap: Record<string, string> = {};
    let furiganaIndex = 0;
  
    for (let i = 0; i < japanese.length; i++) {
      const char = japanese[i];
      if (isKanji(char)) {
        let end = i + 1;
        while (end < japanese.length && !isKanji(japanese[end])) {
          end++;
        }
        const segmentLength = end - i;
        const kanaSegment = furigana.slice(furiganaIndex, furiganaIndex + segmentLength);
        furiganaMap[char] = kanaSegment;
        furiganaIndex += segmentLength;
      }
    }
    return furiganaMap;
  }
  
  </script>
  
  <style>
    .container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  
    .filter-container {
      /* Ensure the filter component is positioned correctly */
      position: absolute;
      top: 40vh;
    }
  
    #style-1::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.0);
      border-radius: 10px;
      background-color: transparent;
    }
  
    #style-1::-webkit-scrollbar {
      width: 12px;
      background-color: transparent;
      height: 12px;
    }
  
    #style-1::-webkit-scrollbar-thumb {
      border-radius: 100px;
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.0);
      background-color: oklch(0.205 0 0);
    }
  </style>
  
  <div class="container p-0 text-white">
    <div class="filter-container right-[97%]">
      <FilterComponent
        {filterOptions}
        {checkedState}
        onCheckboxChange={handleCheckboxChange}
      />
    </div>
    <div class="overflow-hidden rounded-xl mt-16">
      <div id="style-1" class="flex-wrap h-[80vh] w-[77vw] overflow-y-auto rounded-xl bg-[#000000] p-8 max-w-[80rem] border">
        <h2 class="text-4xl font-bold mb-4 text-center">Shop</h2>
        {#if cards.length > 0}
          <div class="grid flex-wrap gap-4 items-center justify-center content-center grid-cols-4">
            {#each cards as card}
            {#if card.Type == "shop"}
              <MagicCard
                class="min-h-60 flex-col items-center justify-center shadow-[0_10px_35px_rgba(0,0,0,0.25)]  whitespace-nowrap text-4xl group hover:border-[#2effbd9e] transition-all duration-300 hover:shadow-[#2effbd9e]/40"
                gradientColor="#043634"
                gradientSize={300}
                animin={{ duration: 500, start: 0.7 }}
                animout={{ duration: 500, start: 0.7 }}
              >
              <div class="justify-center items-center flex gap-1.5">
                {#if card.Icon}
                  <img src={card.Icon} alt="Icon" width="80" />
                {/if}
              </div>
                <div class="group-hover:text-[#2EFFBD] transition-all duration-500 flex gap-1.5 justify-center items-center font-semibold text-lg">
                  <p><strong>Japanese:</strong>
                    {#each card.japanese.split('') as char}
                      {#if isKanji(char)}
                        <ruby>
                          {char}
                          {#if card.furigana}
                            <rt>{getFuriganaForKanji(card.japanese, card.furigana)[char]}</rt>
                          {/if}
                        </ruby>
                      {:else}
                        {char}
                      {/if}
                    {/each}
                  </p>
                </div>
                <div class="group-hover:text-[#2EFFBD] transition-all duration-500 flex gap-1.5 justify-center items-center font-semibold text-lg">
                    <p><strong>Phonetic:</strong> {card.phonetic}</p> 
                </div>
                <div class="group-hover:text-[#2EFFBD] transition-all duration-500 flex gap-1.5 justify-center items-center font-semibold text-lg">
                    <p><strong>English:</strong> {card.english}</p> 
                  </div>
                  {#if card.audioUrl}
                        <audio bind:this={audio} src={card.audioUrl}></audio>
                        <button on:click={togglePlay} class="group-hover:text-[#2EFFBD] transition-all duration-500 flex gap-1.5 justify-center items-center text-black font-semibold text-lg hover:scale-125 ml-[37%] mt-2 rounded-full bg-white group-hover:bg-black  p-2 border-2 hover:border-[#2EFFBD] border-white">
                          <Play/>
                        </button>
                      {/if}
                  {#if card.input}
                  input
                  {/if}
              </MagicCard>
              {/if}
            {/each}
          </div>
        {:else}
          <p>No cards found.</p>
        {/if}
      </div>
    </div>
  </div>