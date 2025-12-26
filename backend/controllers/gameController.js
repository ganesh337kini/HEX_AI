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
  makeMove(gameState, row, col, currentPlayer);
  
  // Check for winner
  if (checkWin(gameState.board, currentPlayer)) {
    gameState.winner = currentPlayer;
    gameState.currentPlayer = currentPlayer; // Keep current player for display
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
    makeMove(gameState, aiMove.row, aiMove.col, 'blue');
    aiExplanation = explainMove(boardBefore, gameState.board, aiMove, gameState.difficulty);
    
    if (checkWin(gameState.board, 'blue')) {
      gameState.winner = 'blue';
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

