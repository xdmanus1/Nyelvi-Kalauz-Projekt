<!-- src/lib/components/MemoryCard.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { cn } from '$lib/utils';
	import { Volume2 } from 'lucide-svelte';
	import { parser } from '$lib/components/parse';

	// --- Props ---
	export let id: string | number;
	export let pairId: string | number;
	export let content: string;
	export let state: 'down' | 'up' | 'matched' = 'down';
	export let type: 'japanese' | 'english';
	export let japaneseWithFurigana: string | undefined = undefined;
	export let iconUrl: string | undefined = undefined;
	export let plainJapaneseForTTS: string | undefined = undefined;
	export let phonetic: string | undefined = undefined;
	export let isTTSAvailable: boolean = false;
	export let isSpeakingGlobal: boolean = false;
	export let speakingCardIdGlobal: string | number | null = null;

	// --- Events ---
	const dispatch = createEventDispatcher();

	// --- Event Handlers ---
	function handleClick() { if (state === 'down') { dispatch('flip', { id }); } }
	function handleSpeakClick(event: MouseEvent) { event.stopPropagation(); if (plainJapaneseForTTS && isTTSAvailable && !isSpeakingGlobal) { dispatch('requestSpeak', { text: plainJapaneseForTTS, id: id }); } }

	// --- Rendering ---
	function renderFurigana(input: string | undefined): string { /* ... no changes ... */
        if (!input) return ''; try { const result = parser(input); if (result._tag === 'Error') { console.error('Furigana parser error render:', result.value); return input.replace(/\{([^|]+)\|[^}]+\}/g, '$1').replace(/\{([^}]+)\}/g, '$1'); } else { return result.value .map((word) => { if (word._tag === 'kana') return word.value; if (word._tag === 'kanji') { const symbol = String(word.value.symbol ?? ''); const furigana = String(word.value.furigana ?? ''); return `<ruby>${symbol}<rt>${furigana}</rt></ruby>`; } return ''; }).join(''); } } catch (e) { console.error('Furigana parser exception render:', e); return input.replace(/\{([^|]+)\|[^}]+\}/g, '$1').replace(/\{([^}]+)\}/g, '$1'); }
    }

	// --- Class Prop Setup ---
    let className: string = ''; export { className as class };

	// --- Computed State ---
    $: isCurrentlySpeaking = speakingCardIdGlobal === id;
    // UPDATED: Disable also if card state is 'matched'
    $: isSpeakButtonDisabled = state === 'matched' || !isTTSAvailable || !plainJapaneseForTTS || (isSpeakingGlobal && !isCurrentlySpeaking);
    // Update title for matched state
    $: speakButtonTitle = state === 'matched' ? "Card matched"
						  : !isTTSAvailable ? "Japanese voice not available"
                          : !plainJapaneseForTTS ? "No text to speak"
                          : (isSpeakingGlobal && !isCurrentlySpeaking) ? "TTS busy"
                          : `Speak "${plainJapaneseForTTS}"`;

</script>

