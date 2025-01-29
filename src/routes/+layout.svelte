<script lang="ts">
	import Navbar from '../lib/components/navbar.svelte';
	import '../app.css';
	import * as Alert from "$lib/components/ui/alert";
	import { loggedInerror } from '../lib/components/stores/loggedInStores2';
	import { CircleAlert } from 'lucide-svelte';
	import { scale } from 'svelte/transition';
	import { Toaster } from "$lib/components/ui/sonner";

	export let children: any; // Declare the `children` prop

	let isLoggedInerror: boolean;

	// Reactively update `isLoggedInerror` whenever the store value changes
	$: isLoggedInerror = $loggedInerror;
</script>
<Navbar/>
<Toaster />

{@render children()}
<style>.toast[data-type="error"] {
	background-color: hsl(0 100% 97%) !important;
	border-color: hsl(0 93% 94%);
	color: hsl(0 84% 31%);
}

.toast[data-type="success"] {
	background-color: hsl(138 76% 97%);
	border-color: hsl(139 65% 92%);
	color: hsl(140 62% 26%);
}</style>