"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { showSuccess, showError } from "@/utils/toast";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string | null;
  quantity: number;
}

const Cart = () => {
  const { user } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState<string | null>(null);

  const fetchCartItems = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: cartData, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('chat_id', user.id)
      .single();

    if (cartError && cartError.code !== 'PGRST116') {
      showError("Помилка отримання кошика: " + cartError.message);
      setLoading(false);
      return;
    }

    if (cartData) {
      setCartId(cartData.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartData.id);

      if (itemsError) {
        showError("Помилка завантаження товарів кошика: " + itemsError.message);
      } else {
        setCartItems(itemsData as CartItem[]);
      }
    } else {
      setCartItems([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(itemId);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId);

    if (error) {
      showError("Помилка оновлення кількості: " + error.message);
    } else {
      showSuccess("Кількість оновлено!");
      fetchCartItems();
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      showError("Помилка видалення товару: " + error.message);
    } else {
      showSuccess("Товар видалено з кошика.");
      fetchCartItems();
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Завантаження кошика...</div>;
  }

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
                  src={item.product_image || "/placeholder.svg"}
                  alt={item.product_name}
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{item.product_name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.product_price} грн</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium text-gray-900 dark:text-gray-50">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
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
            <Button className="w-full mt-4 py-3 text-lg">
              Оформити замовлення (не реалізовано)
            </Button>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Cart;