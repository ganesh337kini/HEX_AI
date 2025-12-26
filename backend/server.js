import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import gameRoutes from './routes/gameRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'hex-ai-secret-key-2024',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  })
);

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Serve static files with proper options
const staticOptions = {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['html', 'css', 'js', 'json', 'png', 'jpg', 'gif', 'svg'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: (res, path) => {
    res.set('x-timestamp', Date.now().toString());
  }
};

app.use(express.static(path.join(__dirname, '../frontend/public'), staticOptions));

// Routes
app.use('/api/game', gameRoutes);

// Main game page - must be after API routes
app.get('/', (req, res) => {
  try {
    res.render('index', {
      title: 'HEX Game AI',
      defaultSize: 5,
      defaultDifficulty: 'medium',
    });
  } catch (error) {
    console.error('Error rendering index:', error);
    res.status(500).send('Error loading page');
  }
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server with port auto-increment
function listenOnPort(port) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📁 Static files: ${path.join(__dirname, '../frontend/public')}`);
    console.log(`📄 Views: ${path.join(__dirname, '../frontend/views')}`);
  });
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying ${port + 1}`);
      listenOnPort(port + 1);
    } else {
      console.error('Server error:', err);
      throw err;
    }
  });
}

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

listenOnPort(Number(PORT));

export default app;
