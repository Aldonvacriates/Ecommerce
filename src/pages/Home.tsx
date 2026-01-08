import { useEffect, useMemo, useState } from "react";
import ProductCard from "../commponents/ProductCard";
import ProductManager from "../commponents/ProductManager";
import ShoppingCart from "../commponents/ShoppingCart";
import { useAuth } from "../context/AuthContext";
import { createProduct, deleteProduct, subscribeToProducts, updateProduct } from "../firebase/firestore";
import type { Product, ProductInput } from "../types/types";

const Home = () => {
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

  const handleCreateProduct = async (input: ProductInput) => {
    await createProduct(input);
  };

  const handleUpdateProduct = async (id: string, input: ProductInput) => {
    await updateProduct(id, input);
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
  };

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
            disabled={isLoading}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
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
                <div className="col-md-6" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-lg-4 d-flex flex-column gap-4">
          <ShoppingCart />
          <ProductManager
            products={products}
            onCreate={handleCreateProduct}
            onUpdate={handleUpdateProduct}
            onDelete={handleDeleteProduct}
            canManage={Boolean(user)}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
