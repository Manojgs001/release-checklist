require('dotenv').config();
const express = require('express');
const cors = require('cors');
const releasesRouter = require('./routes/releases');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/releases', releasesRouter);

// 404 fallback
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
}

module.exports = app;
