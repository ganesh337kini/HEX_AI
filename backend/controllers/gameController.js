import { resetGame, makeMove, checkWin } from '../ai/hexUtils.js';
import { getAIMove } from '../ai/minimax.js';
import { explainMove } from '../ai/explain.js';

// Session-based game storage
const games = new Map();

export function getGameState(sessionId) {
  if (!games.has(sessionId)) {
    games.set(sessionId, resetGame(5, 'medium', 'human-vs-ai'));
  }
  return games.get(sessionId);
}

export function createNewGame(sessionId, size, difficulty, mode) {
  const gameState = resetGame(size, difficulty, mode);
  games.set(sessionId, gameState);
  return gameState;
}

export function handlePlayerMove(sessionId, row, col) {
  const gameState = getGameState(sessionId);
  
  if (gameState.winner || gameState.mode === 'ai-vs-ai') {
    return { error: 'Invalid move' };
  }

  // Validate move
  if (!isValidMove(row, col, gameState.board)) {
    return { error: 'Invalid move' };
  }

  // Determine current player based on mode
  let currentPlayer;
  if (gameState.mode === 'human-vs-human') {
    currentPlayer = gameState.currentPlayer;
  } else {
    currentPlayer = 'red'; // Human is always red in vs AI mode
  }

  // Make player move
  const moveSuccess = makeMove(gameState, row, col, currentPlayer);
  if (!moveSuccess) {
    return { error: 'Invalid move - cell already occupied' };
  }
  
  // Check for winner immediately after player move
  const playerWon = checkWin(gameState.board, currentPlayer);
  if (playerWon) {
    gameState.winner = currentPlayer;
    gameState.currentPlayer = currentPlayer;
    // Log for debugging
    console.log(`✓ Player ${currentPlayer} wins! Board state:`, JSON.stringify(gameState.board).substring(0, 100));
    return { gameState, aiExplanation: null };
  }

  // Switch player for human vs human
  if (gameState.mode === 'human-vs-human') {
    gameState.currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
    return { gameState, aiExplanation: null };
  }

  // AI move for human vs AI
  const aiMove = getAIMove(gameState);
  let aiExplanation = null;
  
  if (aiMove) {
    const boardBefore = JSON.parse(JSON.stringify(gameState.board));
    const aiMoveSuccess = makeMove(gameState, aiMove.row, aiMove.col, 'blue');
    
    if (!aiMoveSuccess) {
      console.error('AI move failed - cell already occupied');
      gameState.currentPlayer = 'red';
      return { gameState, aiExplanation: null };
    }
    
    aiExplanation = explainMove(boardBefore, gameState.board, aiMove, gameState.difficulty);
    
    // Check if AI wins
    const aiWon = checkWin(gameState.board, 'blue');
    if (aiWon) {
      gameState.winner = 'blue';
      console.log('✓ AI (blue) wins!');
    } else {
      // Switch back to human player after AI move
      gameState.currentPlayer = 'red';
    }
  }

  return { gameState, aiExplanation };
}

function isValidMove(row, col, board) {
  return row >= 0 && row < board.length &&
         col >= 0 && col < board[0].length &&
         !board[row][col];
}

