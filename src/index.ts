import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { BASE_URL, ONE_MINUTE_MS, PORT } from './config.js';
import { darkreadHandler } from './routes/darkread.js';
import { healthHandler } from './routes/health.js';
import { homeHandler } from './routes/home.js';

const app = express();

app.use(cors());
app.use(rateLimit({ windowMs: ONE_MINUTE_MS, limit: 30 }));

app.get('/', homeHandler);
app.get('/darkread', darkreadHandler);
app.get('/health', healthHandler);

export default app;

app.listen(PORT, () => {
  console.log(`Darkread proxy rodando em ${BASE_URL}`);
  console.log(`Uso: GET ${BASE_URL}/darkread?url=https://exemplo.com/artigo`);
});
