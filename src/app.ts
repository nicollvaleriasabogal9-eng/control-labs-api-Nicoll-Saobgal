import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import usersRouter from './routes/users.routes';
import environmentsRouter from './routes/ambientes.routes';
import equipmentRouter from './routes/equipamientos.routes';
import { requestLogger } from './middlewares/logger.middleware';
import { globalErrorHandler } from './middlewares/errorHandler.middleware';

const app = express();

app.use(cors());
app.use(requestLogger);
app.use(express.json());

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ControlLabs API operando correctamente',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1', apiRoutes);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/environments', environmentsRouter);
app.use('/api/v1/equipment', equipmentRouter);

if (process.env.NODE_ENV !== 'production') {
  app.get('/__test/error', () => {
    throw new Error('Error de prueba.');
  });
}

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada.' });
});

app.use(globalErrorHandler);

export default app;
