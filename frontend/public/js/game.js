// Game state management
let gameState = null;
let boardSize = 7;
let gameActive = false;
let isProcessing = false;
let clickTimeout = null;

// DOM Elements
const hexBoard = document.getElementById('hexBoard');
const newGameBtn = document.getElementById('newGameBtn');
const boardSizeSelect = document.getElementById('boardSize');
const gameModeSelect = document.getElementById('gameMode');
const difficultySelect = document.getElementById('difficulty');
const currentPlayerBadge = document.getElementById('currentPlayerBadge');
const gameStatus = document.getElementById('gameStatus');
const aiExplanation = document.getElementById('aiExplanation');
const explanationText = document.getElementById('explanationText');
const winnerModal = document.getElementById('winnerModal');
const winnerName = document.getElementById('winnerName');
const winnerMessage = document.getElementById('winnerMessage');
const playAgainBtn = document.getElementById('playAgainBtn');
const moveCountDisplay = document.getElementById('moveCount');
const boardSizeDisplay = document.getElementById('boardSizeDisplay');

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
  if (!hexBoard || !newGameBtn) {
    console.error('Required DOM elements not found');
    return;
  }
  
  initGame();
  
  newGameBtn.addEventListener('click', () => {
    if (!isProcessing) initGame();
  });
  
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      if (!isProcessing) initGame();
    });
  }
  
  boardSizeSelect.addEventListener('change', () => {
    if (!gameActive && !isProcessing) initGame();
  });
  
  gameModeSelect.addEventListener('change', () => {
    if (!gameActive && !isProcessing) initGame();
  });
  
  difficultySelect.addEventListener('change', () => {
    if (!gameActive && !isProcessing) initGame();
  });
});

// Initialize new game
async function initGame() {
  if (isProcessing) return;
  
  isProcessing = true;
  boardSize = parseInt(boardSizeSelect.value) || 7;
  const mode = gameModeSelect.value || 'human-vs-ai';
  const difficulty = difficultySelect.value || 'medium';
  
  gameActive = false;
  if (hexBoard) hexBoard.innerHTML = '';
  
  if (winnerModal) winnerModal.classList.add('hidden');
  if (aiExplanation) aiExplanation.classList.add('hidden');
  if (gameStatus) gameStatus.textContent = 'Loading...';
  
  if (newGameBtn) newGameBtn.disabled = true;
  
  try {
    const response = await fetch('/api/game/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ size: boardSize, difficulty, mode })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(errorData.error || 'Failed to reset game');
    }
    
    gameState = await response.json();
    
    if (!gameState || !gameState.board) {
      throw new Error('Invalid game state received from server');
    }
    
    createBoard();
    updateUI();
    gameActive = true;
    
  } catch (error) {
    console.error('Error initializing game:', error);
    if (gameStatus) {
      gameStatus.textContent = `Error: ${error.message}`;
    }
    gameActive = false;
  } finally {
    isProcessing = false;
    if (newGameBtn) newGameBtn.disabled = false;
  }
}

// Create hex board
function createBoard() {
  if (!hexBoard) return;
  
  hexBoard.innerHTML = '';
  
  for (let row = 0; row < boardSize; row++) {
    const hexRow = document.createElement('div');
    hexRow.className = 'hex-row';
    
    // Offset for hexagonal pattern
    if (row % 2 === 1) {
      hexRow.style.marginLeft = '27px';
    }
    
    for (let col = 0; col < boardSize; col++) {
      const hex = document.createElement('div');
      hex.className = 'hex-cell empty';
      hex.dataset.row = row;
      hex.dataset.col = col;
      
      // Use pointer-events and immediate click handling
      hex.addEventListener('click', handleCellClick, { once: false, passive: true });
      hex.style.pointerEvents = 'auto';
      hex.style.cursor = 'pointer';
      
      hexRow.appendChild(hex);
    }
    
    hexBoard.appendChild(hexRow);
  }
  
  updateBoard();
}

// Handle cell click - optimized for responsiveness
function handleCellClick(e) {
  // Prevent multiple rapid clicks
  if (isProcessing || !gameActive) {
    e.stopPropagation();
    e.preventDefault();
    return false;
  }
  
  const cell = e.target;
  if (!cell || !cell.dataset || cell.classList.contains('red') || cell.classList.contains('blue')) {
    return false;
  }
  
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  
  // Validate indices
  if (isNaN(row) || isNaN(col) || row < 0 || col < 0) {
    return false;
  }
  
  // Check if cell is empty
  if (!gameState || !gameState.board || !gameState.board[row] || gameState.board[row][col] !== null) {
    return false;
  }
  
  // Immediately disable further clicks
  isProcessing = true;
  gameActive = false;
  
  // Visual feedback - immediate
  cell.style.opacity = '0.6';
  cell.style.pointerEvents = 'none';
  
  if (gameStatus) gameStatus.textContent = 'Processing move...';
  
  // Process move asynchronously
  processMove(row, col, cell);
  
  return false;
}

