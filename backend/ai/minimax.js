import { getAvailableMoves, makeMove, checkWin } from './hexUtils.js';
import { evaluateBoard } from './heuristic.js';
import { alphaBeta } from './alphaBeta.js';

// Get difficulty depth - optimized for performance
function getDepth(difficulty) {
  const depths = {
    easy: 2,      // Fast, good for beginners
    medium: 3,    // Balanced (reduced from 4 for better performance)
    hard: 4       // Strong (reduced from 5 for better performance)
  };
  return depths[difficulty] || 3;
}

// Get AI move using minimax with alpha-beta pruning
export function getAIMove(gameState) {
  const { board, difficulty, size } = gameState;
  const player = 'blue'; // AI is always blue
  const depth = getDepth(difficulty);

  const moves = getAvailableMoves(board);
  if (moves.length === 0) return null;

  // Check for immediate win
  for (const move of moves) {
    const testBoard = board.map(row => [...row]);
    testBoard[move.row][move.col] = player;
    if (checkWin(testBoard, player)) {
      return move;
    }
  }

  // Check for immediate loss (block opponent)
  const opponent = 'red';
  for (const move of moves) {
    const testBoard = board.map(row => [...row]);
    testBoard[move.row][move.col] = opponent;
    if (checkWin(testBoard, opponent)) {
      return move; // Block the win
    }
  }

  // Limit moves to evaluate for performance (especially on larger boards)
  const maxMovesToEvaluate = size <= 5 ? moves.length : Math.min(15, moves.length);
  const movesToEvaluate = moves.slice(0, maxMovesToEvaluate);

  // Use minimax with alpha-beta
  let bestMove = null;
  let bestValue = -Infinity;

  for (const move of movesToEvaluate) {
    const newBoard = board.map(row => [...row]);
    newBoard[move.row][move.col] = player;
    const value = alphaBeta(newBoard, depth - 1, -Infinity, Infinity, false, player, size);

    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }

  return bestMove || moves[0]; // Fallback to first move
}

