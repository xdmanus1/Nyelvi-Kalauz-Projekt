<script lang="ts">
  import { onMount } from 'svelte';
  // import { Motion } from "svelte-motion"; // Motion seems unused, commenting out for cleanup unless needed elsewhere
  import FilterComponent from '$lib/components/Filtercomponent.svelte';
  // import { fly } from "svelte/transition"; // fly seems unused
  // import { flyAndScale } from "$lib/utils"; // flyAndScale seems unused
  // import * as Card from "$lib/components/ui/card"; // Card seems unused
  import MagicCard from "$lib/components/MagicCard.svelte";
  import { Volume2 } from "lucide-svelte"; // TTS icon
  import { fit } from 'furigana'; // Import the fit function

  // Import the parser from your furigana parser module (No longer strictly needed for rendering, maybe for TTS fallback?)
  // import { parser } from '$lib/components/parse'; // Let's keep it commented unless a fallback requires it.
  import { Input } from './ui/input'; // Assuming Input is in './ui/input' relative to this component

  // --- Props ---
  export let cards: Array<{
    id: string | number;
    Type: string;
    japanese: string; // e.g., "店", "食べる"
    phonetic: string; // English phonetic representation
    english: string;
    // IMPORTANT: Assumes card.furigana is JUST the reading, e.g., "みせ", "たべる"
    furigana: string;
    category: string; // IMPORTANT: Assumes cards have this property for filtering
    Icon?: string;
    Input?: boolean; // Assuming this is a boolean flag
  }> = [];

  // --- Filter & Search State ---
  const filterOptions = [
    { label: 'Goods', value: 'Goods' },
    { label: 'Phrases', value: 'Phrase' },
    { label: 'Shop Concepts', value: 'Shop Concepts' },
  ];

  let checkedState: boolean[] = filterOptions.map(() => false);
  let searchTerm: string = '';
  let displayedCards: typeof cards = [];

  // Reactive calculation for filtering and searching
  $: {
    let filtered = cards;
    // Ensure cards array is initialized before filtering
    if (cards && cards.length > 0) {
        filtered = filtered.filter(card => card.Type === "shop");
        const selectedFilters = filterOptions
          .filter((_, idx) => checkedState[idx])
          .map(option => option.value);
        if (selectedFilters.length > 0) {
          filtered = filtered.filter(card => selectedFilters.includes(card.category));
        }
        if (searchTerm.trim() !== '') {
          const lowerSearchTerm = searchTerm.toLowerCase();
          filtered = filtered.filter(card =>
            (card.japanese && card.japanese.toLowerCase().includes(lowerSearchTerm)) ||
            (card.phonetic && card.phonetic.toLowerCase().includes(lowerSearchTerm)) ||
            (card.english && card.english.toLowerCase().includes(lowerSearchTerm))
          );
        }
    } else {
        filtered = []; // Handle case where cards might be initially empty/undefined
    }
    displayedCards = filtered;
  }

  // Function called by FilterComponent when a checkbox changes
  function handleCheckboxChange(index: number, checked: boolean) {
    const newCheckedState = [...checkedState];
    newCheckedState[index] = checked;
    checkedState = newCheckedState;
  }
  // --- End of Filter & Search Logic ---

  // --- TTS (Text-to-Speech) Setup ---
  let synth: SpeechSynthesis | null = null;
  let voices: SpeechSynthesisVoice[] = [];
  let japaneseVoice: SpeechSynthesisVoice | null = null;
  let isSpeaking = false;
  let speakingCardId: string | number | null = null;

  function populateVoiceList() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synth = window.speechSynthesis;
      // Use setTimeout to ensure voices are loaded, especially on some browsers
      setTimeout(() => {
          voices = synth!.getVoices();
          // Prioritize Google voice, then non-local, then any Japanese voice
          japaneseVoice = voices.find(voice => voice.lang === 'ja-JP' && voice.name.includes('Google')) ??
                          voices.find(voice => voice.lang === 'ja-JP' && !voice.localService) ??
                          voices.find(voice => voice.lang === 'ja-JP') ?? null;
          if (!japaneseVoice) console.warn("No suitable Japanese voice found.");
          // console.log("Japanese voice set to:", japaneseVoice?.name); // Debugging
      }, 100); // Increased delay slightly

      // Fallback if voices load asynchronously after initial check
      if (synth && synth.getVoices().length === 0) {
          synth.onvoiceschanged = populateVoiceList;
      }
    } else {
      console.error("Speech Synthesis not supported in this browser.");
    }
  }

  onMount(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        synth = window.speechSynthesis;
        // Check if voices are already available
        if (synth.getVoices().length > 0) {
            populateVoiceList();
        } else {
            // If not, wait for the voiceschanged event
            synth.addEventListener('voiceschanged', populateVoiceList, { once: true });
        }

        // Cleanup function
        return () => {
            if (synth?.speaking) synth.cancel();
            // Remove the event listener if it was added
            synth?.removeEventListener('voiceschanged', populateVoiceList);
            // Optional: Clear onvoiceschanged if it was set directly
            // if (synth) synth.onvoiceschanged = null;
        };
    }
  });

  // --- MODIFIED: Simplified function for TTS ---
  // Returns the base Japanese text, which is usually best for pronunciation.
  function getPlainTextForSpeech(baseJapanese: string): string {
    // Basic validation
    if (!baseJapanese) return "";
    return baseJapanese;
  }
  // --- End of TTS text preparation ---

  function speakText(textToSpeak: string, cardId: string | number) {
    // Ensure synth and voice are ready, and text is provided
    if (!synth || !japaneseVoice || !textToSpeak || textToSpeak.trim() === '') {
        console.warn("TTS prerequisites not met:", { hasSynth: !!synth, hasVoice: !!japaneseVoice, text: textToSpeak });
        // Provide user feedback? Maybe disable button is enough.
        return;
    }

    const wasSpeaking = synth.speaking;
    const currentlySpeakingThisCard = speakingCardId === cardId;

    // If we click the button for the card already speaking, stop it.
    if (wasSpeaking && currentlySpeakingThisCard) {
        synth.cancel();
        // State update happens in onend/onerror, which will be triggered by cancel()
        return;
    }
    // If something else is speaking, or nothing is, cancel any existing speech first.
    else if (wasSpeaking) {
        synth.cancel();
        // Clear state immediately for visual feedback, will be set again in onstart
        if (speakingCardId !== null) {
             const previousSpeakingCardId = speakingCardId;
             isSpeaking = false;
             speakingCardId = null;
             // Force UI update if needed, e.g., for the previous card's button state
             displayedCards = displayedCards.map(c => c.id === previousSpeakingCardId ? {...c} : c);
        }
    }


    // Use a timeout to allow cancel() to complete and prevent race conditions
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.voice = japaneseVoice;
        utterance.lang = 'ja-JP'; // Explicitly set lang on utterance
        utterance.rate = 0.9;
        utterance.pitch = 0.9;

        utterance.onstart = () => {
            // console.log(`TTS started for card ${cardId}`); // Debugging
            isSpeaking = true;
            speakingCardId = cardId;
            // Force redraw to update button style immediately
            displayedCards = [...displayedCards];
        };

        utterance.onend = () => {
            // console.log(`TTS ended for card ${cardId}`); // Debugging
            // Ensure this cleanup only happens if this specific utterance ended
            // (relevant if cancel was called rapidly)
            if (speakingCardId === cardId) {
                 isSpeaking = false;
                 speakingCardId = null;
                 // Force redraw to update button style
                 displayedCards = [...displayedCards];
            }
        };

        utterance.onerror = (event) => {
             console.error("Speech synthesis error:", event.error);
             // Ensure cleanup happens even on error
             if (speakingCardId === cardId) {
                 isSpeaking = false;
                 speakingCardId = null;
                 // Force redraw to update button style
                 displayedCards = [...displayedCards];
             }
        };
        // console.log(`Attempting to speak: "${textToSpeak}" with voice: ${japaneseVoice.name}`); // Debugging
        if (synth) {
            synth.speak(utterance);
        } else {
            console.error("Speech synthesis instance is not available.");
        }

    }, wasSpeaking ? 100 : 50); // Use a delay, slightly longer if canceling
  }
  // --- End of TTS Setup ---

  // --- MODIFIED FUNCTION ---
  // Takes base Japanese and the reading (furigana) as input.
  // Uses `fit` to create the intermediate format (e.g., "漢字[かんじ]です").
  // Parses the intermediate format into HTML <ruby> tags.
  function renderFurigana(base: string, reading: string): string {
     // Handle cases where input might be missing
     if (!base) return '';
     if (!reading) return base; // If no reading, just return the base text

     try {
        // Step 1: Use the 'fit' function to generate the formatted string
        const formattedString = fit(base, reading);
        // console.log(`Fit result for ${base} / ${reading}: ${formattedString}`); // Debugging

        // Step 2: Parse the result of 'fit' into HTML <ruby> tags
        const regex = /([^\[\]]+)\[([^\[\]]+)\]|([^\[]+)/g;
        let html = '';
        let match;

        while (formattedString && (match = regex.exec(formattedString)) !== null) {
          if (match[1] && match[2]) {
            // Found base[furi] pair
            html += `<ruby>${match[1]}<rt class="text-base">${match[2]}</rt></ruby>`;
          } else if (match[3]) {
            // Found plain text (like surrounding kana)
            html += match[3];
          }
        }

        // If regex produced no output but there was input, return base as fallback
        if (html === '' && formattedString) return base;

        return html;

     } catch (e) {
        console.error(`Furigana rendering error for base='${base}', reading='${reading}':`, e);
        // Fallback: return just the base text in case of any error
        return base;
    }
  }
  // --- END OF MODIFIED FUNCTION ---

</script>

<style>
  /* Styles remain exactly the same as before */
  .container {
    display: flex;
    flex-direction: column;
    gap: 24px;
   

  }
  /* .custombg {
    position: relative;
    isolation: isolate;
    height: 100%;
    overflow-y: auto;
}

.custombg::before {
    content: '';
    position: absolute; 
    inset: 0; 
    background-image: url("https://images.unsplash.com/photo-1548148870-adbf75452257?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
    background-size: cover;
    background-attachment: local; 
    background-repeat: repeat-y;
    filter: blur(10px);
    z-index: -1;
    opacity: 0.8;
    pointer-events: none;
} */
  .filter-container {
    position: absolute;
    top: 40vh;
    right: 97%;
  }
   @media (min-width: 768px) and (max-width: 1023px) { /* md */
     .filter-container { right: 95%; }
   }
   @media (max-width: 767px) { /* sm */
     .filter-container { right: 97%; }
   }

  #style-1::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: transparent;
  }
  #style-1::-webkit-scrollbar {
    width: 12px;
    background-color: transparent;
  }
  #style-1::-webkit-scrollbar-thumb {
    border-radius: 100px;
    background-color: oklch(0.205 0 0);
  }

  @media (max-width: 1400px) {
    .a1480 {
      width: 100vw !important;
      max-width: 100vw !important;
    }
  }

  .speak-button {
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .speak-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .speak-button.speaking {
    background-color: black;
    border-color: #2EFFBD;
    color: #2EFFBD;
    transform: scale(1.1);
    animation: pulse 1.5s infinite ease-in-out;
  }

   @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(46, 255, 189, 0.7); }
    50% { box-shadow: 0 0 0 8px rgba(46, 255, 189, 0); }
  }

  .japanese-text-span {
      white-space: normal;
      display: inline-block;
      text-align: center;
      line-height: 1.3;
      /* Add max-width if necessary to prevent overflow on very long words */
      /* max-width: 100%; */
  }

  