// Process move separately for better responsiveness
async function processMove(row, col, cell) {
  try {
    const response = await fetch('/api/game/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ row, col })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      console.error('Move error:', error);
      if (gameStatus) {
        gameStatus.textContent = error.error || 'Move failed';
      }
      // Re-enable on error
      if (cell) {
        cell.style.opacity = '1';
        cell.style.pointerEvents = 'auto';
      }
      gameActive = true;
      isProcessing = false;
      return;
    }
    
    const result = await response.json();
    
    if (!result || !result.gameState) {
      throw new Error('Invalid response from server');
    }
    
    gameState = result.gameState;
    
    // Update board immediately
    updateBoard();
    updateUI();
    
    // Show AI explanation if available
    if (result.aiExplanation && result.aiExplanation.explanation && aiExplanation) {
      showAIExplanation(result.aiExplanation);
    }
    
    // Check if game is over
    if (gameState.winner) {
      showWinner();
      return;
    }
    
    // Re-enable clicks for next move
    gameActive = true;
    
  } catch (error) {
    console.error('Error making move:', error);
    if (gameStatus) {
      gameStatus.textContent = `Error: ${error.message}`;
    }
    // Re-enable on error
    if (cell) {
      cell.style.opacity = '1';
      cell.style.pointerEvents = 'auto';
    }
    gameActive = true;
  } finally {
    isProcessing = false;
  }
}

// Update board display
function updateBoard() {
  if (!gameState || !gameState.board || !hexBoard) return;
  
  const cells = hexBoard.querySelectorAll('.hex-cell');
  cells.forEach(cell => {
    if (!cell.dataset) return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    if (isNaN(row) || isNaN(col)) return;
    if (!gameState.board[row]) return;
    
    const cellValue = gameState.board[row][col];
    
    if (cellValue === null) {
      cell.className = 'hex-cell empty';
      cell.style.pointerEvents = 'auto';
      cell.style.cursor = 'pointer';
    } else {
      cell.className = `hex-cell ${cellValue}`;
      cell.style.pointerEvents = 'none';
      cell.style.cursor = 'default';
      cell.style.opacity = '1';
    }
  });
}

// Update UI elements
function updateUI() {
  if (!gameState) return;
  
  // Update current player
  const currentPlayer = gameState.currentPlayer || 'red';
  const playerColor = currentPlayer === 'red' ? 'red' : 'blue';
  const playerName = currentPlayer === 'red' ? 'Red Player (Top→Bottom)' : 'Blue Player (Left→Right)';
  
  if (currentPlayerBadge) {
    currentPlayerBadge.innerHTML = `
      <span class="player-color ${playerColor}"></span>
      <span class="player-name">${playerName}</span>
    `;
  }
  
  // Update game status
  if (gameStatus) {
    if (gameState.winner) {
      gameStatus.textContent = 'Game Over';
    } else if (gameState.mode === 'human-vs-ai' && currentPlayer === 'blue') {
      gameStatus.textContent = 'AI is thinking...';
    } else {
      gameStatus.textContent = 'Your turn';
    }
  }
  
  // Update stats
  if (moveCountDisplay) {
    moveCountDisplay.textContent = gameState.moveCount || 0;
  }
  if (boardSizeDisplay) {
    boardSizeDisplay.textContent = `${gameState.size || boardSize}×${gameState.size || boardSize}`;
  }
}

// Show AI explanation
function showAIExplanation(explanation) {
  if (!explanation || !explanation.explanation) return;
  if (!aiExplanation || !explanationText) return;
  
  explanationText.textContent = explanation.explanation;
  aiExplanation.classList.remove('hidden');
}

// Show winner modal
function showWinner() {
  if (!gameState || !gameState.winner) return;
  
  gameActive = false;
  isProcessing = false;
  
  const winner = gameState.winner;
  const winnerText = winner === 'red' 
    ? 'Red Player Wins! (Connected Top to Bottom)' 
    : 'Blue Player Wins! (Connected Left to Right)';
  const winnerClass = winner;
  
  if (winnerName) {
    winnerName.textContent = winnerText;
    winnerName.className = `winner-name ${winnerClass}`;
  }
  
  if (winnerMessage) {
    if (gameState.mode === 'human-vs-ai') {
      winnerMessage.textContent = winner === 'red' 
        ? 'Congratulations! You connected Top to Bottom!' 
        : 'The AI connected Left to Right! Try again!';
    } else {
      winnerMessage.textContent = 'Great game! The winner connected their sides!';
    }
  }
  
  if (winnerModal) {
    winnerModal.classList.remove('hidden');
  }
}
