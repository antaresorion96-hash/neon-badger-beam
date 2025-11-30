import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-50">
          Ласкаво просимо до вашого додатку
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Почніть створювати свій дивовижний проект тут!
        </p>
        <Link to="/lighting-store">
          <Button size="lg" className="px-8 py-4 text-lg">
            Перейти до магазину освітлення
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;