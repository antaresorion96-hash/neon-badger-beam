import React, { Suspense } from "react"; // Імпортуємо Suspense
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import FloatingCartButton from "./components/FloatingCartButton";

const queryClient = new QueryClient();

// Ледаче завантаження компонентів сторінок
const LightingStore = React.lazy(() => import("./pages/LightingStore"));
const Cart = React.lazy(() => import("./pages/Cart"));
const OrderConfirmation = React.lazy(() => import("./pages/OrderConfirmation"));
const OrderTracking = React.lazy(() => import("./pages/OrderTracking"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <CartProvider>
          <OrderProvider>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen text-xl text-gray-700 dark:text-gray-300">
                Завантаження...
              </div>
            }>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/lighting-store" element={<LightingStore />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/order-tracking/:orderNumber" element={<OrderTracking />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <FloatingCartButton />
          </OrderProvider>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;