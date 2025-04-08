// Game constants
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const EMPTY = 'empty';

// Tetromino shapes and their rotations
const SHAPES = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]
};

// Game variables
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let lines = 0;
let level = 1;
let gameInterval = null;
let gameSpeed = 1000; // Initial speed in milliseconds

// DOM elements
const gameBoard = document.getElementById('game-board');
const nextPieceDisplay = document.getElementById('next-piece-display');
const scoreElement = document.getElementById('score');
const linesElement = document.getElementById('lines');
const levelElement = document.getElementById('level');

// Initialize the game
function init() {
    // Create the game board
    createBoard();
    
    // Create the next piece display
    createNextPieceDisplay();
    
    // Generate the first pieces
    nextPiece = generateRandomPiece();
    spawnNewPiece();
    
    // Start the game loop
    startGameLoop();
    
    // Set up event listeners
    setupControls();
}

// Create the game board
function createBoard() {
    // Initialize the board array
    for (let row = 0; row < ROWS; row++) {
        board[row] = [];
        for (let col = 0; col < COLS; col++) {
            board[row][col] = EMPTY;
        }
    }
    
    // Create the visual board
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row', row);
            cell.setAttribute('data-col', col);
            gameBoard.appendChild(cell);
        }
    }
}

// Create the next piece display
function createNextPieceDisplay() {
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row', row);
            cell.setAttribute('data-col', col);
            nextPieceDisplay.appendChild(cell);
        }
    }
}

// Generate a random tetromino
function generateRandomPiece() {
    const shapes = Object.keys(SHAPES);
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    
    return {
        shape: randomShape,
        matrix: SHAPES[randomShape],
        row: 0,
        col: Math.floor((COLS - SHAPES[randomShape][0].length) / 2)
    };
}

// Spawn a new piece
function spawnNewPiece() {
    currentPiece = nextPiece;
    nextPiece = generateRandomPiece();
    
    // Display the next piece
    displayNextPiece();
    
    // Check if the game is over
    if (isCollision(currentPiece)) {
        gameOver();
    }
    
    // Draw the current piece
    drawPiece();
}

// Display the next piece
function displayNextPiece() {
    // Clear the next piece display
    const cells = nextPieceDisplay.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.className = 'cell';
    });
    
    // Draw the next piece
    const matrix = nextPiece.matrix;
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
                const cellRow = row + (4 - matrix.length) / 2;
                const cellCol = col + (4 - matrix[row].length) / 2;
                const cell = nextPieceDisplay.querySelector(`[data-row="${cellRow}"][data-col="${cellCol}"]`);
                if (cell) {
                    cell.classList.add('tetromino', nextPiece.shape);
                }
            }
        }
    }
}

// Draw the current piece on the board
function drawPiece() {
    const matrix = currentPiece.matrix;
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
                const cellRow = currentPiece.row + row;
                const cellCol = currentPiece.col + col;
                const cell = gameBoard.querySelector(`[data-row="${cellRow}"][data-col="${cellCol}"]`);
                if (cell) {
                    cell.classList.add('tetromino', currentPiece.shape);
                }
            }
        }
    }
}

// Clear the current piece from the board
function clearPiece() {
    const matrix = currentPiece.matrix;
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
                const cellRow = currentPiece.row + row;
                const cellCol = currentPiece.col + col;
                const cell = gameBoard.querySelector(`[data-row="${cellRow}"][data-col="${cellCol}"]`);
                if (cell) {
                    cell.className = 'cell';
                }
            }
        }
    }
}

