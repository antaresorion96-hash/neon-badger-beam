"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils"; // Import cn for conditional class names

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string | null; // Add category_id
}

interface Category {
  id: string;
  name: string;
}

const LightingStore = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (categoriesError) {
        showError("Помилка завантаження категорій: " + categoriesError.message);
      } else {
        setCategories(categoriesData as Category[]);
      }

      // Fetch products
      let productsQuery = supabase.from('products').select('*');
      if (selectedCategory) {
        productsQuery = productsQuery.eq('category_id', selectedCategory);
      }
      productsQuery = productsQuery.order('name', { ascending: true });

      const { data: productsData, error: productsError } = await productsQuery;

      if (productsError) {
        showError("Помилка завантаження товарів: " + productsError.message);
      } else {
        setProducts(productsData as Product[]);
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedCategory]); // Re-fetch when selectedCategory changes

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-700 dark:text-gray-300">Завантаження товарів...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-bold mb-4 sm:mb-0 text-gray-900 dark:text-gray-50">
            Магазин освітлення
          </h1>
          <Link to="/cart">
            <Button variant="outline" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="ml-2">Кошик</span>
            </Button>
          </Link>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Відкрийте для себе ідеальне освітлення для вашого дому.
        </p>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className={cn(
              selectedCategory === null ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            Всі товари
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                selectedCategory === category.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="text-center text-xl text-gray-600 dark:text-gray-400">
            Товарів у цій категорії не знайдено.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col justify-between">
                <CardHeader className="p-0">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <CardTitle className="text-xl font-semibold">{product.name}</CardTitle>
                    <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">{product.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{product.price} грн</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full" onClick={() => handleAddToCart(product)}>Додати в кошик</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default LightingStore;