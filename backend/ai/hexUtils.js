// Hex game utility functions

export function createBoard(size) {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

export function resetGame(size = 5, difficulty = 'medium', mode = 'human-vs-ai') {
  return {
    board: createBoard(size),
    currentPlayer: 'red',
    winner: null,
    size: size,
    difficulty: difficulty,
    mode: mode,
    moveCount: 0
  };
}

export function makeMove(gameState, row, col, player) {
  if (gameState.board[row] && gameState.board[row][col] === null) {
    gameState.board[row][col] = player;
    gameState.moveCount++;
    return true;
  }
  return false;
}

// Get hex neighbors (6 directions)
export function getNeighbors(row, col, size) {
  const neighbors = [];
  const directions = [
    [-1, 0], [1, 0],           // up, down
    [0, -1], [0, 1],            // left, right
    [-1, 1], [1, -1]            // hex-specific diagonals
  ];

  for (const [dr, dc] of directions) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
      neighbors.push([nr, nc]);
    }
  }
  return neighbors;
}

// Check if player has a winning path using BFS
export function checkWin(board, player) {
  const size = board.length;
  const visited = Array(size).fill(null).map(() => Array(size).fill(false));
  const queue = [];

  // Initialize queue with starting positions
  if (player === 'red') {
    // Red connects top to bottom
    for (let col = 0; col < size; col++) {
      if (board[0][col] === 'red') {
        queue.push([0, col]);
        visited[0][col] = true;
      }
    }
  } else {
    // Blue connects left to right
    for (let row = 0; row < size; row++) {
      if (board[row][0] === 'blue') {
        queue.push([row, 0]);
        visited[row][0] = true;
      }
    }
  }

  // BFS to find a path
  while (queue.length > 0) {
    const [r, c] = queue.shift();

    // Check if reached the other side
    if ((player === 'red' && r === size - 1) ||
        (player === 'blue' && c === size - 1)) {
      return true;
    }

    // Check all 6 hex neighbors
    const neighbors = getNeighbors(r, c, size);
    for (const [nr, nc] of neighbors) {
      if (!visited[nr][nc] && board[nr][nc] === player) {
        visited[nr][nc] = true;
        queue.push([nr, nc]);
      }
    }
  }

  return false;
}

// Get all available moves
export function getAvailableMoves(board) {
  const moves = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === null) {
        moves.push({ row, col });
      }
    }
  }
  return moves;
}

