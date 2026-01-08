import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createProduct, getProduct, updateProduct } from "../firebase/firestore";
import type { ProductInput } from "../types/types";

type ProductFormState = {
  title: string;
  price: string;
  description: string;
  category: string;
  image: string;
};

const emptyForm: ProductFormState = {
  title: "",
  price: "",
  description: "",
  category: "",
  image: "",
};

const ProductForm = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEditing = Boolean(productId);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing || !productId) {
      setForm(emptyForm);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getProduct(productId)
      .then((product) => {
        if (!isMounted) return;
        if (!product) {
          setError("Product not found.");
          return;
        }
        setForm({
          title: product.title,
          price: product.price.toString(),
          description: product.description,
          category: product.category,
          image: product.image,
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        setError((err as Error)?.message || "Unable to load product.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isEditing, productId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const priceValue = Number(form.price);
    if (!form.title.trim() || !form.category.trim() || !form.description.trim()) {
      setError("Title, category, and description are required.");
      return;
    }
    if (!form.image.trim()) {
      setError("Image URL is required.");
      return;
    }
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      setError("Price must be a positive number.");
      return;
    }

    const payload: ProductInput = {
      title: form.title.trim(),
      price: priceValue,
      description: form.description.trim(),
      category: form.category.trim(),
      image: form.image.trim(),
    };

    setIsSaving(true);
    try {
      if (isEditing && productId) {
        await updateProduct(productId, payload);
      } else {
        await createProduct(payload);
      }
      navigate("/products");
    } catch (err) {
      setError((err as Error)?.message || "Unable to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" aria-label="Loading" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning mb-3" role="alert">
          Please sign in to manage products.
        </div>
        <Link className="btn btn-primary" to="/login">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="mb-1">{isEditing ? "Edit Product" : "Create Product"}</h1>
          <p className="text-muted mb-0">
            {isEditing
              ? "Update the product details below."
              : "Add a new product to the catalog."}
          </p>
        </div>
        <Link className="btn btn-outline-secondary" to="/products">
          Back to products
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body d-flex flex-column gap-3">
          {error && <div className="alert alert-danger py-2 mb-0">{error}</div>}
          {isLoading ? (
            <div className="d-flex justify-content-center py-3">
              <div className="spinner-border text-primary" role="status" aria-label="Loading" />
            </div>
          ) : (
            <form className="d-flex flex-column gap-2" onSubmit={handleSubmit}>
              <div>
                <label className="form-label fw-semibold mb-1" htmlFor="product-title">
                  Title
                </label>
                <input
                  id="product-title"
                  className="form-control"
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Classic Canvas Sneakers"
                />
              </div>

              <div>
                <label className="form-label fw-semibold mb-1" htmlFor="product-price">
                  Price
                </label>
                <input
                  id="product-price"
                  className="form-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, price: event.target.value }))
                  }
                  placeholder="79.99"
                />
              </div>

              <div>
                <label className="form-label fw-semibold mb-1" htmlFor="product-category">
                  Category
                </label>
                <input
                  id="product-category"
                  className="form-control"
                  value={form.category}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, category: event.target.value }))
                  }
                  placeholder="footwear"
                />
              </div>

              <div>
                <label className="form-label fw-semibold mb-1" htmlFor="product-image">
                  Image URL
                </label>
                <input
                  id="product-image"
                  className="form-control"
                  value={form.image}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, image: event.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="form-label fw-semibold mb-1" htmlFor="product-description">
                  Description
                </label>
                <textarea
                  id="product-description"
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Describe the product..."
                />
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : isEditing ? "Save changes" : "Create product"}
                </button>
                <Link className="btn btn-outline-secondary" to="/products">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
