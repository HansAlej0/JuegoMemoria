document.addEventListener("DOMContentLoaded", () => {
    // Elementos principales del DOM
    const board = document.getElementById("board"); // Contenedor del tablero de cartas
    const startBtn = document.getElementById("start-btn"); // Botón para iniciar el juego
    const completedPairsEl = document.getElementById("completed-pairs"); // Elemento que muestra los pares completados
    const remainingPairsEl = document.getElementById("remaining-pairs"); // Elemento que muestra los pares restantes
    const timerEl = document.getElementById("timer"); // Elemento que muestra el tiempo transcurrido
    const themeToggleBtn = document.getElementById("theme-toggle"); // Botón para alternar entre temas (claro/oscuro)

    // Variables del juego
    let timerInterval; // Intervalo para manejar el temporizador
    let elapsedTime = 0; // Tiempo transcurrido en milisegundos
    let flippedCards = []; // Lista de cartas actualmente volteadas
    let matchedPairs = 0; // Cantidad de pares coincidentes encontrados
    const pairs = 8; // Total de pares en el juego

    // Emojis usados para las cartas
    const emojis = ["🍎", "🍌", "🍇", "🍓", "🍍", "🥝", "🍑", "🍒"];

    // Función para mezclar un array (Fisher-Yates)
    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Intercambio de elementos
        }
        return array;
    };

    // Función para crear una carta
    const createCard = (emoji) => {
        const card = document.createElement("div");
        card.classList.add("card"); // Clase base para todas las cartas
        card.textContent = ""; // La carta comienza sin mostrar el emoji
        card.dataset.emoji = emoji; // Asigna el emoji como un atributo de datos
        card.setAttribute("tabindex", "0"); // Permite enfocar la carta con el teclado
        card.setAttribute("aria-label", "Carta no volteada"); // Accesibilidad para lectores de pantalla

        // Eventos para interactuar con la carta
        card.addEventListener("click", () => flipCard(card)); // Click para voltear
        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") flipCard(card); // Voltear con Enter o Espacio
        });

        return card;
    };

    // Función para voltear una carta
    const flipCard = (card) => {
        // Verifica si se pueden voltear más cartas y si la carta no está volteada
        if (
            flippedCards.length < 2 &&
            !card.classList.contains("flipped") &&
            !board.classList.contains("disabled")
        ) {
            card.classList.add("flipped"); // Marca la carta como volteada
            card.textContent = card.dataset.emoji; // Muestra el emoji en la carta
            flippedCards.push(card); // Agrega la carta a la lista de cartas volteadas

            if (flippedCards.length === 2) checkMatch(); // Si hay dos cartas volteadas, verifica coincidencia
        }
    };

    // Función para verificar si las cartas volteadas coinciden
    const checkMatch = () => {
        const [card1, card2] = flippedCards; // Obtiene las dos cartas volteadas
        const emoji1 = card1.dataset.emoji;
        const emoji2 = card2.dataset.emoji;

        disableBoard(); // Desactiva el tablero temporalmente para evitar interacción

        if (emoji1 === emoji2) {
            // Si las cartas coinciden
            matchedPairs++; // Incrementa el contador de pares completados
            completedPairsEl.textContent = matchedPairs; // Actualiza el contador en la interfaz
            remainingPairsEl.textContent = (pairs - matchedPairs).toString(); // Actualiza los pares restantes
            flippedCards = []; // Vacía la lista de cartas volteadas

            if (matchedPairs === pairs) {
                // Si se completan todos los pares
                clearInterval(timerInterval); // Detiene el temporizador
                setTimeout(() => {
                    showEndGameOverlay(); // Muestra la pantalla de fin del juego
                    resetGame(); // Reinicia el juego
                }, 1000);
            } else {
                enableBoard(); // Reactiva el tablero
            }
        } else {
            // Si las cartas no coinciden
            setTimeout(() => {
                card1.classList.remove("flipped"); // Voltea la primera carta de regreso
                card1.textContent = "";
                card2.classList.remove("flipped"); // Voltea la segunda carta de regreso
                card2.textContent = "";
                flippedCards = []; // Vacía la lista de cartas volteadas
                enableBoard(); // Reactiva el tablero
            }, 1000);
        }

        // Quitar la clase disabled después de un tiempo
        setTimeout(() => {
            board.classList.remove("disabled");
        }, 1000);
    };

    // Función para inicializar el juego
    const startGame = () => {
        resetGame(); // Reinicia todos los elementos del juego

        const doubledEmojis = shuffle([...emojis, ...emojis]); // Duplica y mezcla los emojis
        doubledEmojis.forEach((emoji) => {
            const card = createCard(emoji); // Crea una carta para cada emoji
            board.appendChild(card); // Agrega la carta al tablero
        });

        startTimer(); // Inicia el temporizador

        startBtn.style.display = "none"; // Oculta el botón de inicio
        themeToggleBtn.style.display = "none"; // Oculta el botón de tema
    };

    // Función para reiniciar el estado del juego
    const resetGame = () => {
        board.innerHTML = ""; // Limpia el tablero
        matchedPairs = 0; // Resetea los pares encontrados
        flippedCards = []; // Vacía la lista de cartas volteadas
        elapsedTime = 0; // Reinicia el tiempo transcurrido
        clearInterval(timerInterval); // Detiene el temporizador
        resetUI(); // Resetea los elementos de la interfaz
    };

    // Función para reiniciar los elementos de la interfaz
    const resetUI = () => {
        completedPairsEl.textContent = "0";
        remainingPairsEl.textContent = pairs.toString();
        timerEl.textContent = "00:00";
        startBtn.style.display = "inline-block";
        themeToggleBtn.style.display = "inline-block";
    };

    // Función para manejar el temporizador
    const startTimer = () => {
        const startTime = Date.now() - elapsedTime; // Usa tiempo transcurrido para continuar el cronómetro
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            const mins = String(Math.floor(elapsedTime / 60000)).padStart(2, "0");
            const secs = String(Math.floor((elapsedTime % 60000) / 1000)).padStart(
                2,
                "0"
            );
            timerEl.textContent = `${mins}:${secs}`; // Actualiza el tiempo en la interfaz
        }, 1000);
    };

    // Función para desactivar el tablero
    const disableBoard = () => {
        board.classList.add("disabled");
    };

    // Función para reactivar el tablero
    const enableBoard = () => {
        board.classList.remove("disabled");
    };

    // Función para mostrar la pantalla de fin del juego
    const showEndGameOverlay = () => {
        const overlay = document.createElement("div");
        overlay.classList.add("overlay"); // Clase de estilo para la superposición
        overlay.innerHTML = `
        <div class="end-game-message">
            <h2>¡Juego completado!</h2>
            <button id="restart-btn">Reiniciar</button>
        </div>
    `;
        document.body.appendChild(overlay);

        const restartBtn = document.getElementById("restart-btn");
        restartBtn.addEventListener("click", () => {
            overlay.remove(); // Elimina la superposición
            resetGame();
        });
    };

    // Función para alternar entre temas claro y oscuro
    const applyTheme = (theme) => {
        document.body.classList.toggle("dark-mode", theme === "dark");
    };

    // Listeners para alternar el tema y manejar el inicio del juego
    themeToggleBtn.addEventListener("click", () => {
        const newTheme = document.body.classList.contains("dark-mode")
            ? "light"
            : "dark";
        localStorage.setItem("theme", newTheme); // Guarda la preferencia del tema
        applyTheme(newTheme);
    });

    window.addEventListener("load", () => {
        applyTheme(localStorage.getItem("theme") || "light"); // Aplica el tema al cargar la página
    });

    startBtn.addEventListener("click", startGame); // Inicia el juego al hacer clic en el botón de inicio
});
