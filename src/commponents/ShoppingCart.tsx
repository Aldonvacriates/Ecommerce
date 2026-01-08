import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../firebase/firestore";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearCart, removeFromCart, updateQuantity } from "../store/cartSlice";

const FALLBACK_IMAGE = "https://via.placeholder.com/80?text=No+Image";

const ShoppingCart = () => {
  const { items } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const { user, profile } = useAuth();
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totals = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc.totalItems += item.quantity;
          acc.totalPrice += item.quantity * item.price;
          return acc;
        },
        { totalItems: 0, totalPrice: 0 }
      ),
    [items]
  );

  const handleQuantityChange = (id: string, value: string) => {
    const parsedQuantity = Math.max(1, Number(value) || 1);
    dispatch(updateQuantity({ id, quantity: parsedQuantity }));
  };

  const handleCheckout = async () => {
    if (!items.length) return;
    setCheckoutError(null);
    setCheckoutMessage(null);

    if (!user) {
      setCheckoutError("Please sign in to place an order.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrder(user.uid, items, totals.totalPrice, {
        email: user.email ?? undefined,
        name: profile?.name,
        address: profile?.address,
      });
      dispatch(clearCart());
      setCheckoutMessage("Order placed successfully! Your cart has been cleared.");
      setTimeout(() => setCheckoutMessage(null), 3000);
    } catch (error) {
      setCheckoutError((error as Error)?.message || "Checkout failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body d-flex flex-column gap-3">
        <div>
          <h5 className="card-title mb-1">Shopping Cart</h5>
          <p className="text-muted mb-0">
            Total items: <strong>{totals.totalItems}</strong>
          </p>
          <p className="mb-0">
            Total price: <strong>${totals.totalPrice.toFixed(2)}</strong>
          </p>
        </div>

        {checkoutMessage && (
          <div className="alert alert-success py-2 mb-0">{checkoutMessage}</div>
        )}
        {checkoutError && (
          <div className="alert alert-danger py-2 mb-0">{checkoutError}</div>
        )}

        {items.length === 0 ? (
          <p className="text-muted mb-0">Your cart is empty.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="d-flex align-items-center gap-3 border rounded p-2"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  onError={(event) => {
                    if (event.currentTarget.src !== FALLBACK_IMAGE) {
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }
                  }}
                  style={{ width: "60px", height: "60px", objectFit: "contain" }}
                />
                <div className="flex-grow-1">
                  <p className="mb-1 fw-semibold small">{item.title}</p>
                  <p className="mb-1 small text-muted">${item.price.toFixed(2)}</p>
                  <div className="d-flex align-items-center gap-2">
                    <label className="form-label mb-0 small" htmlFor={`quantity-${item.id}`}>
                      Qty:
                    </label>
                    <input
                      id={`quantity-${item.id}`}
                      type="number"
                      min={1}
                      className="form-control form-control-sm"
                      style={{ width: "80px" }}
                      value={item.quantity}
                      onChange={(event) =>
                        handleQuantityChange(item.id, event.target.value)
                      }
                    />
                  </div>
                </div>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => dispatch(removeFromCart(item.id))}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="d-grid">
              <button className="btn btn-success" onClick={handleCheckout} disabled={isSubmitting}>
                {isSubmitting ? "Placing Order..." : "Checkout"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
