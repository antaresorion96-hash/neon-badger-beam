"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";
import { showError } from "@/utils/toast";

const Cart = () => {
  const { cartItems, totalAmount, updateItemQuantity, removeFromCart, clearCart } = useCart();
  const { placeOrder } = useOrder();
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      showError("Ваш кошик порожній. Додайте товари, щоб оформити замовлення.");
      return;
    }
    const orderNumber = placeOrder(cartItems, totalAmount);
    clearCart();
    navigate(`/order-confirmation/${orderNumber}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50">
            Ваш кошик
          </h1>
          <Link to="/lighting-store">
            <Button variant="outline">Продовжити покупки</Button>
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <p className="text-center text-lg text-gray-600 dark:text-gray-400">
            Ваш кошик порожній.
          </p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <img
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{item.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.price} грн</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium text-gray-900 dark:text-gray-50">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mt-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Загальна сума:</h2>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{totalAmount.toFixed(2)} грн</p>
            </div>
            <Button className="w-full mt-4 py-3 text-lg" onClick={handlePlaceOrder}>
              Оформити замовлення
            </Button>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Cart;