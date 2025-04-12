<script lang="ts">
    import { ChevronRight, X } from "lucide-svelte";
    import { Label } from "./ui/label";
    import { Input } from "./ui/input";
    import { Checkbox } from "./ui/checkbox";

    // Define props for the filter options and checked state
    export let filterOptions: { label: string, value: string }[] = [];
    export let checkedState: boolean[] = [];
    export let onCheckboxChange: (index: number, checked: boolean) => void;

    // Export searchTerm for two-way binding with the parent
    export let searchTerm: string = '';
</script>

<div class="min-h-60 max-lg:min-h-0 max-lg:h-[16rem] w-60 test border-4 border-white parent flex hover:translate-x-[17%] right-[97%] absolute z-20 bg-black text-white transition-all p-3 rounded-xl duration-300 overflow-hidden">
    <div class="yes w-full flex flex-col items-center justify-center content-center">
        <Label for="search-input" class="text-xl">Search</Label>
        <div class="relative">
            <!-- Bind the input value to the searchTerm prop -->
            <Input
                id="search-input"
                bind:value={searchTerm}
                placeholder="Search..."
                class="mt-1 mb-3 pr-8"
            />
            {#if searchTerm}
                <button 
                    class="absolute top-[40%] right-2 transform -translate-y-1/2 text-black  bg-white rounded-full w-8 h-8 text-xl"
                    on:click={() => searchTerm = ''}
                >x</button>
            {/if}
        </div>

        <Label class="text-xl mt-4">Filter</Label>
        <div class="flex flex-col gap-2 mt-2">
            {#each filterOptions as option, index}
                <div class="flex items-center gap-2 text-lg">
                    <Checkbox
                        id={`filter-${option.value}`}
                        onCheckedChange={(checked) => onCheckboxChange(index, checked === true)}
                        checked={checkedState[index]}
                    />
                    <!-- Associate label with checkbox for better accessibility -->
                    <Label for={`filter-${option.value}`} class="text-lg cursor-pointer">{option.label}</Label>
                </div>
            {/each}
        </div>
    </div>
    <div class="parenthover left-[80%] absolute top-[40%] w-10 -hue-rotate-180">
        <ChevronRight class="w-12 h-12" />
    </div>
</div>

<style>
    .parent {
        transition: all 0.7s;
        overflow: hidden;
    }
    .parent:hover {
        transform: translateX(87%);
    }
    .parent:hover .parenthover {
        opacity: 0;
        transform: translateX(40px);
        transition: all 0.7s;
    }
    .test {
        outline: 4px;
        outline-style: solid;
        outline-color: black;
    }
    .yes {
        opacity: 0;
        transition: all 0.7s;
    }
    .parent:hover .yes {
        opacity: 1;
    }
</style>