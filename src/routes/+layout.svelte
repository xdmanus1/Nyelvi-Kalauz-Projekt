<script lang="ts">
	import Navbar from '../lib/components/navbar.svelte';
	import '../app.css';
	let { children } = $props();


	import { loggedInerror } from '../lib/components/stores/loggedInStores2';
let isLoggedInerror: boolean;
$effect(() => {
  isLoggedInerror = $loggedInerror;
}); // React to store updates
</script>
<Navbar/>
{#if isLoggedInerror}
<div class="bg-red-500 text-white p-2 text-center">
	Invalid credentials!
</div>
{/if}
{@render children()}