</style>

<!-- Using original container class p-0 -->
<div class="container p-0 text-white">
  <div class="filter-container text-sm lg:text-base">
    <FilterComponent
      {filterOptions}
      bind:checkedState
      bind:searchTerm
      onCheckboxChange={handleCheckboxChange}
    />
  </div>

  <!-- Using original content structure -->
  <div class="overflow-hidden rounded-xl mt-16 max-lg:mt-[2.9rem]">
     <!-- Using original classes for the scrollable area -->
    <div id="style-1" class="a1480 flex-wrap h-screen lg:h-[80vh] w-[77vw] md:w-[90vw] sm:w-[95vw] bg-black overflow-y-auto rounded-xl p-8 max-w-[80rem] border">
      <h2 class="text-4xl font-bold mb-4 text-center sm:text-3xl">Shop</h2>

      {#if displayedCards.length > 0}
        <!-- Using original grid classes -->
        <div class="grid flex-wrap gap-4 items-stretch justify-center content-start grid-cols-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1">
          {#each displayedCards as card (card.id)}
              <!-- Using exact original MagicCard classes -->
              <MagicCard
                class="min-h-60 flex flex-col items-center justify-center shadow-[0_10px_35px_rgba(0,0,0,0.25)] text-4xl group hover:border-[#2effbd9e] transition-all duration-300 hover:shadow-[#2effbd9e]/40"
                gradientColor="#043634"
                gradientSize={300}
                animin={{ duration: 500, start: 0.7 }}
                animout={{ duration: 500, start: 0.7 }}
              >
                <!-- Card Icon -->
                <div class="justify-center items-center flex gap-1.5 mb-2">
                  {#if card.Icon}
                    <img src={card.Icon} alt="Icon" width="60" />
                  {/if}
                </div>

                <!-- Japanese Text with Furigana -->
                <!-- Ensure whitespace-normal if text can wrap within the card -->
                <div class="group-hover:text-[#2EFFBD] transition-all duration-500 flex flex-col gap-1 justify-center items-center font-semibold text-lg text-center mb-1 w-full px-2"> 

                   <span class="japanese-text-span"><strong>Japanese: </strong>{@html renderFurigana(card.japanese, card.furigana)}</span>
                </div>

                <!-- Phonetic & English -->
                <div class="group-hover:text-[#2EFFBD] transition-all duration-500 flex flex-col gap-1 justify-center items-center font-semibold text-base text-center mb-1 w-full px-2">
                  <p><strong>Phonetic:</strong> {card.phonetic || 'N/A'}</p>
                  <p><strong>English:</strong> {card.english || 'N/A'}</p>
                </div>

                 <!-- Input -->
                {#if card.Input}
                <div class="w-full px-4 mt-2"> 
                  <Input
                    id={`input-${card.id}`}
                    class="rounded-full w-full transition-all duration-150"
                    placeholder="Input"
                  />
                </div>
                {/if}

                <!-- TTS Button -->
                 {#if card.japanese && card.furigana} 
                  {@const textToSpeak = getPlainTextForSpeech(card.japanese)}
                  <!-- Added flex container to center button -->
                  <div class="flex justify-center w-full mt-auto pt-2"> 
                    <button
                      on:click={() => speakText(textToSpeak, card.id)}
                      disabled={!japaneseVoice || textToSpeak === ''} 
                      class="speak-button group-hover:text-[#2EFFBD] transition-all duration-500 flex items-center justify-center text-black font-semibold text-lg hover:scale-125 rounded-full bg-white group-hover:bg-black p-2 border-2 hover:border-[#2EFFBD] border-white {speakingCardId === card.id ? 'speaking' : ''} {(!japaneseVoice || textToSpeak === '') ? 'opacity-50 cursor-not-allowed' : ''}"
                      title={japaneseVoice ? (textToSpeak ? `Speak "${textToSpeak}"` : 'No text to speak') : "Japanese voice not available"}
                    >
                      <Volume2 size={20}/> 
                  </div>
                {/if}
              </MagicCard>
          {/each}
        </div>
      {:else}
         <!-- Original fallback message -->
        <p class="text-center text-xl text-gray-400 mt-10">No cards match your criteria.</p>
      {/if}
    </div>
  </div>
</div>