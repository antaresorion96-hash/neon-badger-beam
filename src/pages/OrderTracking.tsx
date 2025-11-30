"use client";

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrder } from "@/context/OrderContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { showError } from "@/utils/toast";

const OrderTracking = () => {
  const { orderNumber: urlOrderNumber } = useParams<{ orderNumber: string }>();
  const { getOrder } = useOrder();
  const [inputOrderNumber, setInputOrderNumber] = useState<string>(urlOrderNumber || '');
  const [foundOrder, setFoundOrder] = useState<any | undefined>(undefined);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handleSearch = () => {
    setSearchAttempted(true);
    if (inputOrderNumber) {
      const order = getOrder(inputOrderNumber);
      setFoundOrder(order);
      if (!order) {
        showError("Замовлення з таким номером не знайдено.");
      }
    } else {
      setFoundOrder(undefined);
      showError("Будь ласка, введіть номер замовлення.");
    }
  };

  useEffect(() => {
    if (urlOrderNumber) {
      handleSearch();
    }
  }, [urlOrderNumber]); // Re-run search if URL order number changes

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mt-10">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-50">
          Відстеження замовлення
        </h1>
        <div className="flex space-x-2 mb-6">
          <Input
            type="text"
            placeholder="Введіть номер замовлення"
            value={inputOrderNumber}
            onChange={(e) => setInputOrderNumber(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={handleSearch}>Знайти замовлення</Button>
        </div>

        {searchAttempted && !foundOrder && (
          <p className="text-center text-red-500 dark:text-red-400 mb-4">
            Замовлення з номером "{inputOrderNumber.substring(0, 8)}" не знайдено.
          </p>
        )}

        {foundOrder && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Замовлення №{foundOrder.orderNumber.substring(0, 8)}</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Дата замовлення: {format(new Date(foundOrder.timestamp), 'dd.MM.yyyy HH:mm')}
              </p>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-semibold mb-4">Товари:</h3>
              <div className="space-y-3 mb-6">
                {foundOrder.items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0">
                    <div className="flex items-center">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md mr-3"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.quantity} x {item.price} грн</p>
                      </div>
                    </div>
                    <p className="font-semibold">{(item.quantity * item.price).toFixed(2)} грн</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-xl font-bold">Загальна сума:</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{foundOrder.totalAmount.toFixed(2)} грн</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Link to="/lighting-store">
            <Button variant="outline">Повернутися до магазину</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;