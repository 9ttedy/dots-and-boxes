let gameState = {
    gridSize: 5,
    players: [
        { name: "اللاعب 1", score: 0, color: "player1", isAI: false },
        { name: "الكمبيوتر", score: 0, color: "player2", isAI: true }
    ],
    currentPlayer: 0,
    horizontalLines: [],
    verticalLines: [],
    boxes: [],
    gameStarted: false,
    difficulty: "medium"
};

const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const gameBoard = document.getElementById('game-board');
const playerNameInput = document.getElementById('player-name');
const difficultySelect = document.getElementById('difficulty');
const gridSizeSelect = document.getElementById('grid-size');
const currentPlayerDisplay = document.getElementById('current-player');
const player1ScoreDisplay = document.getElementById('player1-score');
const player2ScoreDisplay = document.getElementById('player2-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const gameOverTitle = document.getElementById('game-over-title');
const gameOverMessage = document.getElementById('game-over-message');

function initGame() {
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetGame);
    menuBtn.addEventListener('click', returnToMenu);
    playAgainBtn.addEventListener('click', resetGame);
    mainMenuBtn.addEventListener('click', returnToMenu);
    playerNameInput.value = "اللاعب 1";
}

function startGame() {
    gameState.players[0].name = playerNameInput.value || "اللاعب 1";
    gameState.difficulty = difficultySelect.value;
    gameState.gridSize = parseInt(gridSizeSelect.value);
    
    gameState.players[0].score = 0;
    gameState.players[1].score = 0;
    gameState.currentPlayer = 0;
    
    initGameMatrices();
    updatePlayerDisplay();
    updateScores();
    generateGameBoard();
    
    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    
    gameState.gameStarted = true;
}

function initGameMatrices() {
    const size = gameState.gridSize;
    gameState.horizontalLines = Array(size).fill().map(() => Array(size - 1).fill(false));
    gameState.verticalLines = Array(size - 1).fill().map(() => Array(size).fill(false));
    gameState.boxes = Array(size - 1).fill().map(() => Array(size - 1).fill(null));
}

function generateGameBoard() {
    const size = gameState.gridSize;
    const dotSpacing = 60;
    const lineLength = dotSpacing - 10;
    const boardSize = (size - 1) * dotSpacing + 40;
    
    gameBoard.innerHTML = '';
    gameBoard.style.width = `${boardSize}px`;
    gameBoard.style.height = `${boardSize}px`;
    
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'dots-container';
    
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.left = `${col * dotSpacing + 20}px`;
            dot.style.top = `${row * dotSpacing + 20}px`;
            dotsContainer.appendChild(dot);
        }
    }
    
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size - 1; col++) {
            const line = document.createElement('div');
            line.className = 'line horizontal';
            line.id = `h-${row}-${col}`;
            line.style.left = `${col * dotSpacing + 20}px`;
            line.style.top = `${row * dotSpacing + 20}px`;
            line.style.width = `${lineLength}px`;
            line.addEventListener('click', () => handleLineClick('horizontal', row, col));
            dotsContainer.appendChild(line);
        }
    }
    
    for (let row = 0; row < size - 1; row++) {
        for (let col = 0; col < size; col++) {
            const line = document.createElement('div');
            line.className = 'line vertical';
            line.id = `v-${row}-${col}`;
            line.style.left = `${col * dotSpacing + 20}px`;
            line.style.top = `${row * dotSpacing + 20}px`;
            line.style.height = `${lineLength}px`;
            line.addEventListener('click', () => handleLineClick('vertical', row, col));
            dotsContainer.appendChild(line);
        }
    }
    
    for (let row = 0; row < size - 1; row++) {
        for (let col = 0; col < size - 1; col++) {
            const box = document.createElement('div');
            box.className = 'box';
            box.id = `box-${row}-${col}`;
            box.style.left = `${col * dotSpacing + 20}px`;
            box.style.top = `${row * dotSpacing + 20}px`;
            box.style.width = `${lineLength}px`;
            box.style.height = `${lineLength}px`;
            dotsContainer.appendChild(box);
        }
    }
    
    gameBoard.appendChild(dotsContainer);
}

