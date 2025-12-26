import express from 'express';
import { getGameState, createNewGame, handlePlayerMove } from '../controllers/gameController.js';

const router = express.Router();

// Get or create game state
router.get('/state', (req, res) => {
  const gameState = getGameState(req.sessionID);
  res.json(gameState);
});

// Reset/Create new game
router.post('/reset', (req, res) => {
  try {
    const { size, difficulty, mode } = req.body;
    const gameSize = Math.max(5, Math.min(9, parseInt(size) || 5));
    const gameDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';
    const gameMode = ['human-vs-ai', 'human-vs-human'].includes(mode) ? mode : 'human-vs-ai';
    
    const gameState = createNewGame(
      req.sessionID,
      gameSize,
      gameDifficulty,
      gameMode
    );
    res.json(gameState);
  } catch (error) {
    console.error('Error in reset endpoint:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Make a move
router.post('/move', (req, res) => {
  try {
    const { row, col } = req.body;
    
    if (typeof row !== 'number' || typeof col !== 'number') {
      return res.status(400).json({ error: 'Invalid move coordinates' });
    }
    
    const result = handlePlayerMove(req.sessionID, row, col);

    if (result.error) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error in move endpoint:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;
