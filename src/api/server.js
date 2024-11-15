// server.js
import jsonServer from '../../node_modules/json-server';
import express from 'express';
import path from 'path';

const app = express();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

app.use(middlewares);

app.get('/maintenance', (req, res) => {
  res.json({ maintenance: true });
});

app.use('/api', router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});