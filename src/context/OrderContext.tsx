"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { showSuccess, showError } from '@/utils/toast';

interface OrderItem {
  id: string; // Product ID
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  city: string;
}

interface Order {
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  timestamp: string;
  customerInfo: CustomerInfo; // Додаємо інформацію про клієнта
}

interface OrderContextType {
  placeOrder: (items: OrderItem[], total: number, customerInfo: CustomerInfo) => string;
  getOrder: (orderNumber: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const placeOrder = useCallback((items: OrderItem[], total: number, customerInfo: CustomerInfo): string => {
    const orderNumber = uuidv4();
    const newOrder: Order = {
      orderNumber,
      items,
      totalAmount: total,
      timestamp: new Date().toISOString(),
      customerInfo, // Зберігаємо інформацію про клієнта
    };
    setOrders((prevOrders) => [...prevOrders, newOrder]);
    showSuccess(`Замовлення №${orderNumber.substring(0, 8)} успішно оформлено!`);
    return orderNumber;
  }, []);

  const getOrder = useCallback((orderNumber: string): Order | undefined => {
    return orders.find((order) => order.orderNumber === orderNumber);
  }, [orders]);

  return (
    <OrderContext.Provider value={{ placeOrder, getOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};