import cors from 'cors';
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import loanRouter from './routes/loan.routes';
import { globalErrorHandler } from './middlewares/errorHandler.middleware';
import { requestLogger } from './middlewares/logger.middleware';
import { createDatabaseUrl } from './db/database-url';
import { prisma } from './db/prisma';

const app = express();
const port = Number(process.env.PORT ?? 5000);

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

app.use('/api/loans', loanRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    code: 'ROUTE_NOT_FOUND',
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

app.use(globalErrorHandler);

const describeStartupError = (error: unknown): string => {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return `No se pudo conectar con PostgreSQL: ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error desconocido al iniciar el servidor';
};

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

const startServer = async (): Promise<void> => {
  try {
    createDatabaseUrl();
    await prisma.$connect();
    app.listen(port, () => {
      console.log(`Servidor escuchando en http://localhost:${port}`);
    });
  } catch (error) {
    console.error(`[startup] ${describeStartupError(error)}`);
    await prisma.$disconnect();
    process.exit(1);
  }
};

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

void startServer();
