"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';

const FloatingCartButton: React.FC = () => {
  const { cartItems } = useCart();
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity === 0) {
    return null; // Не показувати кнопку, якщо кошик порожній
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link to="/cart">
        <Button className="relative rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
          <ShoppingCart className="h-6 w-6" />
          {totalQuantity > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full p-0">
              {totalQuantity}
            </Badge>
          )}
        </Button>
      </Link>
    </div>
  );
};

export default FloatingCartButton;