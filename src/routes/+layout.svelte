<script lang="ts">
	import Navbar from '../lib/components/navbar.svelte';
	import '../app.css';
	import * as Alert from "$lib/components/ui/alert";
	import { loggedInerror } from '../lib/components/stores/loggedInStores2';
	import { CircleAlert } from 'lucide-svelte';
	import { scale } from 'svelte/transition';
	import { Toaster } from "$lib/components/ui/sonner";
	import WordRotate from "$lib/components/word.svelte";

	export let children: any; // Declare the `children` prop

	let isLoggedInerror: boolean;

	// Reactively update `isLoggedInerror` whenever the store value changes
	$: isLoggedInerror = $loggedInerror;
	import { onMount } from 'svelte';
    import { authStore } from '../lib/components/stores/AuthStore';
	import { goto } from '$app/navigation';
	let user: import('@supabase/gotrue-js').User | null = null;
	import { page } from '$app/state';
	import { timeout } from 'd3';
	
    authStore.subscribe(({ user: currentUser }) => {
        user = currentUser;
    });
    onMount(async () => {
        await authStore.initialize();
		// protected routes
		if (!user && (page.route.id === "/Profile" || page.route.id === "/Quiz")) {
            goto("/");
        }
		await new Promise(resolve => setTimeout(resolve, 1000));
        loading = false;
    });

  // Access betaFeatures directly
  console.log(user?.user_metadata.beta_features || false);
	let loading = true;
</script>
{#if !loading}
<div>
<Navbar/>
<Toaster />
{#if user?.user_metadata.beta_features || false}

<Alert.Root   variant="destructive" class="borders fixed w-[20%] text-red-800 right-10 bottom-[11%] text-2xl z-20  backdrop-blur-[4px] border-l-[12px] " >
	<!-- <CircleAlert class="h-6 w-6" /> -->
	<Alert.Title>Beta fetures enabled</Alert.Title>
	<Alert.Description class="text-base">Beta features enabled. Please note that these features are still in testing and may not work as expected.</Alert.Description>

  </Alert.Root>
{/if}
{@render children()}
</div>
{:else}
<div class="flex justify-center items-center flex-col mt-[40vh]">
	<div class="loader mb-10"></div>
	<div class="text-4xl">Loading</div>
		<WordRotate
		class="text-4xl font-bold text-black dark:text-white"
		words={[" Buttons", " Forms", " Switches", " Cards", " Stuff"]}
	  />
  </div>
  
{/if}
<style>
	
	/* .toast[data-type="error"] {
	   background-color: hsl(0 100% 97%) !important;
	   border-color: hsl(0 93% 94%);
	   color: hsl(0 84% 31%);
   } 
   
	.toast[data-type="success"] {
	   background-color: hsl(138 76% 97%);
	   border-color: hsl(139 65% 92%);
	   color: hsl(140 62% 26%);
   } */
	
   .loader {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: inline-block;
  border-top: 4px solid #FFF;
  border-right: 4px solid transparent;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}
.loader::after {
  content: '';  
  box-sizing: border-box;
  position: absolute;
  left: 0;
  top: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border-left: 4px solid #2EFFBD;
  border-bottom: 4px solid transparent;
  animation: rotation 0.5s linear infinite reverse;
}
@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
} 
    
   </style> 