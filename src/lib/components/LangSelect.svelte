<script lang="ts">
    import { authStore } from './stores/AuthStore';
    import { fade, scale } from 'svelte/transition';
    import { onMount } from 'svelte';
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
	import { BookA, Languages } from 'lucide-svelte';

    export let show = false;

    const languagePairs = [
    { from: 'English', to: 'Japanese', unable: false },
    { from: 'Japanese', to: 'English', unable: true },
    { from: 'English', to: 'Hungarian', unable: true},
    { from: 'Hungarian', to: 'English', unable: true },
];

    let selectedPair = languagePairs[0];
    let user: any;

    // Subscribe to auth store to get current user
    authStore.subscribe(state => {
        user = state.user;
    });
    let selectedIndex = 0;

    onMount(() => {
    if (user?.user_metadata?.language_from && user?.user_metadata?.language_to) {
        const index = languagePairs.findIndex(
            p => p.from === user.user_metadata.language_from && p.to === user.user_metadata.language_to
        );
        if (index !== -1) selectedIndex = index;
    } else if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('selectedLanguage');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const index = languagePairs.findIndex(p => p.from === parsed.from && p.to === parsed.to);
                if (index !== -1) selectedIndex = index;
            } catch (e) {
                console.error('Failed to parse stored language preference');
            }
        }
    }
});

    async function handleSelection() {
        // Update user metadata with language preference
        selectedPair = languagePairs[selectedIndex];

        await authStore.updateUserLanguage(selectedPair);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('selectedLanguage', JSON.stringify(selectedPair));
        }
        show = false;
    }
</script>

<Dialog.Root bind:open={show}>
    <!-- <Dialog.Trigger
        class="z-10 font-bold h-12 relative mx-auto flex items-center justify-center w-full rounded-full 
               bg-white p-4 text-xs uppercase text-black tracking-wide md:p-6 md:text-base 
               transition duration-300 ease-in-out hover:bg-black hover:text-white focus:outline-none"
    >
    <Languages/>
    </Dialog.Trigger> -->
    <Dialog.Content
        class="sm:max-w-[425px] w-full max-w-full rounded-xl overflow-hidden p-6"
        transitionConfig={{ y: 100 }}
        
    >
        <div class="transition-container" transition:scale={{ duration: 400 }}>
            <Dialog.Header class="flex flex-col items-center">
                <Dialog.Title class="text-2xl font-semibold">
                    Select Learning Language
                </Dialog.Title>
                <Dialog.Description class="text-sm text-gray-500 mt-2">
                    Choose your preferred language pair to start learning.
                </Dialog.Description>
            </Dialog.Header>
            <div class="my-4">
                <div class="language-select text-black">
                    <select bind:value={selectedIndex} class="w-full p-2 rounded-full border border-input bg-background text-white">
                        {#each languagePairs as pair, i}
                            <option disabled={pair.unable} value={i}>
                                {pair.from} → {pair.to}
                            </option>
                        {/each}
                    </select>
                    
                </div>
            </div>
            <Dialog.Footer class="flex flex-row items-center">
                <Button
                    type="submit"
                    on:click={handleSelection}
                    class="font-bold h-12 relative mx-auto flex items-center justify-center w-full rounded-full
                           bg-white p-4 text-xs uppercase text-black tracking-wide md:p-4 md:text-sm
                           transition duration-300 ease-in-out hover:bg-black border-white border-2
                           hover:text-white focus:outline-none mb-4"
                >
                    Start Learning
                </Button>
            </Dialog.Footer>
        </div>
    </Dialog.Content>
</Dialog.Root>

<style>
    .transition-container {
        width: 100%;
    }

    .language-select {
        margin-bottom: 2rem;
    }

</style>