<style>
	/* ... All styles remain the same as the previous version ... */
	.card-container-mem { perspective: 1000px; aspect-ratio: 3 / 4; cursor: pointer; position: relative; overflow: hidden; border-radius: 0.5rem; }
	.card-inner-mem { position: relative; width: 100%; height: 100%; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; border-radius: inherit; }
	.card-container-mem.up .card-inner-mem, .card-container-mem.matched .card-inner-mem { transform: rotateY(180deg); }
	.card-face-mem { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; -webkit-backface-visibility: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: inherit; padding: 0.5rem; text-align: center; font-weight: 600; overflow-wrap: break-word; word-break: break-word; border: 1px solid hsl(var(--border)); }
	.card-front-mem { background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); font-size: 2rem; }
	.card-back-mem { background-color: hsl(var(--card)); color: hsl(var(--card-foreground)); transform: rotateY(180deg); font-size: 1rem; line-height: 1.3; justify-content: space-between; transition: border-color 0.3s ease, background-color 0.3s ease; }
    .card-container-mem.up:not(.matched) .card-back-mem:hover { border-color: #2EFFBD; background-color: rgba(46, 255, 189, 0.05); } /* Adjusted hover selector */
	.card-container-mem.matched { cursor: default; opacity: 0.6; }
    .card-container-mem.matched .card-inner-mem { box-shadow: 0 0 0 3px hsl(var(--ring)); }
	.card-container-mem.checking { cursor: wait !important; }
    .back-content-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 0.1rem; width: 100%; height: 100%; overflow: hidden; padding: 0.2rem; }
    .main-content-area { display: flex; flex-direction: column; align-items: center; justify-content: center; flex-grow: 1; width: 100%; overflow: hidden; gap: 0.1rem; }
    .japanese-text-display { font-size: 1.05rem; line-height: 1.4; white-space: normal !important; max-height: 45%; overflow-y: auto; width: 100%; margin-top: 0.1rem; padding: 0 0.2rem; }
    .phonetic-display { font-size: 0.85rem; color: hsl(var(--muted-foreground)); line-height: 1.2; width: 100%; padding: 0 0.2rem; margin-top: 0.1rem; }
    .icon-display { max-width: 35px; max-height: 35px; margin-bottom: 0.1rem; flex-shrink: 0; }
    .english-text-display { font-size: 1.1rem; font-weight: 600; padding: 0.5rem; flex-grow: 1; display: flex; align-items: center; justify-content: center; }
    @keyframes pulse-mem { 0%, 100% { box-shadow: 0 0 0 0 rgba(46, 255, 189, 0.7); } 50% { box-shadow: 0 0 0 8px rgba(46, 255, 189, 0); } }
    .speak-button.speaking { border-color: #2EFFBD !important; animation: pulse-mem 1.5s infinite ease-in-out; transform: scale(1.1); }
</style>

<!-- HTML Template -->
<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class={cn('card-container-mem group ', state, className)} on:click={handleClick} >
	<div class="card-inner-mem border">
		<!-- Front Face -->
		<div class="card-face-mem card-front-mem hover:border-[#2EFFBD] transition-border duration-500 ease-in-out hover:bg-[#cffff0] border-[5px]"><span>?</span></div>
		<!-- Back Face -->
		<div class="card-face-mem card-back-mem">
			<div class="back-content-wrapper">
				{#if type === 'japanese'}
					<!-- Japanese Content Area -->
					<div class="main-content-area">
						{#if iconUrl}<img src={iconUrl} alt="Icon" class="icon-display" />{/if}
						{#if japaneseWithFurigana}
							<div class="japanese-text-display" lang="ja">
								{@html renderFurigana(japaneseWithFurigana)}
							</div>
						{/if}
                        {#if phonetic}
                            <div class="phonetic-display">
                                ({phonetic})
                            </div>
                        {/if}
					</div>
					<!-- TTS Button Area -->
                    {#if plainJapaneseForTTS}
                        <div class="flex justify-center w-full mt-auto pt-1 flex-shrink-0">
                            <button
                              on:click={handleSpeakClick}
                              disabled={isSpeakButtonDisabled}
                              class="speak-button transition-all duration-500 flex items-center justify-center font-semibold text-lg hover:scale-[120%] rounded-full bg-white text-black p-2 border-2 border-white group-hover:text-[#2EFFBD] group-hover:bg-black hover:border-[#2EFFBD] {isCurrentlySpeaking ? 'speaking' : ''} {isSpeakButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}"
                              title={speakButtonTitle}
                              aria-label="Speak Japanese text"
                            > <Volume2 size={20}/> </button>
                        </div>
                    {/if}
				{:else}
					<!-- English Content Area -->
					<div class="main-content-area">
						<span class="english-text-display">{content}</span>
					</div>
                     <div class="h-[44px] flex-shrink-0"></div>
				{/if}
			</div>
		</div>
	</div>
</div>