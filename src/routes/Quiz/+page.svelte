<script>
    let question = "What is the capital of France?";
    let answer = "";
    let correctAnswer = "Paris";
    let message = "";

    function checkAnswer() {
        if (answer.trim().toLowerCase() === correctAnswer.toLowerCase()) {
            message = "Correct!";
        } else {
            message = "Try again!";
        }
    }
</script>

<main>
    <h1>Quiz</h1>
    <p>{question}</p>
    <input type="text" bind:value={answer} placeholder="Your answer" />
    <button on:click={checkAnswer}>Submit</button>
    <p>{message}</p>
</main>

<style>
    main {
        font-family: Arial, sans-serif;
        padding: 2rem;
    }

    input {
        margin-right: 1rem;
    }

    button {
        padding: 0.5rem 1rem;
    }
</style>