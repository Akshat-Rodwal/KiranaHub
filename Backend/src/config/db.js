import mongoose from 'mongoose';
import config from './env.js';

const connectDB = async () => {
  const primaryUri = config.mongoUri;
  const localFallbackUri = 'mongodb://localhost:27017/kirana-store';

  try {
    const connectionInstance = await mongoose.connect(primaryUri, {
      dbName: 'kirana-store',
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`\n[MongoDB] Connected successfully`);
    console.log(`[MongoDB] Host: ${connectionInstance.connection.host}`);
    console.log(`[MongoDB] Database: ${connectionInstance.connection.name}`);

    return connectionInstance;
  } catch (primaryError) {
    if (primaryUri !== localFallbackUri) {
      console.warn(
        `\n[MongoDB] Warning: Failed to connect to configured MONGO_URI (${primaryError.message}). Attempting local MongoDB fallback...`
      );
      try {
        const fallbackInstance = await mongoose.connect(localFallbackUri, {
          dbName: 'kirana-store',
          bufferCommands: false,
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 3000,
          socketTimeoutMS: 45000,
        });
        console.log(`[MongoDB] Connected to local MongoDB fallback successfully`);
        console.log(`[MongoDB] Host: ${fallbackInstance.connection.host}`);
        console.log(`[MongoDB] Database: ${fallbackInstance.connection.name}`);
        return fallbackInstance;
      } catch (fallbackError) {
        console.error(`[MongoDB] Local fallback failed: ${fallbackError.message}`);
      }
    }
    console.error(`[MongoDB] Connection failed: ${primaryError.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[MongoDB] Disconnected successfully');
  } catch (error) {
    console.error(`[MongoDB] Disconnect failed: ${error.message}`);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection lost');
});

mongoose.connection.on('reconnected', () => {
  console.info('[MongoDB] Reconnected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Connection error: ${err.message}`);
});

export { connectDB, disconnectDB };
