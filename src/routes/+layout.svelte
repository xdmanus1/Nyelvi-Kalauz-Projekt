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
	import { onMount } from 'svelte';
    import { authStore } from '../lib/components/stores/AuthStore';
	import { goto } from '$app/navigation';
	let user: import('@supabase/gotrue-js').User | null = null;
	import { page } from '$app/state';
	
    authStore.subscribe(({ user: currentUser }) => {
        user = currentUser;
    });
    onMount(async () => {
        await authStore.initialize();
		// protected routes
		if (!user && page.route.id === "/Profile") {
            goto("/");
        }
    });

  // Access betaFeatures directly
  console.log(user?.user_metadata.beta_features || false);

</script>

<Navbar/>
<Toaster />
{#if user?.user_metadata.beta_features || false}

<Alert.Root variant="destructive" class="fixed w-[10vw] text-red-600 right-10 top-20 text-xl" >
	<CircleAlert class="h-6 w-6" />
	<Alert.Title>Error</Alert.Title>
	<Alert.Description>Beta feature enabled. Please note that this feature is still in testing and may not work as expected.</Alert.Description>

  </Alert.Root>
{/if}
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