<!-- src/lib/components/MemoryGameSystem.svelte -->
<script lang="ts">
	// Core Svelte imports
	import { onMount, tick, onDestroy, getContext } from 'svelte'; // Added getContext if needed, but using direct import

	// Component Imports
	import MemoryCard from './MemoryCard.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { RotateCcw, Trophy } from 'lucide-svelte';
	import { Progress } from '$lib/components/ui/progress/index.js';
	// Utility and Helper Imports
	import { toast } from 'svelte-sonner';
	import { parser } from '$lib/components/parse';
    import { authStore } from '$lib/components/stores/AuthStore'; // <-- Import AuthStore
	import confetti from 'canvas-confetti';
	import { Input } from './ui/input';
	import { Slider } from './ui/slider';

	// --- Type Definitions ---
	type CardData = { id: string | number; Type: string; japanese: string; phonetic: string; english: string; category: string; Icon?: string; Input?: boolean; };
	type GameCard = { id: string; pairId: string | number; content: string; type: 'japanese' | 'english'; state: 'down' | 'up' | 'matched'; japaneseWithFurigana?: string; iconUrl?: string; plainJapaneseForTTS?: string; phonetic?: string; };
    type SelectOption = { value: string; label: string; }

	// --- Component Props ---
	export let cards: CardData[] = [];

	// --- Constants ---
	const MAX_PAIRS =	 10;
	const CHECK_DELAY = 1000;

	// --- Display Name Mappings ---
	const typeDisplayNames: Record<string, string> = { 'shop': 'Shop', 'library': 'Library', /* ADD MORE */ };
	const categoryDisplayNames: Record<string, string> = { 'noun': 'Nouns', 'verb': 'Verbs', 'adjective': 'Adjectives', /* ADD MORE */ };
	function getTypeDisplayName(rawValue: string | undefined): string { return !rawValue ? 'Category' : (typeDisplayNames[rawValue] || rawValue); }
	function getCategoryDisplayName(rawValue: string | undefined): string { return !rawValue ? 'Subcategory' : (categoryDisplayNames[rawValue] || rawValue); }

	// --- UI State (Selection Screen) ---
	let availableTypes: string[] = [];
	let availableCategories: string[] = [];
	let selectedType: string | undefined = undefined;
	let selectedCategory: string | undefined = undefined;
	let selectedTypeObj: SelectOption | undefined = undefined;
	let selectedCategoryObj: SelectOption | undefined = undefined;

	// --- Game State ---
	let gameActive: boolean = false;
	let gameBoard: GameCard[] = [];
	let flippedCards: GameCard[] = [];
	let matchedPairs: number = 0;
	let totalPairs: number = 0;
	let isChecking: boolean = false;
    let gridColsClass: string = 'grid-cols-4';
    let currentFlips: number = 0; // <-- ADDED: Track flips for current game

    // --- TTS State ---
    let synth: SpeechSynthesis | null = null;
    let japaneseVoice: SpeechSynthesisVoice | null = null;
    let isSpeaking: boolean = false;
    let speakingCardId: string | number | null = null;

    // --- Lifecycle Hooks ---
	onMount(() => { /* ... TTS Init and Type population (same as before) ... */
        const types = new Set(cards.map((card) => card.Type).filter(Boolean)); availableTypes = Array.from(types).sort();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) { synth = window.speechSynthesis; if (synth.getVoices().length === 0) { const vT = setTimeout(populateVoiceList, 1500); synth.addEventListener('voiceschanged', () => { clearTimeout(vT); populateVoiceList(); }, { once: true }); } else { populateVoiceList(); } } else { console.error("TTS not supported."); }
    });
    onDestroy(() => { /* ... TTS Cleanup (same as before) ... */
        if (synth) { if (synth.speaking) { synth.cancel(); } synth.removeEventListener('voiceschanged', populateVoiceList); }
    });

    // --- TTS Functions ---
	function populateVoiceList() {
        if (!synth) return;
        const voices = synth.getVoices();
        if (voices.length === 0) return;
        
        // Improved voice selection logic
        japaneseVoice = voices.find(vo => 
            vo.lang === 'ja-JP' && vo.name.includes('Google Japanese')
        ) || voices.find(vo => 
            vo.lang === 'ja-JP' && !vo.localService
        ) || voices.find(vo => 
            vo.lang === 'ja-JP'
        ) || null;
        
        if (!japaneseVoice) {
            console.warn("No Japanese voice found. Available voices:", voices);
        }
    }
    function getPlainTextForSpeech(input: string): string { /* ... same ... */ if (!input) return ''; try { const r = parser(input); if (r._tag === "Error") { return input.replace(/\{([^|]+)\|[^}]+\}/g, '$1').replace(/\{([^}]+)\}/g, '$1'); } else { return r.value.map(w => w._tag === 'kana' ? w.value : w._tag === 'kanji' ? w.value.symbol : '').join(''); } } catch (e) { return input.replace(/\{([^|]+)\|[^}]+\}/g, '$1').replace(/\{([^}]+)\}/g, '$1'); } }
	function speakText(text: string, cardId: string | number) {
        if (!synth || !text || !japaneseVoice) {
            console.error('TTS unavailable:', { synth, text, japaneseVoice });
            return;
        }

        // Immediately cancel any ongoing speech
        if (synth.speaking) {
            synth.cancel();
        }

        // Remove setTimeout wrapper
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = japaneseVoice;
        utterance.lang = 'ja-JP';
        utterance.rate = 0.9;
        utterance.pitch = 0.9;

        utterance.onstart = () => {
            isSpeaking = true;
            speakingCardId = cardId;
        };

        utterance.onend = utterance.onerror = () => {
            if (speakingCardId === cardId) {
                isSpeaking = false;
                speakingCardId = null;
            }
        };

        synth.speak(utterance);
    }
    // --- Reactive Updates ---
	$: { /* ... Category update logic (same) ... */ if (selectedType) { const c = new Set(cards.filter(i => i.Type === selectedType && i.category).map(i => i.category)); availableCategories = Array.from(c).sort(); if (selectedCategory && !availableCategories.includes(selectedCategory)) { selectedCategory = undefined; selectedCategoryObj = undefined; } } else { availableCategories = []; selectedCategory = undefined; selectedCategoryObj = undefined; } }
    $: selectedTypeObj = selectedType ? { value: selectedType, label: getTypeDisplayName(selectedType) } : undefined;
    $: selectedCategoryObj = selectedCategory ? { value: selectedCategory, label: getCategoryDisplayName(selectedCategory) } : undefined;
    $: isTTSAvailable = !!japaneseVoice;

	// --- Utility: Shuffle Array ---
	function shuffleArray<T>(array: T[]): T[] { /* ... same ... */ let ci = array.length, ri; while (ci !== 0) { ri = Math.floor(Math.random() * ci); ci--; [array[ci], array[ri]] = [array[ri], array[ci]]; } return array; }

	// --- Utility: Generate Game Board ---
	function generateGameBoard(): GameCard[] { /* ... same (ensure phonetic added) ... */
        if (!selectedType || !selectedCategory) return []; const source = shuffleArray(cards.filter(c => c.Type === selectedType && c.category === selectedCategory && c.phonetic)).slice(0, MAX_PAIRS); if (source.length === 0) { toast.error(`No cards with phonetic info for ${getTypeDisplayName(selectedType)} - ${getCategoryDisplayName(selectedCategory)}.`); return []; } totalPairs = source.length; const board: GameCard[] = []; source.forEach(c => { const id = String(c.id); const plain = getPlainTextForSpeech(c.japanese); board.push({ id: `${id}-jp`, pairId: c.id, type: 'japanese', state: 'down', content: plain, japaneseWithFurigana: c.japanese, iconUrl: c.Icon, plainJapaneseForTTS: plain, phonetic: c.phonetic }); board.push({ id: `${id}-en`, pairId: c.id, type: 'english', state: 'down', content: c.english }); }); const num = board.length; if (num <= 8) gridColsClass = 'grid-cols-4'; else if (num <= 12) gridColsClass = 'grid-cols-4'; else if (num <= 16) gridColsClass = 'grid-cols-4'; else if (num <= 20) gridColsClass = 'grid-cols-5'; else gridColsClass = 'grid-cols-6'; return shuffleArray(board);
    }

	// --- Game Logic Handlers ---
	function startGame() {
		const board = generateGameBoard();
        if (board.length > 0) {
            gameBoard = board;
            matchedPairs = 0;
            flippedCards = [];
            isChecking = false;
            currentFlips = 0; // <-- RESET flips on new game
            gameActive = true;
            if (synth?.speaking) synth.cancel(); isSpeaking = false; speakingCardId = null;
        }
	}

	async function handleCardFlip(event: CustomEvent<{ id: string }>) {
		if (isChecking || flippedCards.length >= 2) return;
		const cardId = event.detail.id;
		const cardIndex = gameBoard.findIndex(c => c.id === cardId);
		if (cardIndex === -1 || gameBoard[cardIndex].state !== 'down') return;

        // ---> INCREMENT FLIPS <---
        currentFlips++;
        // ------------------------

		const newGameBoard = [...gameBoard];
        const flippedCard = { ...newGameBoard[cardIndex], state: 'up' as const };
		newGameBoard[cardIndex] = flippedCard;
		gameBoard = newGameBoard;
		flippedCards = [...flippedCards, flippedCard];

		if (flippedCards.length === 2) {
			isChecking = true;
			await tick();
			checkForMatch();
		}
	}

	async function checkForMatch() {
		const [card1, card2] = flippedCards;
		if (card1.pairId === card2.pairId) {
			matchedPairs++;
			const newGameBoard = gameBoard.map(card => card.pairId === card1.pairId ? { ...card, state: 'matched' as const } : card );
            gameBoard = newGameBoard;
            flippedCards = [];
			isChecking = false;

            // ---> GAME COMPLETED - UPDATE PROGRESS <---
            if (matchedPairs === totalPairs) {
                await tick();
                toast.success(`Game complete in ${currentFlips} flips!`, { duration: 5000 });
				confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                // Update progress via authStore
                authStore.updateMemoryGameProgress({ currentFlips: currentFlips, completed: true });
            }
            // -----------------------------------------

		} else {
			setTimeout(() => {
                const newGameBoard = gameBoard.map(card => (card.id === card1.id || card.id === card2.id) && card.state === 'up' ? { ...card, state: 'down' as const } : card );
                gameBoard = newGameBoard;
                flippedCards = [];
				isChecking = false;
			}, CHECK_DELAY);
		}
	}

    function resetGame() {
        if (gameBoard.length > 0) {
             const board = shuffleArray(gameBoard.map(c => ({...c, state: 'down' as const})));
             gameBoard = board;
             matchedPairs = 0;
             flippedCards = [];
             isChecking = false;
             currentFlips = 0; // <-- RESET flips on reset
             if (synth?.speaking) synth.cancel(); isSpeaking = false; speakingCardId = null;
             toast.success('Game Reset!');
        } else {
            selectNewTopic();
        }
    }

	function selectNewTopic() {
        gameActive = false; selectedType = undefined; selectedCategory = undefined;
        gameBoard = []; matchedPairs = 0; totalPairs = 0; flippedCards = [];
        isChecking = false; currentFlips = 0; // <-- RESET flips when selecting new topic
        if (synth?.speaking) synth.cancel(); isSpeaking = false; speakingCardId = null;
    }

    function handleRequestSpeak(event: CustomEvent<{ text: string; id: string | number }>) {
     const reqCard = gameBoard.find(c => c.id === event.detail.id);
     if (reqCard && reqCard.state === 'up') {
         // use the phonetic reading if available, otherwise fallback
         const toSpeak = reqCard.phonetic ?? event.detail.text;
         speakText(toSpeak, event.detail.id);
     } else {
         if (speakingCardId === event.detail.id) {
             if (synth?.speaking) synth.cancel();
             isSpeaking = false;
             speakingCardId = null;
         }
     }
 }
	$: progressValue = totalPairs ? Math.min((currentFlips / (totalPairs * 2)) * 100, 100) : 0;
