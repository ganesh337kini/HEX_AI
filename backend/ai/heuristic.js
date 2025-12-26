import { getNeighbors, getAvailableMoves, checkWin } from './hexUtils.js';

// Calculate shortest path distance using Dijkstra-like algorithm
function shortestPathDistance(board, player, size) {
  const dist = Array(size).fill(null).map(() => Array(size).fill(Infinity));
  const queue = [];

  // Initialize starting positions
  if (player === 'red') {
    for (let col = 0; col < size; col++) {
      if (board[0][col] === 'red') {
        dist[0][col] = 0;
        queue.push([0, col, 0]);
      } else if (board[0][col] === null) {
        dist[0][col] = 1;
        queue.push([0, col, 1]);
      }
    }
  } else {
    for (let row = 0; row < size; row++) {
      if (board[row][0] === 'blue') {
        dist[row][0] = 0;
        queue.push([row, 0, 0]);
      } else if (board[row][0] === null) {
        dist[row][0] = 1;
        queue.push([row, 0, 1]);
      }
    }
  }

  // Dijkstra
  while (queue.length > 0) {
    queue.sort((a, b) => a[2] - b[2]);
    const [r, c, d] = queue.shift();

    if (d > dist[r][c]) continue;

    const neighbors = getNeighbors(r, c, size);
    for (const [nr, nc] of neighbors) {
      let weight = 1;
      if (board[nr][nc] === player) {
        weight = 0;
      } else if (board[nr][nc] !== null) {
        weight = 1000; // Blocked by opponent
      }

      if (dist[nr][nc] > dist[r][c] + weight) {
        dist[nr][nc] = dist[r][c] + weight;
        queue.push([nr, nc, dist[nr][nc]]);
      }
    }
  }

  // Find minimum distance to goal
  let minDist = Infinity;
  if (player === 'red') {
    for (let col = 0; col < size; col++) {
      minDist = Math.min(minDist, dist[size - 1][col]);
    }
  } else {
    for (let row = 0; row < size; row++) {
      minDist = Math.min(minDist, dist[row][size - 1]);
    }
  }

  return minDist;
}

// Central control bonus
function centralControl(row, col, size) {
  const center = (size - 1) / 2;
  const distFromCenter = Math.abs(row - center) + Math.abs(col - center);
  return (size - distFromCenter) / size;
}

// Blocking score - adjacency to opponent stones
function blockingScore(board, row, col, opponent, size) {
  const neighbors = getNeighbors(row, col, size);
  let blockCount = 0;
  for (const [nr, nc] of neighbors) {
    if (board[nr][nc] === opponent) {
      blockCount++;
    }
  }
  return blockCount * 0.1;
}

// Main heuristic evaluation
export function evaluateBoard(board, player, size) {
  const opponent = player === 'red' ? 'blue' : 'red';

  // Check for immediate win/loss
  const win = checkWin(board, player);
  const loss = checkWin(board, opponent);

  if (win) return 10000;
  if (loss) return -10000;

  // Path distance heuristic
  const myPath = shortestPathDistance(board, player, size);
  const oppPath = shortestPathDistance(board, opponent, size);

  let score = (oppPath - myPath) * 10;

  // Add central control and blocking bonuses
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === player) {
        score += centralControl(row, col, size) * 2;
        score += blockingScore(board, row, col, opponent, size);
      }
    }
  }

  return score;
}

