import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../commponents/ProductCard";
import { useAuth } from "../context/AuthContext";
import { subscribeToProducts } from "../firebase/firestore";
import type { Product } from "../types/types";

const Products = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToProducts(
      (items) => {
        setProducts(items);
        setErrorMessage(null);
        setIsLoading(false);
      },
      (error) => {
        setErrorMessage(error.message || "Unable to load products.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((product) => product.category).filter(Boolean))
    );
    return ["all", ...unique];
  }, [products]);

  useEffect(() => {
    if (selectedCategory !== "all" && !categories.includes(selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [categories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="mb-1">Product Catalog</h1>
          <p className="text-muted mb-0">Browse products and add them to your cart.</p>
        </div>
        <div className="d-flex flex-column gap-2">
          <div>
            <label htmlFor="category-select" className="form-label fw-semibold mb-1">
              Filter by category
            </label>
            <select
              id="category-select"
              className="form-select"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              disabled={isLoading}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          {user ? (
            <Link className="btn btn-primary align-self-start" to="/products/new">
              Create product
            </Link>
          ) : (
            <div className="small text-muted">Sign in to create or edit products.</div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" aria-label="Loading" />
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && filteredProducts.length === 0 && (
        <div className="alert alert-info" role="alert">
          No products found for this category yet.
        </div>
      )}

      {!isLoading && !errorMessage && filteredProducts.length > 0 && (
        <div className="row g-4">
          {filteredProducts.map((product) => (
            <div className="col-md-6 col-xl-4" key={product.id}>
              <ProductCard
                product={product}
                editHref={user ? `/products/${product.id}/edit` : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