</script>

<!-- HTML Template -->
<div class="container mx-auto p-4 md:p-8 flex flex-col items-center gap-8">

	{#if !gameActive}
		<!-- SELECTION AREA -->
		<div class="w-full max-w-md flex flex-col gap-6 items-center p-6 border rounded-[20px] shadow-md bg-card text-card-foreground">
			<h2 class="text-2xl font-bold mb-4 text-center">Memory Game Setup</h2>
			<!-- Category Selector -->
			<div class="w-full">
				<label for="type-select-mem" class="block text-sm font-medium mb-1">Category</label>
				<Select.Root selected={selectedTypeObj} onSelectedChange={(v) => { selectedType = v?.value; }} >
					<Select.Trigger class="w-full rounded-full text-center" id="type-select-mem" aria-label="Select main category"> <Select.Value placeholder="Select a category..." /> </Select.Trigger>
					<Select.Content class="text-center rounded-[20px]">
						{#each availableTypes as typeValue (typeValue)}
							<Select.Item class="text-center rounded-[20px]" value={typeValue} label={getTypeDisplayName(typeValue)}> {getTypeDisplayName(typeValue)} </Select.Item>
						{/each}
                        {#if availableTypes.length === 0}<Select.Label class="text-center text-muted-foreground p-2">No categories loaded</Select.Label>{/if}
					</Select.Content>
				</Select.Root>
			</div>
			<!-- Subcategory Selector -->
			<div class="w-full">
				<label for="category-select-mem" class="block text-sm font-medium mb-1">Subcategory</label>
				<Select.Root selected={selectedCategoryObj} onSelectedChange={(v) => { selectedCategory = v?.value; }} disabled={!selectedType || availableCategories.length === 0} >
					<Select.Trigger class="w-full rounded-full" id="category-select-mem" aria-label="Select subcategory"> <Select.Value placeholder={!selectedType ? 'Select category first' : (availableCategories.length === 0 ? 'No subcategories' : 'Select a subcategory...')} /> </Select.Trigger>
					<Select.Content class="rounded-[20px]">
						{#if availableCategories.length > 0}
							{#each availableCategories as categoryValue (categoryValue)}
								<Select.Item class="rounded-[20px]" value={categoryValue} label={getCategoryDisplayName(categoryValue)}> {getCategoryDisplayName(categoryValue)} </Select.Item>
							{/each}
						{:else if selectedType}
							<Select.Label class="text-muted-foreground p-2">No subcategories found</Select.Label>
						{/if}
					</Select.Content>
				</Select.Root>
				
			</div>
			<!-- <Slider value={MAX_PAIRS ? [MAX_PAIRS] : undefined} max={10} step={1} /> -->
			<!-- Start Button -->
			<Button on:click={startGame} disabled={!selectedType || !selectedCategory} class="w-full mt-4 rounded-3xl" size="lg"> Start Memory Game </Button>
		</div>
	{:else}
		<!-- GAME ACTIVE AREA -->
		<div class="w-full flex flex-col items-center gap-6">
			<!-- Game Info Header -->
			<div class="flex justify-between w-full max-w-3xl items-center mb-2 px-2 flex-wrap gap-2"> <!-- Added flex-wrap and gap -->
				<h2 class="text-lg sm:text-xl font-semibold text-center flex-grow basis-full sm:basis-auto order-1 sm:order-2"> <!-- Adjusted flex for centering and order -->
					{getTypeDisplayName(selectedType)} - {getCategoryDisplayName(selectedCategory)}
				</h2>
                <p class="text-sm text-muted-foreground order-2 sm:order-1">Flips: {currentFlips}</p> <!-- Display current flips -->
				<div class="flex items-center gap-2 flex-shrink-0 order-3">

					<p class="text-md sm:text-lg text-muted-foreground font-medium" aria-live="polite"> Pairs Found: {matchedPairs} / {totalPairs} </p>
					{#if matchedPairs === totalPairs && totalPairs > 0} <Trophy class="w-6 h-6 text-yellow-500" aria-label="Game Complete"/> {/if}
				</div>
			</div>
			<!-- Progress Bar for Flips -->
			<div class="w-full flex justify-center">
				<Progress value={matchedPairs} max={totalPairs} class="w-[60%]" />
			</div>
			<!-- Game Board Grid -->
			<div class={`grid grid-cols-2 sm:${gridColsClass} lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full max-w-3xl`}>
				{#each gameBoard as card (card.id)}
					<MemoryCard
						id={card.id} pairId={card.pairId} content={card.content} type={card.type}
                        japaneseWithFurigana={card.japaneseWithFurigana} iconUrl={card.iconUrl}
                        plainJapaneseForTTS={card.plainJapaneseForTTS} phonetic={card.phonetic}
						state={isChecking && flippedCards.some(fc => fc.id === card.id) ? 'up' : card.state}
                        isTTSAvailable={isTTSAvailable} isSpeakingGlobal={isSpeaking} speakingCardIdGlobal={speakingCardId}
						on:flip={handleCardFlip} on:requestSpeak={handleRequestSpeak} class={isChecking ? 'checking' : ''}
					/>
				{/each}
			</div>
			<!-- Control Buttons -->
            <div class="flex flex-wrap justify-center gap-4 mt-4">
                <Button variant="outline" on:click={resetGame}><RotateCcw class="mr-2 h-4 w-4"/> Reset Current Game</Button>
                 <Button variant="secondary" on:click={selectNewTopic}>Select New Topic</Button>
            </div>
		</div>
	{/if}
</div>