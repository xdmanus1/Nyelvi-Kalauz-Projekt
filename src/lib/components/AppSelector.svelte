<script lang="ts">
  // No Interface Import/Definition Needed (Using any)
  import { X } from "lucide-svelte";
  import { cubicInOut } from "svelte/easing"; // Use desired easing
  import { crossfade } from "svelte/transition";
  import Button from "./ui/button/button.svelte"; // Ensure path is correct
	import { onMount } from "svelte";

  // --- PROPS ---
  export let apps: any[] = [];
  export let cards: any[] = [];

  // --- INTERNAL STATE ---
  let openAppEmoji: string | null = null;

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicInOut, // Apply easing
  });

  // --- EVENT HANDLERS ---
  function openAppHandler(app: any) {
    if (app && typeof app.emoji === 'string') {
      openAppEmoji = app.emoji;
    }
  }

  function closeAppHandler() {
    openAppEmoji = null;
  }

  // --- POSITIONING HELPER ---
  // Returns the style string using the percentage values from parent
  function getPositionStyle(app: any): string {
    if (app && app.where && typeof app.where.top === 'string' && typeof app.where.left === 'string') {
      return `top: ${app.where.top}; left: ${app.where.left};`;
    }
    console.warn(`App missing position data:`, app?.id);
    return `top: 50%; left: 50%;`; // Fallback
    
  }

</script>

<!-- Reintroduce the container similar to the reference -->
<!-- This container spans the viewport and acts as the positioning parent for ICONS -->
<div class="app-selector-container">
  {#each apps as app (app.id)}
    {#if openAppEmoji !== app.emoji}
      <!-- App Icon Button -->
      <button
        id={app.id}
        class="icon bg-white rounded-full"
        style="{getPositionStyle(app)}; --test: '{app.content?.title}'"
        on:click={() => openAppHandler(app)}
        in:receive={{ key: app.emoji }}
        out:send={{ key: app.emoji }}
        aria-label={`Open ${app.content?.title || 'App'}`}
        title={app.content?.title || ''}
        
      >
      <img src={app.emoji} alt={app.content?.title || ""} class="icon-image">
  
      </button>
    {:else}
      <!-- Opened App Overlay (Fixed Position) -->
      <!-- This div is positioned relative to viewport, ignoring the container -->
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
       <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
       <!-- on:click={closeAppHandler}  -->

       <div
       id={`${app.id}-open`}
       class="app-fixed-overlay w-12"
       in:receive={{ key: app.emoji }}
       out:send={{ key: app.emoji }}
       role="dialog" aria-modal="true" aria-labelledby={`${app.id}-title`}
       >
       <h2 id={`${app.id}-title`} class="sr-only">{app.content?.title}</h2>
       <div class="component-host">
               <Button class="close-button max-lg:top-[7.5rem] top-[6rem] left-[90%] relative h-[60px] z-50 border-[3px]" on:click={closeAppHandler} aria-label="Close App">
                 <X size={24}/>
               </Button>
                <svelte:component this={app.content.component} {cards} />
             </div>
          
       </div>
      
    {/if}
  {/each}
</div>

<style>
  /* Container for positioning icons relative to viewport */
  .app-selector-container {
    position: absolute; /* Positioned relative to nearest positioned ancestor (likely page-container or body) */
    top: 0;
    left: 0;
    width: 100%; /* Use % or vw */
    height: 100%; /* Use % or vh */
    /* IMPORTANT: Allow clicks to pass through to the map below */
    pointer-events: none;
    z-index: 5; /* Above map SVG, below fixed overlay */
    /* border: 1px dashed blue; */ /* Debug */
  }

  /* --- Icon Styling --- */
  .icon {
    position: absolute; /* Positioned relative to .app-selector-container */
    /* Apply the top/left percentage via inline style */
    z-index: 6; /* Above container background, below fixed overlay */
    transform: translate(-50%, -80%); /* Center X, connect Y near bottom */
    width: 50px; /* Or use relative units */
    height: 50px;
    cursor: pointer;
    transition: transform 0.2s ease-out;
    border: none; /* Reset button border */
    padding: 0.4rem; /* Reset button padding */
    /* IMPORTANT: Icons themselves MUST be clickable */
    pointer-events: auto;
    /* background-color: rgba(255, 0, 0, 0.3); */ /* Debug */
  }

  .icon:hover {
    transform: translate(-50%, -80%) scale(1.15); /* Scale on hover */
  }
  .icon::after {
  content: var(--test);
  position: absolute;
  top: -80%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 0.75rem;
  background: rgb(0, 0, 0);
  color: white;
  padding: 2px 6px;
  border-radius: 40px;
  margin-top: 4px;
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, 100%);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.icon:hover::after {
  opacity: 1;
  transform: translate(-50%, 4px) scale(1.15);
}

  .icon-image { /* Styling for the img tag inside the button */
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: inherit;
    /* transition: all 0.s ease-out;
    filter: invert(100%) sepia(0%) saturate(201%) hue-rotate(235deg) brightness(108%) contrast(101%); */
  }
  /* .icon-image:hover {
    filter: invert(0%) sepia(6%) saturate(7475%) hue-rotate(285deg) brightness(103%) contrast(106%);
  } */
  /* --- Opened App Overlay Styling --- */
  .app-fixed-overlay {
    position: fixed; /* Relative to viewport */
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;

    backdrop-filter: blur(5px);
    z-index: 100; /* Highest layer */
    overflow: hidden;
    /* IMPORTANT: Allow clicks on the overlay (for closing) */
    pointer-events: auto;
  }

  .app-content-wrapper {
    position: relative;
    width: 90%;
    height: 90%;
    max-width: 1200px;
    max-height: 800px;
    color: #333;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    /* IMPORTANT: Allow clicks within content area */
    pointer-events: auto;
    cursor: default; /* Reset cursor */
  }

 .component-host {
    flex-grow: 1;
    overflow-y: auto;
 }

  .close-button {
    position: absolute;
    top: 2.3rem;
    right: 2rem;
    z-index: 15;
    width: 6rem;
    height: 6rem;
  }

  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }

</style>