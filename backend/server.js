const express = require('express');
const cors = require('cors');
const articlesRouter = require('./routes/articles');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/articles', articlesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '半生雨/Oblivion Blog API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
