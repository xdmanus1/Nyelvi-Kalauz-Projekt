<!-- src/lib/components/CardList.svelte -->
<script>
    /**
	 * @type {string | any[]}
	 */
     export let cards = [];
  </script>
  
  {#if cards.length > 0}
    <ul>
      {#each cards as card}
        <li class="card">
          {#if card.Icon}
            <img src={card.Icon} alt="Icon" width="50" />
          {/if}
          <div class="card-info">
            <p><strong>Japanese:</strong> {card.japanese}</p>
            <p><strong>Phonetic:</strong> {card.phonetic}</p>
            <p><strong>English:</strong> {card.english}</p>
            {#if card.audioUrl}
              <audio controls src={card.audioUrl}></audio>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <p>No cards found.</p>
  {/if}
  
  <style>
    .card {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
    }
    .card-info {
      margin-left: 1rem;
    }
  </style>
  