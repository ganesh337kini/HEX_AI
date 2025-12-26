# 🎮 HEX Game AI

A beautiful implementation of the classic Hex board game with an intelligent AI opponent.

## 🎯 Game Rules

**Hex** is a two-player board game played on a hexagonal grid:

- **Player 1 (Red)**: Connects **Top to Bottom**
- **Player 2 (Blue)**: Connects **Left to Right**
- Players take turns placing one piece on an empty hex cell
- Once placed, a piece cannot be moved or removed
- A player wins by forming a continuous connected path between their sides
- Pieces connect only through adjacent hex cells
- The game cannot end in a draw

## ✨ Features

- **Multiple Board Sizes**: 5×5, 7×7, 9×9
- **Game Modes**: Human vs AI, Human vs Human
- **AI Difficulty Levels**: Easy, Medium, Hard
- **Explainable AI**: Understand why the AI made each move
- **Modern UI**: Beautiful dark theme with smooth animations
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
cd backend
npm install
```

### Run

```bash
npm run dev
```

Then open `http://localhost:5000` (or the port shown in console) in your browser.

## 📁 Project Structure

```
HEX_Ai/
├── backend/
│   ├── ai/              # AI algorithms (minimax, heuristics)
│   ├── controllers/     # Game state management
│   ├── routes/          # API endpoints
│   └── server.js        # Express server
├── frontend/
│   ├── public/          # Static files (CSS, JS)
│   └── views/           # EJS templates
└── README.md
```

## 🎮 How to Play

1. Select board size and difficulty
2. Choose game mode (Human vs AI or Human vs Human)
3. Click "New Game"
4. Click on hex cells to place your pieces
5. Connect your sides to win!

## 🛠️ Technology

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, CSS3
- **AI**: Minimax with Alpha-Beta Pruning

## 📝 License

MIT License
