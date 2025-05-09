<script lang="ts">
	import { X } from 'lucide-svelte';
	import { cubicInOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import Button from './ui/button/button.svelte'; // Ensure path is correct
	import { onMount, createEventDispatcher } from 'svelte';

	// --- PROPS ---
	export let apps: any[] = [];
	export let cards: any[] = [];
	export let initialOpenAppId: string | null = null;

	// --- INTERNAL STATE ---
	let openAppEmoji: string | null = null;
	let currentlyOpenAppId: string | null = null;
	// NEW: Track the previous value of the prop to detect actual changes
	let prevInitialOpenAppId: string | null = initialOpenAppId; // Initialize with the first prop value

	// --- EVENT DISPATCHER ---
	const dispatch = createEventDispatcher<{ appOpened: { appId: string } }>();

	const [send, receive] = crossfade({
		duration: 300,
		easing: cubicInOut
	});

	// --- EVENT HANDLERS ---
	function findAppByEmoji(emoji: string | null): any | null {
		if (!emoji || !apps) return null; // Added !apps check
		return apps.find((app) => app.emoji === emoji);
	}

    // Helper added from previous successful version
    function findAppById(appId: string | null): any | null {
		if (!appId || !apps) return null;
		return apps.find(app => app.id === appId);
	}

	function openAppHandler(app: any) {
		if (app?.emoji && app.id) {
			openAppEmoji = app.emoji;
			currentlyOpenAppId = app.id;
			console.log(`AppSelector: User opened app ID: ${app.id}`);
			dispatch('appOpened', { appId: app.id });
		} else {
            console.warn("AppSelector: Attempted user open with invalid app data:", app);
        }
	}

	function closeAppHandler() {
        // Log state *before* changing
		console.log(`AppSelector: closeAppHandler called. Current openAppEmoji: ${openAppEmoji}, currentlyOpenAppId: ${currentlyOpenAppId}`);
		openAppEmoji = null;
		currentlyOpenAppId = null;
        // Update the 'previous' prop value tracker ONLY when closing manually.
        // This prevents the reactive block from immediately reopening based on the *stale* prop value.
        prevInitialOpenAppId = initialOpenAppId;
        console.log(`AppSelector: closeAppHandler finished. State reset. prevInitialOpenAppId updated to: ${prevInitialOpenAppId}`);
	}

	// --- Function to open app programmatically ---
	function openAppById(appId: string | null) {
		if (!appId) return; // Exit if no ID provided
        // Skip if already open - comparison moved to reactive block logic

		const appToOpen = findAppById(appId); // Use helper
		if (appToOpen?.emoji && appToOpen.id) {
			console.log(`AppSelector: Programmatically opening app ID: ${appId}`);
			openAppEmoji = appToOpen.emoji;
			currentlyOpenAppId = appToOpen.id; // Update internal state
            // Update the 'previous' tracker when opening programmatically to sync state
            prevInitialOpenAppId = appId;
			dispatch('appOpened', { appId: appToOpen.id });
		} else {
			console.warn(`AppSelector: App with ID "${appId}" not found for programmatic open.`);
            // Reset previous tracker if app not found, so a subsequent valid prop change works
            prevInitialOpenAppId = null;
		}
	}

	// --- LIFECYCLE / REACTIVITY ---
	onMount(() => {
        // Initialize prev value on mount based on initial prop state
        prevInitialOpenAppId = initialOpenAppId;
		setTimeout(() => {
            console.log(`AppSelector onMount: Initial prop ID: ${initialOpenAppId}. Previous tracker: ${prevInitialOpenAppId}. Trying initial open.`);
			if (initialOpenAppId) { // Only call if ID exists initially
                openAppById(initialOpenAppId);
            }
        }, 200);
	});

	// --- REVISED REACTIVE STATEMENT ---
	// This block runs whenever its dependencies (initialOpenAppId, prevInitialOpenAppId, currentlyOpenAppId, apps) change.
	$: {
		if (typeof window !== 'undefined') { // Ensure runs only in browser context
      
            // Condition 1: Did the prop value actually change from the last time we processed it?
            const propChanged = initialOpenAppId !== prevInitialOpenAppId;
            // Condition 2: Is the new prop value non-null (meaning we *should* open something)?
            const hasValueToOpen = !!initialOpenAppId;
            // Condition 3: Is the app requested by the prop different from the one currently open?
            const isDifferentFromCurrent = initialOpenAppId !== currentlyOpenAppId;
            // Condition 4: Is the apps array loaded and ready?
            const appsReady = apps && apps.length > 0;

            // --- Main Logic: Open app only if the prop changed to a new, valid, different ID ---
            if (propChanged && hasValueToOpen && isDifferentFromCurrent && appsReady) {
                console.log(`AppSelector REACTION: Prop initialOpenAppId CHANGED from ${prevInitialOpenAppId} to ${initialOpenAppId}. Calling openAppById.`);
                openAppById(initialOpenAppId); // Call open logic
                // Note: openAppById already updates prevInitialOpenAppId upon success
            }
            // --- Handling Prop Changes without Opening ---
            else if (propChanged) {
                // If the prop changed, but we didn't meet conditions to open (e.g., prop became null, or points to same app),
                // we still need to update our 'prevInitialOpenAppId' tracker to reflect the *new* prop value
                // so we don't incorrectly trigger the open logic on the *next* unrelated state change.
                 console.log(`AppSelector REACTION: Prop initialOpenAppId changed from ${prevInitialOpenAppId} to ${initialOpenAppId}, but not opening. Updating prev tracker.`);
                 prevInitialOpenAppId = initialOpenAppId;

                 // Optional: If prop explicitly became null, consider closing the current app
                 // if (!initialOpenAppId && currentlyOpenAppId) {
                 //    console.log("AppSelector REACTION: Prop became null, closing current app.");
                 //    closeAppHandler();
                 // }
            }
            // No action needed if the prop didn't change, even if internal state like currentlyOpenAppId changed.
            // This prevents the loop caused by closeAppHandler.
		}
	}
	// --- END REVISED REACTIVE STATEMENT ---


	// --- POSITIONING HELPER ---
	function getPositionStyle(app: any): string {
		if (app?.where?.top && typeof app.where.top === 'string' && app.where.left && typeof app.where.left === 'string') {
			return `top: ${app.where.top}; left: ${app.where.left};`;
		}
		return `top: 50%; left: 50%; transform: translate(-50%, -50%);`; // Adjusted fallback
	}
</script>

<!-- TEMPLATE - UNCHANGED FROM YOUR PROVIDED VERSION -->
<div class="app-selector-container">
	{#each apps as app (app.id)}
		{#if openAppEmoji !== app.emoji}
			<!-- App Icon Button -->
			<button
				id={app.id}
				class="icon bg-white rounded-full"
				style="{getPositionStyle(app)}; --test: '{app.content?.title}'"
				on:click={() => openAppHandler(app)}
				in:receive={{ key: app.emoji }}
				out:send={{ key: app.emoji }}
				aria-label={`Open ${app.content?.title || 'App'}`}
				title={app.content?.title || ''}
			>
				<!-- Ensure emoji path is correct -->
				<img
					src={app.emoji.startsWith('/') ? app.emoji : `/${app.emoji}`}
					alt={app.content?.title || ''}
					class="icon-image"
				/>
			</button>
		{:else}
			<!-- Opened App Overlay -->
			<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
			<div
				id={`${app.id}-open`}
				class="app-fixed-overlay w-12"
				in:receive={{ key: app.emoji }}
				out:send={{ key: app.emoji }}
				role="dialog"
				aria-modal="true"
				aria-labelledby={`${app.id}-title`}
			>
				<h2 id={`${app.id}-title`} class="sr-only">{app.content?.title}</h2>
				<div class="component-host">
					<!-- svelte-ignore a11y_autofocus -->
					<Button
						autofocus
						class="close-button max-lg:top-[7.5rem] top-[6rem] left-[90%] relative h-[60px] z-50 border-[3px]"
						on:click={closeAppHandler}
						aria-label="Close App"
					>
						<X size={24} />
					</Button>
					{#key app.id}<!-- Key helps ensure component remounts if app changes -->
						<svelte:component this={app.content.component} {cards} />
					{/key}
				</div>
			</div>
		{/if}
	{/each}
</div>

<!-- STYLE - UNCHANGED FROM YOUR PROVIDED VERSION -->
<style>
	/* Container for positioning icons relative to viewport */
	.app-selector-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none; /* Pass clicks through */
		z-index: 5;
	}

	/* --- Icon Styling --- */
	.icon {
		position: absolute;
		z-index: 6;
		transform: translate(-50%, -80%);
		width: 50px;
		height: 50px;
		cursor: pointer;
		transition: transform 0.2s ease-out;
		border: none;
		padding: 0.4rem;
		pointer-events: auto; /* Icons ARE clickable */
		background-color: white; /* Explicit background */
		border-radius: 50%; /* Ensure full circle */
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Add subtle shadow */
	}

	.icon:hover {
		transform: translate(-50%, -80%) scale(1.15);
	}

	/* Tooltip */
	.icon::after {
		content: var(--test);
		position: absolute;
		bottom: 115%; /* Position above */
		left: 50%;
		transform: translateX(-50%);
		white-space: nowrap;
		font-size: 0.75rem;
		background: rgb(0, 0, 0);
		color: white;
		padding: 3px 8px; /* Slightly more padding */
		border-radius: 40px;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.2s ease 0.1s; /* Slight delay */
	}

	.icon:hover::after {
		opacity: 1;
	}

	.icon-image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		border-radius: inherit; /* Inherit from button */
	}

	/* --- Opened App Overlay Styling --- */
	.app-fixed-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		backdrop-filter: blur(5px);
		background-color: rgba(0, 0, 0, 0.4); /* Slightly darker backdrop */
		z-index: 100;
		overflow: hidden;
		pointer-events: auto; /* Overlay is interactive */
	}

	.component-host {
		position: relative; /* Needed for absolute positioning of close button inside */
		width: 100%;
		height: 100%;
		overflow-y: auto; /* Allow content scroll if needed */
		/* Optional constraints/styling for the hosted component container */
		/* max-width: 90vw; max-height: 90vh; background: white; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); */
	}

	.close-button {
		position: absolute;
		/* Adjusted position for better placement */
		top: calc(env(safe-area-inset-top, 0px) + 1.5rem); /* Consider safe areas */
		right: calc(env(safe-area-inset-right, 0px) + 1.5rem);
		z-index: 105; /* Above component host content */
		/* Style adjustments */
		width: 44px; /* Standard touch target size */
		height: 44px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.9);
		border: 1px solid #ccc;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		cursor: pointer;
		transition: background-color 0.2s ease;
	}
	.close-button:hover {
		background-color: rgba(230, 230, 230, 0.95);
	}

	/* Improve focus visibility for accessibility */
	.close-button:focus-visible {
		outline: 2px solid blue;
		outline-offset: 2px;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>