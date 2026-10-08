import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';

const app = express();

app.set('query parser', 'extended');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

export default app;
