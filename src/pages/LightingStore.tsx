"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductVariation {
  id: string;
  product_id: string;
  variation_name: string;
  price: number;
  image_url: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // This will be the default/highest price for parent products
  image_url: string;
  category_id: string | null;
  variations?: ProductVariation[]; // Optional variations array
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
  const [selectedVariations, setSelectedVariations] = useState<{ [productId: string]: ProductVariation }>({});

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

      // Fetch products and their variations
      let productsQuery = supabase
        .from('products')
        .select('*, product_variations(*)') // Fetch products and their related variations
        .order('name', { ascending: true });

      if (selectedCategory) {
        productsQuery = productsQuery.eq('category_id', selectedCategory);
      }

      const { data: productsData, error: productsError } = await productsQuery;

      if (productsError) {
        showError("Помилка завантаження товарів: " + productsError.message);
      } else {
        const fetchedProducts: Product[] = productsData as Product[];
        setProducts(fetchedProducts);
        console.log("Fetched Products with Variations:", fetchedProducts); // Додано логування

        // Initialize selected variations for products with variations
        const initialSelectedVariations: { [productId: string]: ProductVariation } = {};
        fetchedProducts.forEach(product => {
          if (product.variations && product.variations.length > 0) {
            // Select the FIRST variation as default
            initialSelectedVariations[product.id] = product.variations[0];
          }
        });
        setSelectedVariations(initialSelectedVariations);
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedCategory]);

  const handleVariationChange = useCallback((productId: string, variationId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && product.variations) {
      const selected = product.variations.find(v => v.id === variationId);
      if (selected) {
        setSelectedVariations(prev => ({ ...prev, [productId]: selected }));
      }
    }
  }, [products]);

  const handleAddToCart = (product: Product) => {
    if (product.variations && product.variations.length > 0) {
      const selectedVariation = selectedVariations[product.id];
      if (selectedVariation) {
        addToCart({
          id: selectedVariation.id, // Use variation ID for cart item
          name: `${product.name} (${selectedVariation.variation_name})`,
          price: selectedVariation.price,
          image_url: selectedVariation.image_url || product.image_url,
        });
      } else {
        showError("Будь ласка, виберіть варіант товару.");
      }
    } else {
      // For products without variations, add the product directly
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      });
    }
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
            {products.map((product) => {
              const currentVariation = product.variations && product.variations.length > 0
                ? selectedVariations[product.id] || product.variations[0]
                : undefined;

              const displayPrice = currentVariation ? currentVariation.price : product.price;
              const displayImage = currentVariation?.image_url || product.image_url || "/placeholder.svg";

              return (
                <Card key={product.id} className="flex flex-col justify-between">
                  <CardHeader className="p-0">
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                      <CardTitle className="text-xl font-semibold">{product.name}</CardTitle>
                      <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">{product.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between mb-4"> {/* Flex container for price and dropdown */}
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{displayPrice.toFixed(2)} грн</p>
                      {product.variations && product.variations.length > 0 && (
                        <div className="w-[180px]"> {/* Fixed width for dropdown */}
                          <Select
                            onValueChange={(value) => handleVariationChange(product.id, value)}
                            value={currentVariation?.id}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Виберіть варіант" />
                            </SelectTrigger>
                            <SelectContent>
                              {product.variations.map((variation) => (
                                <SelectItem key={variation.id} value={variation.id}>
                                  {variation.variation_name} - {variation.price} грн
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full" onClick={() => handleAddToCart(product)}>Додати в кошик</Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LightingStore;