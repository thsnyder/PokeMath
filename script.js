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
        // Add visual feedback for selected grade
        document.querySelectorAll('.grade-option').forEach(option => {
            option.classList.remove('selected');
            if (option.querySelector('input').value === selectedGradeLevel) {
                option.classList.add('selected');
                option.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
                option.style.borderColor = '#059669';
                option.style.transform = 'scale(1.05)';
            } else {
                option.style.background = '';
                option.style.borderColor = 'transparent';
                option.style.transform = '';
            }
        });
    });

    // Function to attach event listeners to initial starter buttons in HTML
    function attachInitialStarterButtonListeners() {
        document.querySelectorAll(".starter-btn[data-pokemon]").forEach(button => {
            button.addEventListener("click", () => {
                if (selectedGradeLevel) {
                    const chosenPokemon = button.getAttribute("data-pokemon");
                    if (chosenPokemon) {
                        // Add visual feedback
                        button.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            startGame(chosenPokemon);
                        }, 200);
                    }
                } else {
                    alert("⚠️ Oops! Please choose your grade level first! 📚");
                    // Shake animation for grade form
                    const gradeForm = document.getElementById("grade-form");
                    gradeForm.style.animation = 'shake 0.5s';
                    setTimeout(() => {
                        gradeForm.style.animation = '';
                    }, 500);
                }
            });
        });
    }
    
    // Attach listeners to initial buttons after DOM is ready
    setTimeout(() => {
        attachInitialStarterButtonListeners();
    }, 100);

    function startGame(pokemon, continueGame = false, id = null) {
        if (!continueGame) {
            currentPokemon = pokemonCollection.find(p => p.name === pokemon);
        } else {
            currentPokemon = pokemonCollection.find(p => p.id === id);
        }

        const gradeQuestions = questions[selectedGradeLevel];
        if (!gradeQuestions) {
            alert("⚠️ Oops! No questions available for this grade level. Please try another one!");
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

    function handleAnswerSubmission() {
        const userAnswer = parseInt(answerInput.value);
        if (isNaN(userAnswer)) {
            alert("⚠️ Please enter a number!");
            return;
        }
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
            alert("❌ Not quite right! Keep trying - you've got this! 💪");
        }
        answerInput.value = "";
        answerInput.focus();
    }

    submitAnswer.addEventListener("click", handleAnswerSubmission);
    
    // Allow Enter key to submit answer
    answerInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleAnswerSubmission();
        }
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
        if (!currentPokemon) return;
        const totalNeeded = currentPokemon.evolutionStage === 1 ? 5 : 8;
        const currentProgress = currentPokemon.correctAnswers % totalNeeded;
        ratioDisplay.textContent = `${currentProgress}/${totalNeeded} correct answers`;
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
        alert("🎉🎊 AMAZING! 🎊🎉\n\nYou've fully evolved your Pokémon! You're a math master! 🌟\n\nKeep playing to collect all the Pokémon!");
        updatePokedexDisplay();
        resetGame();
    }

    function updatePokedexDisplay() {
        pokedexContent.innerHTML = ""; // Clear existing content
        pokemonCollection.forEach(pokemon => {
            const finalEvolutionImg = document.createElement("img");
            const imgPath = pokemonData[pokemon.name].img[pokemon.evolutionStage - 1];
            finalEvolutionImg.src = imgPath;
            finalEvolutionImg.classList.add("w-32", "h-32", "mx-auto", "mb-2", "object-contain");
            finalEvolutionImg.alt = pokemonData[pokemon.name].name[pokemon.evolutionStage - 1];
            // Add error handling for images
            finalEvolutionImg.onload = function() {
                console.log("Successfully loaded:", imgPath);
            };
            finalEvolutionImg.onerror = function() {
                console.error("Failed to load image:", imgPath);
                // Try absolute path as fallback
                const absolutePath = imgPath.startsWith('/') ? imgPath : '/' + imgPath;
                console.log("Trying fallback path:", absolutePath);
                this.src = absolutePath;
            };
            const pokemonName = document.createElement("p");
            pokemonName.textContent = pokemonData[pokemon.name].name[pokemon.evolutionStage - 1];
            pokemonName.classList.add("font-bold", "text-lg", "text-center");
            
            // Add color styling based on Pokémon type
            let bgClasses = ["bg-gradient-to-br", "from-green-50", "to-green-100"];
            let textColor = "color: #059669;";
            if (pokemon.name === "charmander") {
                bgClasses = ["bg-gradient-to-br", "from-orange-50", "to-orange-100"];
                textColor = "color: #dc2626;";
            } else if (pokemon.name === "squirtle") {
                bgClasses = ["bg-gradient-to-br", "from-blue-50", "to-blue-100"];
                textColor = "color: #0284c7;";
            }
            pokemonName.style.cssText = textColor;
            
            const container = document.createElement("div");
            container.classList.add("starter-btn", "pokemon-card", "mx-2", "cursor-pointer", "p-4", "rounded-xl", ...bgClasses);
            container.dataset.pokemon = pokemon.name;
            container.dataset.pokemonId = pokemon.id;
            container.appendChild(finalEvolutionImg);
            container.appendChild(pokemonName);
            container.addEventListener("click", () => {
                if (selectedGradeLevel) {
                    startGame(pokemon.name, true, pokemon.id);
                } else {
                    alert("⚠️ Oops! Please choose your grade level first! 📚");
                    const gradeForm = document.getElementById("grade-form");
                    gradeForm.style.animation = 'shake 0.5s';
                    setTimeout(() => {
                        gradeForm.style.animation = '';
                    }, 500);
                }
            });
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