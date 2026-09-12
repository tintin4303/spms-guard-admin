import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

import authRouter from './auth/auth.routes';
import guardsRouter from './guards/guards.routes';
import contractsRouter from './contracts/contracts.routes';
import mapRouter from './map/map.routes';
import usersRouter from './users/users.routes';
import schedulesRouter from './schedules/schedules.routes';
import logsRouter from './logs/logs.routes';
import reportsRouter from './reports/reports.routes';

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/guards', guardsRouter);
app.use('/api/contracts', contractsRouter);
app.use('/api/map', mapRouter);
app.use('/api/users', usersRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/logs', logsRouter);
app.use('/api/reports', reportsRouter);

// WebSocket for real-time operations
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Backend server strictly running on port ${PORT}`);
});
