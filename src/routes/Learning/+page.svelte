<script>
    // Define the buildings and their positions
    const buildings = [
      { id: 1, name: "Pokémon Center", x: 100, y: 150 },
      { id: 2, name: "Pokémon Mart", x: 300, y: 200 },
      { id: 3, name: "Gym", x: 500, y: 100 },
      { id: 4, name: "Lab", x: 400, y: 300 },
    ];
  
    /**
	 * @param {{ id?: number; name: any; x?: number; y?: number; }} building
	 */
    function handleButtonClick(building) {
      alert(`You clicked on ${building.name}`);
    }
  </script>
  
  <style>
    .map {
      width: 100%;
      height: auto;
    }
  </style>
  
  <svg class="map" viewBox="0 0 600 400">
    <!-- Background map -->
    <rect width="100%" height="100%" fill="#a3d8f4" />
    <circle cx="100" cy="150" r="30" fill="#ff6666" />
    <circle cx="300" cy="200" r="30" fill="#66ff66" />
    <rect x="450" y="70" width="100" height="100" fill="#ffcc00" />
    <rect x="350" y="250" width="100" height="100" fill="#66ccff" />
  
    {#each buildings as building}
      <foreignObject x={building.x - 50} y={building.y - 50} width="100" height="100">
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          class="absolute bg-yellow-400 rounded-full p-2 cursor-pointer hover:bg-yellow-500 transition"
          on:click={() => handleButtonClick(building)}
        >
          {building.name}
        </div>
      </foreignObject>
    {/each}
  </svg>
  