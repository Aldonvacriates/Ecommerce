import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrderById } from "../firebase/firestore";
import type { Order } from "../types/types";

const OrderDetails = () => {
  const { user, loading } = useAuth();
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !orderId) {
      setOrder(null);
      setIsLoading(false);
      if (!orderId) {
        setError("Missing order ID.");
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    getOrderById(orderId)
      .then((foundOrder) => {
        if (!foundOrder) {
          setError("Order not found.");
          return;
        }
        if (foundOrder.userId !== user.uid) {
          setError("You don't have access to this order.");
          return;
        }
        setOrder(foundOrder);
      })
      .catch((err) => {
        setError((err as Error)?.message || "Unable to load order details.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderId, user]);

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
          Sign in to view this order.
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
          <h1 className="mb-1">Order Details</h1>
          <p className="text-muted mb-0">Review items and totals for this order.</p>
        </div>
        <Link className="btn btn-outline-secondary" to="/orders">
          Back to orders
        </Link>
      </div>

      {isLoading && (
        <div className="d-flex justify-content-center py-3">
          <div className="spinner-border text-primary" role="status" aria-label="Loading" />
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!isLoading && !error && order && (
        <div className="card shadow-sm">
          <div className="card-body d-flex flex-column gap-3">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
              <div>
                <div className="fw-semibold">Order {order.id}</div>
                <div className="small text-muted">
                  {order.createdAt ? order.createdAt.toLocaleString() : "Pending timestamp"}
                </div>
              </div>
              <div className="text-md-end">
                <div className="fw-semibold">Total: ${order.total.toFixed(2)}</div>
              </div>
            </div>

            <ul className="list-group">
              {order.items.map((item) => (
                <li
                  key={`${order.id}-${item.id}`}
                  className="list-group-item d-flex justify-content-between align-items-start"
                >
                  <div>
                    <div className="fw-semibold">{item.title}</div>
                    <div className="small text-muted">Qty: {item.quantity}</div>
                  </div>
                  <div className="fw-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
