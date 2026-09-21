import app from './app.js';
import config from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(config.port, () => {
      const divider = '='.repeat(60);
      console.log(`\n${divider}`);
      console.log('  🛒 Kirana & General Store - Backend Server');
      console.log(divider);
      console.log(`  🚀 Status     : Running`);
      console.log(`  📍 Port       : ${config.port}`);
      console.log(`  🔗 URL        : http://localhost:${config.port}`);
      console.log(`  🌱 Environment: ${config.nodeEnv}`);
      console.log(`  🏥 Health     : http://localhost:${config.port}/api/v1/health`);
      console.log(divider);
      console.log('');
    });

    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof config.port === 'string' ? 'Pipe ' + config.port : 'Port ' + config.port;

      switch (error.code) {
        case 'EACCES':
          console.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error) {
    console.error('[Server Startup] Failed to start:', error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`\n[Shutdown] Received ${signal}. Graceful shutdown initiated...`);

  if (server) {
    server.close(async () => {
      console.log('[Shutdown] HTTP server closed');
      await disconnectDB();
      console.log('[Shutdown] Process terminated');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('[Shutdown] Force shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

const handleFatal = async (type, err) => {
  console.error(`\n[Fatal] ${type}:`, err?.message || err);
  if (err?.stack) {
    console.error(err.stack);
  }
  console.error('Graceful shutdown initiated due to fatal error...');

  if (server) {
    server.close(async () => {
      console.log('[Shutdown] HTTP server closed');
      await disconnectDB();
      console.log('[Shutdown] Database disconnected, exiting with code 1');
      process.exit(1);
    });

    setTimeout(() => {
      console.error('[Shutdown] Force exit after timeout');
      process.exit(1);
    }, 5000);
  } else {
    await disconnectDB();
    process.exit(1);
  }
};

process.on('uncaughtException', (err) => handleFatal('Uncaught Exception', err));
process.on('unhandledRejection', (err) => handleFatal('Unhandled Rejection', err));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
