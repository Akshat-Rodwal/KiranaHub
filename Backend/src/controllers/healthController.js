import os from 'os';
import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import httpStatus from '../constants/httpStatus.js';

const getHealthStatus = asyncHandler(async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  const healthData = {
    status: dbState === 1 ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Kirana & General Store API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStates[dbState] || 'unknown',
      name: mongoose.connection.name || 'not_connected',
      host: mongoose.connection.host || 'N/A',
    },
    server: {
      hostname: os.hostname(),
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      },
      cpus: os.cpus().length,
    },
  };

  const statusCode = healthData.status === 'healthy' ? httpStatus.OK : httpStatus.SERVICE_UNAVAILABLE;

  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, 'API health check completed successfully', healthData));
});

export { getHealthStatus };
export default getHealthStatus;
