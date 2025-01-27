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
