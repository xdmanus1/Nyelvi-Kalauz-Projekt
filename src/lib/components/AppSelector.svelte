<!-- src/components/AppSelector.svelte -->
<script lang="ts">
	import { X } from "lucide-svelte";
  import { cubicInOut, expoIn, quintInOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
	import Button from "./ui/button/button.svelte";
  export let cards: never[] = [];

  export let apps: any = [];
  export let openApp = "";
  
  const [send, receive] = crossfade({
    duration: 300,
  });

  function openAppHandler(app: any) {
    openApp = app;
  }

  function closeAppHandler() {
    openApp = "";
  }


</script>

<style>
  .container {
    position: relative;
    height: 100vh;
    width: 100vw;
  }

  .icon {
    position: absolute;
  }

  .app {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(2.5px);
    color: black;
    z-index: 10;
    overflow: hidden; 
  }
  .outlined {
    outline: 2px !important;
        outline-style: solid !important;
        outline-color: black !important;
  }
</style>

<div class="container">
  {#each apps as app}
    {#if openApp !== app.emoji}
      <button
        class="icon transition-all duration-150 ease-in h-12 w-12 md:h-fit md:w-fit"
        style={`top: ${app.where.top}; left: ${app.where.left};`}
        on:click={() => openAppHandler(app.emoji)}
        in:receive={{ key: app.emoji }}
        out:send={{ key: app.emoji }}
      >
        
      <img src="{app.emoji}" alt="" class="h-12 w-12 text-white">
      </button>
    {:else}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="app"
        on:click={closeAppHandler}
        in:receive={{ key: app.emoji }}
        out:send={{ key: app.emoji }}
      >
        <div class="app-content overflow-hidden" on:click={(e) => e.stopPropagation()}>
          <Button class="outlined p-4 border-4 h-auto absolute float-right font-extrabold left-[90%] top-[6rem]" on:click={closeAppHandler}><X /></Button>
          <svelte:component this={app.content.component} {cards} />
        </div>
      </div>
      {/if}
  {/each}
</div>