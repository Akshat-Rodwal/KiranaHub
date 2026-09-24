import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../services/socket.js';
import { toast } from '../components/common/Toast.jsx';

const STATUS_TITLES = {
  PENDING: 'Order Received 📋',
  CONFIRMED: 'Order Confirmed! ⚡',
  PREPARING: 'Items Being Packed at Dark Store 🛍️',
  PICKED_UP: 'Order Picked Up! Delivery partner is on the way 🛍️',
  OUT_FOR_DELIVERY: 'Rider Out for Delivery! 🛵',
  DELIVERED: 'Order Delivered! Enjoy your fresh groceries 🎉',
  CANCELLED: 'Order Cancelled',
};

export function useOrderSocket(orderId, onStatusUpdate, onRiderMoved) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orderId) return;

    const socket = getSocket();

    // Join order-specific room
    socket.emit('join_order', orderId);

    const handleUpdate = (data) => {
      if (data.orderId === orderId || !data.orderId) {
        const nextStatus = data.status || data.orderStatus;
        const statusLabel = STATUS_TITLES[nextStatus] || `Status: ${nextStatus}`;

        toast.info(statusLabel, {
          description: `Your order #${orderId.slice(-6).toUpperCase()} is now ${nextStatus.toLowerCase().replace(/_/g, ' ')}.`,
        });

        // Invalidate active order queries for immediate cache refresh
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['order', orderId] });

        if (typeof onStatusUpdate === 'function') {
          onStatusUpdate(data);
        }
      }
    };

    const handleRiderMoved = (data) => {
      if ((data.orderId === orderId || !data.orderId) && data.coords) {
        if (typeof onRiderMoved === 'function') {
          onRiderMoved(data.coords);
        }
      }
    };

    socket.on('order_status_updated', handleUpdate);
    socket.on('rider_moved', handleRiderMoved);

    return () => {
      socket.emit('leave_order', orderId);
      socket.off('order_status_updated', handleUpdate);
      socket.off('rider_moved', handleRiderMoved);
    };
  }, [orderId, onStatusUpdate, onRiderMoved, queryClient]);
}

export default useOrderSocket;
