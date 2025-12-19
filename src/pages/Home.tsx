import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../commponents/ProductCard";
import ShoppingCart from "../commponents/ShoppingCart";
import type { Product } from "../types/types";

const fetchProducts = async (category: string): Promise<Product[]> => {
  const endpoint =
    category === "all"
      ? "https://fakestoreapi.com/products"
      : `https://fakestoreapi.com/products/category/${encodeURIComponent(category)}`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json();
};

const fetchCategories = async (): Promise<string[]> => {
  const response = await fetch("https://fakestoreapi.com/products/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
};

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorMessage,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const {
    data: products,
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorMessage,
  } = useQuery<Product[]>({
    queryKey: ["products", selectedCategory],
    queryFn: () => fetchProducts(selectedCategory),
  });

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="mb-1">Product Catalog</h1>
          <p className="text-muted mb-0">Browse products and add them to your cart.</p>
        </div>
        <div className="d-flex flex-column">
          <label htmlFor="category-select" className="form-label fw-semibold mb-1">
            Filter by category
          </label>
          <select
            id="category-select"
            className="form-select"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            disabled={categoriesLoading}
          >
            <option value="all">All</option>
            {categories?.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {categoriesError && (
            <p className="text-danger small mt-1">
              {(categoriesErrorMessage as Error)?.message || "Unable to load categories."}
            </p>
          )}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {productsLoading && (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status" aria-label="Loading" />
            </div>
          )}

          {productsError && (
            <div className="alert alert-danger" role="alert">
              {(productsErrorMessage as Error)?.message || "Unable to load products."}
            </div>
          )}

          {!productsLoading && !productsError && (
            <div className="row g-4">
              {products?.map((product) => (
                <div className="col-md-6" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <ShoppingCart />
        </div>
      </div>
    </div>
  );
};

export default Home;
