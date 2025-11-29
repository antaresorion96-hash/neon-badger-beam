"use client";

import React from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";

const OrderConfirmation = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4 text-green-600 dark:text-green-400">
          Замовлення успішно оформлено!
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Дякуємо за ваше замовлення.
        </p>
        {orderNumber && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-md text-gray-600 dark:text-gray-400">Ваш номер замовлення:</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 break-all">
              {orderNumber.substring(0, 8)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Збережіть цей номер, щоб відстежити ваше замовлення.
            </p>
          </div>
        )}
        <div className="flex flex-col space-y-4">
          <Link to="/lighting-store">
            <Button className="w-full">Продовжити покупки</Button>
          </Link>
          {orderNumber && (
            <Link to={`/order-tracking/${orderNumber}`}>
              <Button variant="outline" className="w-full">Відстежити моє замовлення</Button>
            </Link>
          )}
          <Link to="/order-tracking">
            <Button variant="ghost" className="w-full">Відстежити інше замовлення</Button>
          </Link>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default OrderConfirmation;