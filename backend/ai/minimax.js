import { getAvailableMoves, checkWin } from './hexUtils.js';
import { evaluateBoard } from './heuristic.js';
import { alphaBeta } from './alphaBeta.js';

// Get difficulty depth - improved for stronger AI
function getDepth(difficulty) {
  const depths = {
    easy: 3,      // Improved from 2
    medium: 5,    // Improved from 3 - much stronger
    hard: 7       // Improved from 4 - very strong
  };
  return depths[difficulty] || 5;
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

  // Use iterative deepening for better move selection
  // Evaluate all moves on small boards, limit on larger ones
  const maxMovesToEvaluate = size <= 5 ? moves.length : Math.min(20, moves.length);
  
  // Pre-sort moves by heuristic for better pruning
  const scoredMoves = moves.slice(0, maxMovesToEvaluate).map(move => {
    const testBoard = board.map(row => [...row]);
    testBoard[move.row][move.col] = player;
    const score = evaluateBoard(testBoard, player, size);
    return { ...move, score };
  });
  
  scoredMoves.sort((a, b) => b.score - a.score);
  const movesToEvaluate = scoredMoves.map(m => ({ row: m.row, col: m.col }));

  // Use minimax with alpha-beta - iterative deepening approach
  let bestMove = null;
  let bestValue = -Infinity;
  let currentDepth = Math.min(depth, 3); // Start with smaller depth
  
  // Iterative deepening: gradually increase depth
  while (currentDepth <= depth && bestValue < 5000) {
    bestValue = -Infinity;
    for (const move of movesToEvaluate) {
      const newBoard = board.map(row => [...row]);
      newBoard[move.row][move.col] = player;
      const value = alphaBeta(newBoard, currentDepth - 1, -Infinity, Infinity, false, player, size);

      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
      
      // If we found a winning move, use it immediately
      if (value > 9000) break;
    }
    
    // If we found a very good move or reached max depth, stop
    if (bestValue > 9000 || currentDepth >= depth) break;
    currentDepth += 1;
  }

  return bestMove || movesToEvaluate[0] || moves[0];
}

