"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";
import { showError } from "@/utils/toast";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client"; // Імпортуємо supabase клієнт

// Схема валідації для форми замовлення
const formSchema = z.object({
  customerName: z.string().min(2, { message: "Ім'я має бути не менше 2 символів." }),
  customerPhone: z.string().regex(/^\+?\d{10,15}$/, { message: "Будь ласка, введіть дійсний номер телефону." }),
  customerCity: z.string().min(2, { message: "Місто має бути не менше 2 символів." }),
});

const Cart = () => {
  const { cartItems, totalAmount, updateItemQuantity, removeFromCart, clearCart } = useCart();
  const { placeOrder } = useOrder();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerCity: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (cartItems.length === 0) {
      showError("Ваш кошик порожній. Додайте товари, щоб оформити замовлення.");
      return;
    }

    const customerInfo = {
      name: values.customerName,
      phone: values.customerPhone,
      city: values.customerCity,
    };

    const orderNumber = placeOrder(cartItems, totalAmount, customerInfo);
    
    // Відправка даних замовлення в Telegram через Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('send-order-to-telegram', {
        body: {
          orderNumber,
          items: cartItems,
          totalAmount,
          customerInfo,
        },
      });

      if (error) {
        console.error("Помилка відправки замовлення в Telegram:", error);
        showError("Помилка відправки замовлення менеджеру.");
      } else {
        console.log("Замовлення успішно відправлено в Telegram:", data);
      }
    } catch (error) {
      console.error("Непередбачена помилка при виклику Edge Function:", error);
      showError("Непередбачена помилка при відправці замовлення.");
    }

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <img
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md mr-4"
                      loading="lazy" // Додано lazy loading
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
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                  Ваші контактні дані
                </h2>
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ваше ім'я</FormLabel>
                      <FormControl>
                        <Input placeholder="Іван Петров" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Номер телефону</FormLabel>
                      <FormControl>
                        <Input placeholder="+380XXXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Місто</FormLabel>
                      <FormControl>
                        <Input placeholder="Київ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full mt-4 py-3 text-lg">
                Оформити замовлення
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default Cart;