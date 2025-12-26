import { getAvailableMoves, makeMove, checkWin } from './hexUtils.js';
import { evaluateBoard } from './heuristic.js';

// Move ordering - sort moves by heuristic value
function orderMoves(board, moves, player, size) {
  const scoredMoves = moves.map(move => {
    const testBoard = board.map(row => [...row]);
    testBoard[move.row][move.col] = player;
    const score = evaluateBoard(testBoard, player, size);
    return { ...move, score };
  });

  return scoredMoves.sort((a, b) => b.score - a.score);
}

// Alpha-beta pruning minimax
export function alphaBeta(board, depth, alpha, beta, maximizingPlayer, player, size) {
  const opponent = player === 'red' ? 'blue' : 'red';
  const currentPlayer = maximizingPlayer ? player : opponent;

  // Terminal conditions
  if (checkWin(board, player)) return 10000 - depth;
  if (checkWin(board, opponent)) return -10000 + depth;
  if (depth === 0) {
    return evaluateBoard(board, player, size);
  }

  const moves = getAvailableMoves(board);
  if (moves.length === 0) {
    return evaluateBoard(board, player, size);
  }

  // Limit move ordering for performance on large boards
  const movesToOrder = moves.length > 20 ? moves.slice(0, 20) : moves;
  const orderedMoves = orderMoves(board, movesToOrder, currentPlayer, size);
  
  // If we limited moves, append the rest
  if (moves.length > 20) {
    orderedMoves.push(...moves.slice(20));
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of orderedMoves) {
      const newBoard = board.map(row => [...row]);
      newBoard[move.row][move.col] = player;
      const evaluation = alphaBeta(newBoard, depth - 1, alpha, beta, false, player, size);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Prune
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of orderedMoves) {
      const newBoard = board.map(row => [...row]);
      newBoard[move.row][move.col] = opponent;
      const evaluation = alphaBeta(newBoard, depth - 1, alpha, beta, true, player, size);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Prune
    }
    return minEval;
  }
}