// Check if the piece collides with the board or other pieces
function isCollision(piece) {
    const matrix = piece.matrix;
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
                const cellRow = piece.row + row;
                const cellCol = piece.col + col;
                
                // Check if out of bounds
                if (cellRow < 0 || cellRow >= ROWS || cellCol < 0 || cellCol >= COLS) {
                    return true;
                }
                
                // Check if collides with another piece
                if (board[cellRow][cellCol] !== EMPTY) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Move the piece down
function moveDown() {
    clearPiece();
    currentPiece.row++;
    
    if (isCollision(currentPiece)) {
        currentPiece.row--;
        lockPiece();
        clearLines();
        updateBoard(); // Add this line to update the visual board after locking a piece
        spawnNewPiece();
    }
    
    drawPiece();
}

// Move the piece left
function moveLeft() {
    clearPiece();
    currentPiece.col--;
    
    if (isCollision(currentPiece)) {
        currentPiece.col++;
    }
    
    drawPiece();
}

// Move the piece right
function moveRight() {
    clearPiece();
    currentPiece.col++;
    
    if (isCollision(currentPiece)) {
        currentPiece.col--;
    }
    
    drawPiece();
}

// Rotate the piece
function rotatePiece() {
    clearPiece();
    
    // Create a new matrix for the rotated piece
    const matrix = currentPiece.matrix;
    const N = matrix.length;
    const rotatedMatrix = [];
    
    for (let row = 0; row < N; row++) {
        rotatedMatrix[row] = [];
        for (let col = 0; col < N; col++) {
            rotatedMatrix[row][col] = matrix[N - 1 - col][row];
        }
    }
    
    // Save the original matrix
    const originalMatrix = currentPiece.matrix;
    
    // Try the rotation
    currentPiece.matrix = rotatedMatrix;
    
    // If there's a collision, revert back
    if (isCollision(currentPiece)) {
        currentPiece.matrix = originalMatrix;
    }
    
    drawPiece();
}

// Lock the piece in place
function lockPiece() {
    const matrix = currentPiece.matrix;
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
                const cellRow = currentPiece.row + row;
                const cellCol = currentPiece.col + col;
                board[cellRow][cellCol] = currentPiece.shape;
            }
        }
    }
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;
    
    for (let row = ROWS - 1; row >= 0; row--) {
        let isLineComplete = true;
        
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === EMPTY) {
                isLineComplete = false;
                break;
            }
        }
        
        if (isLineComplete) {
            // Clear the line
            for (let r = row; r > 0; r--) {
                for (let col = 0; col < COLS; col++) {
                    board[r][col] = board[r - 1][col];
                }
            }
            
            // Clear the top line
            for (let col = 0; col < COLS; col++) {
                board[0][col] = EMPTY;
            }
            
            // Move the row pointer back to check the new row
            row++;
            linesCleared++;
        }
    }
    
    // Update the score and level
    if (linesCleared > 0) {
        updateScore(linesCleared);
        updateBoard();
    }
}

// Update the visual board
function updateBoard() {
    const cells = gameBoard.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = parseInt(cell.getAttribute('data-row'));
        const col = parseInt(cell.getAttribute('data-col'));
        
        cell.className = 'cell';
        
        if (board[row][col] !== EMPTY) {
            cell.classList.add('tetromino', board[row][col]);
        }
    });
}

// Update the score
function updateScore(linesCleared) {
    // Update lines
    lines += linesCleared;
    linesElement.textContent = lines;
    
    // Update score (more points for clearing multiple lines at once)
    const points = [40, 100, 300, 1200]; // Points for 1, 2, 3, 4 lines
    score += points[linesCleared - 1] * level;
    scoreElement.textContent = score;
    
    // Update level
    level = Math.floor(lines / 10) + 1;
    levelElement.textContent = level;
    
    // Update game speed
    gameSpeed = Math.max(100, 1000 - (level - 1) * 100);
    clearInterval(gameInterval);
    startGameLoop();
}

// Start the game loop
function startGameLoop() {
    gameInterval = setInterval(moveDown, gameSpeed);
}

// Game over
function gameOver() {
    clearInterval(gameInterval);
    alert(`Game Over! Your score: ${score}`);
    resetGame();
}

// Reset the game
function resetGame() {
    // Clear the board
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            board[row][col] = EMPTY;
        }
    }
    
    // Reset game variables
    score = 0;
    lines = 0;
    level = 1;
    gameSpeed = 1000;
    
    // Update the display
    scoreElement.textContent = score;
    linesElement.textContent = lines;
    levelElement.textContent = level;
    
    // Clear the visual board
    updateBoard();
    
    // Generate new pieces
    nextPiece = generateRandomPiece();
    spawnNewPiece();
    
    // Restart the game loop
    startGameLoop();
}

// Set up controls
function setupControls() {
    // Button controls
    document.getElementById('left').addEventListener('click', moveLeft);
    document.getElementById('right').addEventListener('click', moveRight);
    document.getElementById('down').addEventListener('click', moveDown);
    document.getElementById('rotate').addEventListener('click', rotatePiece);
    
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowLeft':
                moveLeft();
                break;
            case 'ArrowRight':
                moveRight();
                break;
            case 'ArrowDown':
                moveDown();
                break;
            case 'ArrowUp':
                rotatePiece();
                break;
            case ' ': // Space bar for hard drop
                while (!isCollision({...currentPiece, row: currentPiece.row + 1})) {
                    clearPiece();
                    currentPiece.row++;
                }
                drawPiece();
                break;
        }
    });
}

// Start the game when the page loads
window.addEventListener('load', init);