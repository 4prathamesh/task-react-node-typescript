import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import studentRoutes from './routes/student.routes';
import { globalErrorHandler } from './middleware/error.middleware';

const app = express();

app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Student CRUD API running' });
});

// API routes
app.use('/api', studentRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(globalErrorHandler);

export default app;