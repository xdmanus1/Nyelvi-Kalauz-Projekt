<!-- src/components/AppSelector.svelte -->
<script lang="ts">
  import { cubicInOut, expoIn, quintInOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";

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
    background-color: white;
    color: black;
    z-index: 10;
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
        {app.emoji}
      </button>
    {:else}
      <div
        class="app"
        in:receive={{ key: app.emoji }}
        out:send={{ key: app.emoji }}
      >
        <div class="app-content">
          <h1>{app.content.title}</h1>
          <p>{app.content.description}</p>
          <button on:click={closeAppHandler}>Close</button>
          <svelte:component this={app.content.component} />
        </div>
      </div>
    {/if}
  {/each}
</div>