import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { subscribeToOrders } from "../firebase/firestore";
import type { Order } from "../types/types";

const Orders = () => {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToOrders(
      user.uid,
      (nextOrders) => {
        setOrders(nextOrders);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message || "Unable to load order history.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

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
          Sign in to view your order history.
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
          <h1 className="mb-1">Orders</h1>
          <p className="text-muted mb-0">Review your past purchases.</p>
        </div>
      </div>

      {isLoading && (
        <div className="d-flex justify-content-center py-3">
          <div className="spinner-border text-primary" role="status" aria-label="Loading" />
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!isLoading && !error && orders.length === 0 && (
        <div className="alert alert-info" role="alert">
          You have no orders yet.
        </div>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <div key={order.id} className="card shadow-sm">
              <div className="card-body d-flex flex-column flex-md-row justify-content-between gap-3">
                <div>
                  <div className="fw-semibold">Order {order.id}</div>
                  <div className="small text-muted">
                    {order.createdAt ? order.createdAt.toLocaleString() : "Pending timestamp"}
                  </div>
                </div>
                <div className="text-md-end">
                  <div className="fw-semibold mb-2">${order.total.toFixed(2)}</div>
                  <Link className="btn btn-outline-primary btn-sm" to={`/orders/${order.id}`}>
                    View details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
