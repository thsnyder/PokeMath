document.addEventListener("DOMContentLoaded", () => {
    const startScreen = document.getElementById("start-screen");
    const gameScreen = document.getElementById("game-screen");
    const evolutionMessage = document.getElementById("evolution-message");
    const pokemonImg = document.getElementById("pokemon-img");
    const experienceMeter = document.getElementById("experience-meter");
    const ratioDisplay = document.getElementById("ratio");
    const mathQuestion = document.getElementById("math-question");
    const answerInput = document.getElementById("answer-input");
    const submitAnswer = document.getElementById("submit-answer");
    const checkMark = document.getElementById("check-mark");
    const backHomeButton = document.getElementById("back-home");
    const pokedexContent = document.getElementById("pokedex-content");
    const setFreeButton = document.getElementById("set-free");
    const gradeForm = document.getElementById("grade-form");
    const skipQuestion = document.getElementById("skip-question");

    let currentPokemon = null;
    let currentQuestion = null;
    let questions = [];
    let selectedGradeLevel = null;
    let pokemonCollection = [];

    const pokemonData = {
        bulbasaur: {
            name: ["Bulbasaur", "Ivysaur", "Venusaur"],
            img: ["images/bulbasaur.png", "images/ivysaur.png", "images/venusaur.png"]
        },
        charmander: {
            name: ["Charmander", "Charmeleon", "Charizard"],
            img: ["images/charmander.png", "images/charmeleon.png", "images/charizard.png"]
        },
        squirtle: {
            name: ["Squirtle", "Wartortle", "Blastoise"],
            img: ["images/squirtle.png", "images/wartortle.png", "images/blastoise.png"]
        }
    };

    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            loadGameState();
            populateInitialPokedex();
            updatePokedexDisplay();
        })
        .catch(error => console.error('Error fetching questions:', error));

    function populateInitialPokedex() {
        const starterPokemon = ['bulbasaur', 'charmander', 'squirtle'];
        starterPokemon.forEach(pokemon => {
            if (!pokemonCollection.some(p => p.name === pokemon)) {
                const initialPokemon = { id: Date.now() + pokemon, name: pokemon, evolutionStage: 1, correctAnswers: 0 };
                pokemonCollection.push(initialPokemon);
            }
        });
    }

    gradeForm.addEventListener("change", (event) => {
        selectedGradeLevel = event.target.value;
    });

    document.querySelectorAll(".starter-btn").forEach(button => {
        button.addEventListener("click", () => {
            if (selectedGradeLevel) {
                const chosenPokemon = button.getAttribute("data-pokemon");
                startGame(chosenPokemon);
            } else {
                alert("Please select a grade level first!");
            }
        });
    });

    function startGame(pokemon, continueGame = false, id = null) {
        if (!continueGame) {
            currentPokemon = pokemonCollection.find(p => p.name === pokemon);
        } else {
            currentPokemon = pokemonCollection.find(p => p.id === id);
        }

        const gradeQuestions = questions[selectedGradeLevel];
        if (!gradeQuestions) {
            alert("No questions available for the selected grade level.");
            return;
        }
        currentPokemon.questions = gradeQuestions;

        pokemonImg.src = pokemonData[currentPokemon.name].img[currentPokemon.evolutionStage - 1];
        startScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");
        backHomeButton.classList.remove("hidden");

        updateRatio();
        askQuestion();
    }

    function askQuestion() {
        const randomQuestion = currentPokemon.questions[Math.floor(Math.random() * currentPokemon.questions.length)];
        currentQuestion = randomQuestion;
        mathQuestion.textContent = randomQuestion.question;
    }

    submitAnswer.addEventListener("click", () => {
        const userAnswer = parseInt(answerInput.value);
        if (userAnswer === currentQuestion.answer) {
            currentPokemon.correctAnswers++;
            showCheckMark();
            pulsePokemon();
            updateExperience();
            if ((currentPokemon.evolutionStage === 1 && currentPokemon.correctAnswers === 5) ||
                (currentPokemon.evolutionStage === 2 && currentPokemon.correctAnswers === 8)) {
                evolvePokemon();
            }
            askQuestion();
        } else {
            alert("Try again!");
        }
        answerInput.value = "";
    });

    skipQuestion.addEventListener("click", () => {
        askQuestion();
        answerInput.value = "";
    });

    setFreeButton.addEventListener("click", () => {
        const pokemonElements = document.querySelectorAll(".starter-btn img");
        pokemonElements.forEach((pokemonElement, index) => {
            pokemonElement.classList.add("bounce-out");
            setTimeout(() => {
                resetPokemon(pokemonCollection[index]);
                updatePokedexDisplay();
            }, 2000); // Time for bounce-out animation to complete
        });
    });


    function showCheckMark() {
        checkMark.classList.remove("hidden");
        checkMark.classList.add("fade-out");
        setTimeout(() => {
            checkMark.classList.add("hidden");
            checkMark.classList.remove("fade-out");
        }, 2000);
    }

    function pulsePokemon() {
        pokemonImg.classList.add("pulse-animation");
        setTimeout(() => {
            pokemonImg.classList.remove("pulse-animation");
        }, 1000);
    }

    function updateExperience() {
        const totalNeeded = currentPokemon.evolutionStage === 1 ? 5 : 8;
        const experiencePercent = ((currentPokemon.correctAnswers % totalNeeded) / totalNeeded) * 100;
        experienceMeter.style.width = experiencePercent + "%";
        updateRatio();
    }

    function updateRatio() {
        const totalNeeded = currentPokemon.evolutionStage === 1 ? 5 : 8;
        ratioDisplay.textContent = `${currentPokemon.correctAnswers % totalNeeded}/${totalNeeded}`;
    }

    function evolvePokemon() {
        evolutionMessage.classList.remove("hidden");
        pokemonImg.classList.add("fade-out");
        setTimeout(() => {
            if (currentPokemon.evolutionStage === 1) {
                currentPokemon.evolutionStage = 2;
            } else if (currentPokemon.evolutionStage === 2) {
                currentPokemon.evolutionStage = 3;
            }
            pokemonImg.src = pokemonData[currentPokemon.name].img[currentPokemon.evolutionStage - 1];
            pokemonImg.classList.remove("fade-out");
            pokemonImg.classList.add("fade-in");
            updatePokedexDisplay();
            setTimeout(() => {
                pokemonImg.classList.remove("fade-in");
                evolutionMessage.classList.add("hidden");
            }, 2000);
        }, 2000);
        currentPokemon.correctAnswers = 0;
        updateExperience();
    }

    function winGame() {
        alert("Congratulations! You have fully evolved your Pokémon and won the game!");
        updatePokedexDisplay();
        resetGame();
    }

    function updatePokedexDisplay() {
        pokedexContent.innerHTML = ""; // Clear existing content
        pokemonCollection.forEach(pokemon => {
            const finalEvolutionImg = document.createElement("img");
            finalEvolutionImg.src = pokemonData[pokemon.name].img[pokemon.evolutionStage - 1];
            finalEvolutionImg.classList.add("w-24", "h-24", "mx-auto");
            const pokemonName = document.createElement("p");
            pokemonName.textContent = pokemonData[pokemon.name].name[pokemon.evolutionStage - 1];
            pokemonName.classList.add("text-center", "font-bold");
            const container = document.createElement("div");
            container.classList.add("starter-btn", "mx-2", "cursor-pointer");
            container.dataset.pokemonId = pokemon.id;
            container.appendChild(finalEvolutionImg);
            container.appendChild(pokemonName);
            container.addEventListener("click", () => startGame(pokemon.name, true, pokemon.id));
            pokedexContent.appendChild(container); // Append each Pokémon to the Pokedex
        });
        saveGameState();
    }

    function resetGame() {
        startScreen.classList.remove("hidden");
        gameScreen.classList.add("hidden");
        backHomeButton.classList.add("hidden");
    }

    function resetPokemon(pokemon) {
        pokemon.evolutionStage = 1;
        pokemon.correctAnswers = 0;
    }

    function saveGameState() {
        localStorage.setItem("pokemonCollection", JSON.stringify(pokemonCollection));
    }

    function loadGameState() {
        const storedPokemonCollection = JSON.parse(localStorage.getItem("pokemonCollection"));
        if (storedPokemonCollection) {
            pokemonCollection = storedPokemonCollection;
            updatePokedexDisplay();
        }
    }

    backHomeButton.addEventListener("click", resetGame);
});
