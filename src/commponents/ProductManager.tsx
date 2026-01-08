import { useMemo, useState, type FormEvent } from "react";
import type { Product, ProductInput } from "../types/types";

type ProductManagerProps = {
  products: Product[];
  onCreate: (input: ProductInput) => Promise<void>;
  onUpdate: (id: string, input: ProductInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  canManage: boolean;
};

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

const ProductManager = ({ products, onCreate, onUpdate, onDelete, canManage }: ProductManagerProps) => {
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(editingId);
  const hasProducts = products.length > 0;

  const sortedProducts = useMemo(
    () =>
      [...products].sort((a, b) => a.title.localeCompare(b.title)),
    [products]
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      title: product.title,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
      image: product.image,
    });
    setFeedback(null);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this product? This cannot be undone.");
    if (!confirmed) return;
    setIsSaving(true);
    setError(null);
    try {
      await onDelete(id);
      if (editingId === id) {
        resetForm();
      }
      setFeedback("Product deleted.");
    } catch (err) {
      setError((err as Error)?.message || "Unable to delete product.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
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
      if (editingId) {
        await onUpdate(editingId, payload);
        setFeedback("Product updated.");
      } else {
        await onCreate(payload);
        setFeedback("Product created.");
      }
      resetForm();
    } catch (err) {
      setError((err as Error)?.message || "Unable to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!canManage) {
    return (
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Product Management</h5>
          <p className="text-muted mb-0">Sign in to create, edit, or delete products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body d-flex flex-column gap-3">
        <div>
          <h5 className="card-title mb-1">Product Management</h5>
          <p className="text-muted mb-0">
            {isEditing ? "Update the product details below." : "Create a new product."}
          </p>
        </div>

        {feedback && <div className="alert alert-success py-2 mb-0">{feedback}</div>}
        {error && <div className="alert alert-danger py-2 mb-0">{error}</div>}

        <form className="d-flex flex-column gap-2" onSubmit={handleSubmit}>
          <div>
            <label className="form-label fw-semibold mb-1" htmlFor="product-title">
              Title
            </label>
            <input
              id="product-title"
              className="form-control"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
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
              onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
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
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
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
              onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
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
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Describe the product..."
            />
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-primary" type="submit" disabled={isSaving}>
              {isEditing ? "Update Product" : "Create Product"}
            </button>
            {isEditing && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={resetForm}
                disabled={isSaving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div>
          <h6 className="fw-semibold">Existing Products</h6>
          {!hasProducts ? (
            <p className="text-muted mb-0">No products yet.</p>
          ) : (
            <ul className="list-group">
              {sortedProducts.map((product) => (
                <li
                  key={product.id}
                  className="list-group-item d-flex justify-content-between align-items-start gap-2"
                >
                  <div>
                    <div className="fw-semibold">{product.title}</div>
                    <div className="small text-muted">
                      ${product.price.toFixed(2)} - {product.category}
                    </div>
                  </div>
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={() => handleEdit(product)}
                      disabled={isSaving}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      disabled={isSaving}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
