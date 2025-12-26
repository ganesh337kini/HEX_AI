import { getNeighbors, checkWin } from './hexUtils.js';

// Generate human-readable explanation for AI move
export function explainMove(boardBefore, boardAfter, move, difficulty) {
  const { row, col } = move;
  const neighbors = getNeighbors(row, col, boardAfter.length);
  
  // Check what changed
  const reasons = [];

  // Check for blocking opponent
  let blocksOpponent = false;
  for (const [nr, nc] of neighbors) {
    if (boardBefore[nr] && boardBefore[nr][nc] === 'red') {
      blocksOpponent = true;
      break;
    }
  }

  if (blocksOpponent) {
    reasons.push('blocking your path');
  }

  // Check for strengthening own path
  let strengthensPath = false;
  let ownNeighbors = 0;
  for (const [nr, nc] of neighbors) {
    if (boardAfter[nr] && boardAfter[nr][nc] === 'blue') {
      ownNeighbors++;
      strengthensPath = true;
    }
  }

  if (strengthensPath && ownNeighbors >= 2) {
    reasons.push('strengthening my connection');
  }

  // Check for central control
  const center = (boardAfter.length - 1) / 2;
  const distFromCenter = Math.abs(row - center) + Math.abs(col - center);
  if (distFromCenter < boardAfter.length * 0.3) {
    reasons.push('controlling the center');
  }

  // Check for potential win
  if (checkWin(boardAfter, 'blue')) {
    return {
      move: { row, col },
      explanation: `I placed at (${row + 1}, ${col + 1}) to win the game!`,
      difficulty: difficulty
    };
  }

  // Generate explanation
  if (reasons.length === 0) {
    reasons.push('making a strategic move');
  }

  const explanation = `I placed at (${row + 1}, ${col + 1}) ${reasons.join(' and ')}.`;
  
  return {
    move: { row, col },
    explanation: explanation,
    difficulty: difficulty
  };
}

