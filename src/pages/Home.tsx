import { useEffect, useState } from "react";
import type { Product } from "../types/types";
import ProductCard from "../commponents/ProductCard";

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("https://fakestoreapi.com/products");
      const data: Product[] = await response.json();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {products.map((product: Product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default Home;
