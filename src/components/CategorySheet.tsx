"use client";

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Category {
  id: string;
  name: string;
}

interface CategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryId: string | null) => void;
}

const CategorySheet: React.FC<CategorySheetProps> = ({ isOpen, onClose, onSelectCategory }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          showError("Помилка завантаження категорій: " + error.message);
        } else {
          setCategories(data as Category[]);
        }
        setLoading(false);
      };
      fetchCategories();
    }
  }, [isOpen]);

  const handleCategoryClick = (categoryId: string | null) => {
    onSelectCategory(categoryId);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Каталог товарів</SheetTitle>
          <SheetDescription>
            Виберіть категорію, щоб переглянути товари.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-80px)] py-4">
          {loading ? (
            <p className="text-center text-gray-600 dark:text-gray-400">Завантаження категорій...</p>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="justify-start text-lg"
                onClick={() => handleCategoryClick(null)}
              >
                Всі товари
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  className="justify-start text-lg"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default CategorySheet;