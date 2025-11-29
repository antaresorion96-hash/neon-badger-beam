"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";

const products = [
  {
    id: 1,
    name: "Сучасна люстра",
    description: "Елегантна люстра для вашої вітальні.",
    price: "2500 грн",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Настільна лампа",
    description: "Стильна лампа для робочого столу.",
    price: "850 грн",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Підлоговий світильник",
    description: "Високий світильник для затишної атмосфери.",
    price: "1800 грн",
    image: "/placeholder.svg",
  },
  {
    id: 4,
    name: "Вбудовані світильники (комплект)",
    description: "Комплект з 4 світильників для сучасного інтер'єру.",
    price: "1200 грн",
    image: "/placeholder.svg",
  },
];

const LightingStore = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-50">
          Магазин освітлення
        </h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-12">
          Відкрийте для себе ідеальне освітлення для вашого дому.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col justify-between">
              <CardHeader>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg mb-4"
                />
                <CardTitle className="text-xl font-semibold">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{product.price}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Додати в кошик</Button>
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