function handleLineClick(type, row, col) {
    if (!gameState.gameStarted) return;
    
    if ((type === 'horizontal' && gameState.horizontalLines[row][col]) || 
        (type === 'vertical' && gameState.verticalLines[row][col])) {
        return;
    }
    
    claimLine(type, row, col);
    const boxesCompleted = checkForCompletedBoxes(type, row, col);
    
    if (boxesCompleted === 0) {
        switchPlayer();
        if (gameState.players[gameState.currentPlayer].isAI) {
            setTimeout(makeAIMove, 500);
        }
    } else {
        gameState.players[gameState.currentPlayer].score += boxesCompleted;
        updateScores();
        checkGameOver();
        
        if (gameState.gameStarted && gameState.players[gameState.currentPlayer].isAI) {
            setTimeout(makeAIMove, 500);
        }
    }
}

function claimLine(type, row, col) {
    const playerClass = gameState.players[gameState.currentPlayer].color;
    
    if (type === 'horizontal') {
        gameState.horizontalLines[row][col] = true;
        document.getElementById(`h-${row}-${col}`).classList.add(playerClass);
    } else {
        gameState.verticalLines[row][col] = true;
        document.getElementById(`v-${row}-${col}`).classList.add(playerClass);
    }
}

function checkForCompletedBoxes(type, row, col) {
    let boxesCompleted = 0;
    const playerClass = gameState.players[gameState.currentPlayer].color;
    
    if (type === 'horizontal') {
        if (row > 0) {
            if (gameState.horizontalLines[row - 1][col] && 
                gameState.verticalLines[row - 1][col] && 
                gameState.verticalLines[row - 1][col + 1]) {
                gameState.boxes[row - 1][col] = gameState.currentPlayer;
                document.getElementById(`box-${row - 1}-${col}`).classList.add(playerClass);
                boxesCompleted++;
            }
        }
        
        if (row < gameState.gridSize - 1) {
            if (gameState.horizontalLines[row + 1][col] && 
                gameState.verticalLines[row][col] && 
                gameState.verticalLines[row][col + 1]) {
                gameState.boxes[row][col] = gameState.currentPlayer;
                document.getElementById(`box-${row}-${col}`).classList.add(playerClass);
                boxesCompleted++;
            }
        }
    } else {
        if (col > 0) {
            if (gameState.verticalLines[row][col - 1] && 
                gameState.horizontalLines[row][col - 1] && 
                gameState.horizontalLines[row + 1][col - 1]) {
                gameState.boxes[row][col - 1] = gameState.currentPlayer;
                document.getElementById(`box-${row}-${col - 1}`).classList.add(playerClass);
                boxesCompleted++;
            }
        }
        
        if (col < gameState.gridSize - 1) {
            if (gameState.verticalLines[row][col + 1] && 
                gameState.horizontalLines[row][col] && 
                gameState.horizontalLines[row + 1][col]) {
                gameState.boxes[row][col] = gameState.currentPlayer;
                document.getElementById(`box-${row}-${col}`).classList.add(playerClass);
                boxesCompleted++;
            }
        }
    }
    
    return boxesCompleted;
}

function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 0 ? 1 : 0;
    updatePlayerDisplay();
}

function updatePlayerDisplay() {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    currentPlayerDisplay.textContent = `دور ${currentPlayer.name}`;
    currentPlayerDisplay.className = currentPlayer.color;
}

function updateScores() {
    player1ScoreDisplay.textContent = `${gameState.players[0].name}: ${gameState.players[0].score}`;
    player2ScoreDisplay.textContent = `${gameState.players[1].name}: ${gameState.players[1].score}`;
}

function checkGameOver() {
    const totalBoxes = (gameState.gridSize - 1) * (gameState.gridSize - 1);
    const filledBoxes = gameState.boxes.flat().filter(b => b !== null).length;
    
    if (filledBoxes === totalBoxes) {
        gameState.gameStarted = false;
        showGameOver();
    }
}

function showGameOver() {
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    if (gameState.players[0].score > gameState.players[1].score) {
        gameOverMessage.textContent = `فاز ${gameState.players[0].name}!`;
    } else if (gameState.players[1].score > gameState.players[0].score) {
        gameOverMessage.textContent = `فاز ${gameState.players[1].name}!`;
    } else {
        gameOverMessage.textContent = "تعادل!";
    }
}

