<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let initialValue: number = 0; // Prop with default value 1. what we call in the parent, 2. type, 3. start thing
    export let maxValue: number = 10;
    $: max = maxValue; // Reacts to parent prop changes
    let num: number = initialValue;     
    // Initialize with prop
    const dispatch = createEventDispatcher();
  
    function add() {
      num += 1; // Fixed from =+ to +=
      
      if (num === max) {
        dispatch('onReachTen');
        num = 0; // Reset counter
      }
    }
    function rem() {
        num -= 1;
    }
    function reset() {
        dispatch('reset'); 
        num = initialValue;
    }
  </script>
  
  <button on:click={add} class="counter-btn">
    Number: {num} add
  </button>
  <button on:click={rem} class="counter-btn">
    Number: {num} remove
  </button>
  
  <button on:click={reset} class="counter-btn">
    Reset
  </button>
  
  <style>
    .counter-btn {
      font-size: 1.2rem;
      padding: 0.8rem 1.5rem;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;
    }
  
    .counter-btn:hover {
      background: #45a049;
    }
  </style>