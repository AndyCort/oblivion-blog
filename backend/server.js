require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRouter = require('./routes/auth');
const articlesRouter = require('./routes/articles');
const uploadRouter = require('./routes/upload');
const settingsRouter = require('./routes/settings');
const commentsRouter = require('./routes/comments');
const installRouter = require('./routes/install');
const { isInstalled } = require('./routes/install');
const deployRouter = require('./routes/deploy');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['https://inpa.in', 'http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin === o || origin.endsWith('.pages.dev'))) {
      return callback(null, true);
    }
    callback(null, true); // Allow all for now, but with proper headers
  },
  credentials: true,
}));
app.use(express.json());

// ─── Install route (always available, no DB needed) ───────────────────────────
app.use('/api/install', installRouter);

// ─── Guard: block all other /api routes until installed ───────────────────────
app.use('/api', (req, res, next) => {
  if (!isInstalled()) {
    return res.status(503).json({
      error: '博客尚未安装，请先访问安装向导完成初始化配置。',
      redirect: '/install',
    });
  }
  next();
});

// ─── Connect to DB (only if already installed) ────────────────────────────────
if (isInstalled()) {
  connectDB();
}

// ─── Application routes ───────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/auth', authRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/deploy', deployRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    installed: isInstalled(),
    message: '半生雨/Oblivion Blog API is running',
  });
});

app.listen(PORT, () => {
  if (isInstalled()) {
    console.log(`✅ Server running on http://localhost:${PORT} (installed)`);
  } else {
    console.log(`⚠️  Server running on http://localhost:${PORT} — NOT YET INSTALLED`);
    console.log(`   Please visit the install wizard to complete setup.`);
  }
});

// Note: Frontend is served by Cloudflare Pages, not this backend.
