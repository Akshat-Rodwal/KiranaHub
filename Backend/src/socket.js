import { Server } from 'socket.io';
import config from './config/env.js';
import Order from './models/Order.js';

let io = null;

export const initSocket = (httpServer) => {
  const allowedOrigins = [
    'https://kirana-hub-chi.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    ...(config.corsOrigin ? config.corsOrigin.split(',').map((o) => o.trim().replace(/\/$/, '')) : []),
    config.clientUrl ? config.clientUrl.trim().replace(/\/$/, '') : null,
  ].filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin.includes('vercel.app') || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    // Customer order room subscription
    socket.on('join_order', (orderId) => {
      if (orderId) {
        const room = `order_${orderId}`;
        socket.join(room);
      }
    });

    socket.on('leave_order', (orderId) => {
      if (orderId) {
        socket.leave(`order_${orderId}`);
      }
    });

    // Admin dashboard room subscription
    socket.on('join_admin', () => {
      socket.join('admin_channel');
    });

    socket.on('leave_admin', () => {
      socket.leave('admin_channel');
    });

    // Dedicated Delivery Partner App real-time telemetry
    socket.on('delivery_partner_location', async ({ orderId, coords }) => {
      if (orderId && coords) {
        // Relay immediately to customer tracking room
        io.to(`order_${orderId}`).emit('rider_moved', {
          orderId,
          coords,
          emittedAt: new Date().toISOString(),
        });

        // Persist coordinates to MongoDB
        try {
          await Order.findByIdAndUpdate(orderId, {
            'deliveryBoy.currentCoords': {
              lat: Number(coords.lat),
              lng: Number(coords.lng),
            },
          });
        } catch (err) {
          console.error('[Socket] Failed to persist delivery coordinates:', err.message);
        }
      }
    });

    // Delivery partner fulfillment step update
    socket.on('order_status_step', async ({ orderId, status }) => {
      if (orderId && status) {
        try {
          const updatePayload = { orderStatus: status };
          if (status === 'DELIVERED') {
            updatePayload.paymentStatus = 'PAID';
          }

          const updatedOrder = await Order.findByIdAndUpdate(orderId, updatePayload, { new: true });

          // Broadcast to customer room
          io.to(`order_${orderId}`).emit('order_status_updated', {
            orderId,
            status,
            order: updatedOrder,
            emittedAt: new Date().toISOString(),
          });

          // Broadcast to admin channel
          io.to('admin_channel').emit('order_status_updated', {
            orderId,
            status,
            order: updatedOrder,
          });
        } catch (err) {
          console.error('[Socket] Failed to update order status step:', err.message);
        }
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

export const emitOrderStatusUpdate = (orderId, data) => {
  if (io && orderId) {
    io.to(`order_${orderId}`).emit('order_status_updated', {
      orderId,
      ...data,
      emittedAt: new Date().toISOString(),
    });
  }
};

export const emitRiderMoved = (orderId, coords) => {
  if (io && orderId && coords) {
    io.to(`order_${orderId}`).emit('rider_moved', {
      orderId,
      coords,
      emittedAt: new Date().toISOString(),
    });
  }
};

export const emitNewOrderAlert = (order) => {
  if (io && order) {
    io.to('admin_channel').emit('new_order_alert', {
      order,
      emittedAt: new Date().toISOString(),
    });
  }
};

export default {
  initSocket,
  getIO,
  emitOrderStatusUpdate,
  emitRiderMoved,
  emitNewOrderAlert,
};
