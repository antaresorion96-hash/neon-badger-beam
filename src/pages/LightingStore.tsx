"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth";
import { showSuccess, showError } from "@/utils/toast";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

const LightingStore = () => {
  const { user } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        showError("Помилка завантаження товарів: " + error.message);
      } else {
        setProducts(data as Product[]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      showError("Будь ласка, увійдіть, щоб додати товари в кошик.");
      return;
    }

    // Check if user already has a cart
    let { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('chat_id', user.id) // Using user.id as chat_id for simplicity
      .single();

    if (cartError && cartError.code !== 'PGRST116') { // PGRST116 means no rows found
      showError("Помилка отримання кошика: " + cartError.message);
      return;
    }

    let cartId = cart?.id;

    if (!cartId) {
      // Create a new cart if none exists
      const { data: newCart, error: newCartError } = await supabase
        .from('carts')
        .insert({ chat_id: user.id })
        .select('id')
        .single();

      if (newCartError) {
        showError("Помилка створення кошика: " + newCartError.message);
        return;
      }
      cartId = newCart.id;
    }

    // Add item to cart or update quantity
    const { data: existingItem, error: itemError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('product_id', product.id)
      .single();

    if (itemError && itemError.code !== 'PGRST116') {
      showError("Помилка перевірки товару в кошику: " + itemError.message);
      return;
    }

    if (existingItem) {
      // Update quantity
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id);

      if (updateError) {
        showError("Помилка оновлення кількості товару: " + updateError.message);
        return;
      }
    } else {
      // Insert new item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          product_image: product.image_url,
          quantity: 1,
        });

      if (insertError) {
        showError("Помилка додавання товару в кошик: " + insertError.message);
        return;
      }
    }

    showSuccess(`${product.name} додано в кошик!`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Завантаження товарів...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50">
            Магазин освітлення
          </h1>
          <Link to="/cart">
            <Button variant="outline" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="ml-2">Кошик</span>
            </Button>
          </Link>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
          Відкрийте для себе ідеальне освітлення для вашого дому.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col justify-between">
              <CardHeader>
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg mb-4"
                />
                <CardTitle className="text-xl font-semibold">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{product.price} грн</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleAddToCart(product)}>Додати в кошик</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default LightingStore;