function makeAIMove() {
    if (!gameState.gameStarted) return;
    
    let moveFound = false;
    let moveType, moveRow, moveCol;
    
    if (gameState.difficulty === 'easy') {
        moveFound = findRandomMove();
    } else if (gameState.difficulty === 'medium') {
        moveFound = findAlmostCompleteBox() || findRandomMove();
    } else {
        moveFound = findAlmostCompleteBox() || findStrategicMove() || findRandomMove();
    }
    
    if (moveFound) {
        if (moveType === 'horizontal' && !gameState.horizontalLines[moveRow][moveCol]) {
            claimLine('horizontal', moveRow, moveCol);
            const boxesCompleted = checkForCompletedBoxes('horizontal', moveRow, moveCol);
            
            if (boxesCompleted === 0) {
                switchPlayer();
            } else {
                gameState.players[gameState.currentPlayer].score += boxesCompleted;
                updateScores();
                checkGameOver();
                
                if (gameState.gameStarted && gameState.players[gameState.currentPlayer].isAI) {
                    setTimeout(makeAIMove, 500);
                }
            }
        } 
        else if (moveType === 'vertical' && !gameState.verticalLines[moveRow][moveCol]) {
            claimLine('vertical', moveRow, moveCol);
            const boxesCompleted = checkForCompletedBoxes('vertical', moveRow, moveCol);
            
            if (boxesCompleted === 0) {
                switchPlayer();
            } else {
                gameState.players[gameState.currentPlayer].score += boxesCompleted;
                updateScores();
                checkGameOver();
                
                if (gameState.gameStarted && gameState.players[gameState.currentPlayer].isAI) {
                    setTimeout(makeAIMove, 500);
                }
            }
        }
    }
    
    function findRandomMove() {
        const availableMoves = [];
        
        for (let row = 0; row < gameState.gridSize; row++) {
            for (let col = 0; col < gameState.gridSize - 1; col++) {
                if (!gameState.horizontalLines[row][col]) {
                    availableMoves.push({ type: 'horizontal', row, col });
                }
            }
        }
        
        for (let row = 0; row < gameState.gridSize - 1; row++) {
            for (let col = 0; col < gameState.gridSize; col++) {
                if (!gameState.verticalLines[row][col]) {
                    availableMoves.push({ type: 'vertical', row, col });
                }
            }
        }
        
        if (availableMoves.length > 0) {
            const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            moveType = randomMove.type;
            moveRow = randomMove.row;
            moveCol = randomMove.col;
            return true;
        }
        
        return false;
    }
    
    function findAlmostCompleteBox() {
        for (let row = 0; row < gameState.gridSize - 1; row++) {
            for (let col = 0; col < gameState.gridSize - 1; col++) {
                if (gameState.boxes[row][col] === null) {
                    let missingLines = 0;
                    let missingLineType, missingLineRow, missingLineCol;
                    
                    if (!gameState.horizontalLines[row][col]) {
                        missingLines++;
                        missingLineType = 'horizontal';
                        missingLineRow = row;
                        missingLineCol = col;
                    }
                    
                    if (!gameState.horizontalLines[row + 1][col]) {
                        missingLines++;
                        missingLineType = 'horizontal';
                        missingLineRow = row + 1;
                        missingLineCol = col;
                    }
                    
                    if (!gameState.verticalLines[row][col]) {
                        missingLines++;
                        missingLineType = 'vertical';
                        missingLineRow = row;
                        missingLineCol = col;
                    }
                    
                    if (!gameState.verticalLines[row][col + 1]) {
                        missingLines++;
                        missingLineType = 'vertical';
                        missingLineRow = row;
                        missingLineCol = col + 1;
                    }
                    
                    if (missingLines === 1) {
                        moveType = missingLineType;
                        moveRow = missingLineRow;
                        moveCol = missingLineCol;
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    function findStrategicMove() {
        return false;
    }
}

function resetGame() {
    gameState.gameStarted = false;
    startGame();
}

function returnToMenu() {
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    gameState.gameStarted = false;
}

window.onload = initGame;