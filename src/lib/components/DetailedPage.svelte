<!-- src/components/DetailedPage.svelte -->
<script>
    import { fade } from "svelte/transition";
  
    export let onClose;
    /**
	 * @type {any[]}
	 */
     export let meatData;
  
    let searchTerm = '';
  
    function filterMeats() {
      return meatData.filter(meat => 
        meat.japanese.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meat.english.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  </script>
  
  <style>
    .detailed-page {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
      z-index: 10;
    }
  
    .search-bar {
      width: 100%;
      max-width: 600px;
      margin-bottom: 20px;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  
    .meat-list {
      width: 100%;
      max-width: 600px;
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow-y: auto;
      max-height: 500px;
    }
  
    .meat-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
  
    .meat-item:last-child {
      border-bottom: none;
    }
  
    .close-button {
      position: absolute;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      font-size: 16px;
      border: none;
      background-color: #ff4d4f;
      color: white;
      border-radius: 4px;
      cursor: pointer;
    }
  
    .close-button:hover {
      background-color: #ff7875;
    }
  </style>
  
  {#if meatData}
    <div class="detailed-page" in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
      <button class="close-button" on:click={onClose}>Close</button>
      <input
        type="text"
        class="search-bar"
        placeholder="Search meat types..."
        bind:value={searchTerm}
      />
      <div class="meat-list">
        {#each filterMeats() as meat}
          <div class="meat-item">
            <span>{meat.japanese} ({meat.english})</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}