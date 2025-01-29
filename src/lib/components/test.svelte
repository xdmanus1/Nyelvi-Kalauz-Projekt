<script lang="ts">

    export let name: string;
    export let emoji: string;

    function hello() {
        console.log("Hello ", name, emoji)
    }
</script>

<button on:click={hello}>Greet {name} {emoji}</button>