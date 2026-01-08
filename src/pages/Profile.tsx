import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { subscribeToOrders } from "../firebase/firestore";
import type { Order } from "../types/types";

const Profile = () => {
  const { user, profile, loading, register, login, logout, updateProfile, deleteAccount } =
    useAuth();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    address: "",
    email: "",
    password: "",
  });
  const [profileForm, setProfileForm] = useState({ name: "", address: "" });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name ?? "",
        address: profile.address ?? "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setOrdersLoading(false);
      setOrdersError(null);
      return;
    }

    setOrdersLoading(true);
    const unsubscribe = subscribeToOrders(
      user.uid,
      (nextOrders) => {
        setOrders(nextOrders);
        setOrdersError(null);
        setOrdersLoading(false);
      },
      (error) => {
        setOrdersError(error.message || "Unable to load order history.");
        setOrdersLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    try {
      await login(loginForm.email, loginForm.password);
      setLoginForm({ email: "", password: "" });
    } catch (error) {
      setLoginError((error as Error)?.message || "Unable to sign in.");
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterError(null);
    try {
      await register({
        email: registerForm.email,
        password: registerForm.password,
        name: registerForm.name,
        address: registerForm.address,
      });
      setRegisterForm({ name: "", address: "", email: "", password: "" });
    } catch (error) {
      setRegisterError((error as Error)?.message || "Unable to create account.");
    }
  };

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    try {
      await updateProfile(profileForm);
      setProfileMessage("Profile updated.");
    } catch (error) {
      setProfileError((error as Error)?.message || "Unable to update profile.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account and all related data? This cannot be undone."
    );
    if (!confirmed) return;
    setAccountError(null);
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch (error) {
      setAccountError((error as Error)?.message || "Unable to delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  const orderTotal = useMemo(
    () => (order: Order) => order.total.toFixed(2),
    []
  );

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" aria-label="Loading" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="mb-1">Account</h1>
          <p className="text-muted mb-0">
            Manage your profile and review your past orders.
          </p>
        </div>
      </div>

      {!user ? (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column gap-3">
                <h5 className="card-title">Sign in</h5>
                {loginError && <div className="alert alert-danger py-2 mb-0">{loginError}</div>}
                <form className="d-flex flex-column gap-2" onSubmit={handleLogin}>
                  <div>
                    <label className="form-label fw-semibold mb-1" htmlFor="login-email">
                      Email
                    </label>
                    <input
                      id="login-email"
                      className="form-control"
                      type="email"
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label fw-semibold mb-1" htmlFor="login-password">
                      Password
                    </label>
                    <input
                      id="login-password"
                      className="form-control"
                      type="password"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <button className="btn btn-primary" type="submit">
                    Sign in
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column gap-3">
                <h5 className="card-title">Create an account</h5>
                {registerError && (
                  <div className="alert alert-danger py-2 mb-0">{registerError}</div>
                )}
                <form className="d-flex flex-column gap-2" onSubmit={handleRegister}>
                  <div>
                    <label className="form-label fw-semibold mb-1" htmlFor="register-name">
                      Name
                    </label>
                    <input
                      id="register-name"
                      className="form-control"
                      value={registerForm.name}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label fw-semibold mb-1" htmlFor="register-address">
                      Address
                    </label>
                    <input
                      id="register-address"
                      className="form-control"
                      value={registerForm.address}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({ ...prev, address: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label fw-semibold mb-1" htmlFor="register-email">
                      Email
                    </label>
                    <input
                      id="register-email"
                      className="form-control"
                      type="email"
                      value={registerForm.email}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label fw-semibold mb-1" htmlFor="register-password">
                      Password
                    </label>
                    <input
                      id="register-password"
                      className="form-control"
                      type="password"
                      value={registerForm.password}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <button className="btn btn-dark" type="submit">
                    Create account
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex flex-column gap-3">
              <div>
                <h5 className="card-title mb-1">Profile details</h5>
                <p className="text-muted mb-0">Update your contact information.</p>
              </div>
              {profileMessage && (
                <div className="alert alert-success py-2 mb-0">{profileMessage}</div>
              )}
              {profileError && (
                <div className="alert alert-danger py-2 mb-0">{profileError}</div>
              )}
              <div className="small text-muted">Signed in as {user.email}</div>
              <form className="d-flex flex-column gap-2" onSubmit={handleProfileUpdate}>
                <div>
                  <label className="form-label fw-semibold mb-1" htmlFor="profile-name">
                    Name
                  </label>
                  <input
                    id="profile-name"
                    className="form-control"
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="form-label fw-semibold mb-1" htmlFor="profile-address">
                    Address
                  </label>
                  <input
                    id="profile-address"
                    className="form-control"
                    value={profileForm.address}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, address: event.target.value }))
                    }
                    required
                  />
                </div>
                <button className="btn btn-primary align-self-start" type="submit">
                  Save changes
                </button>
              </form>
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-outline-secondary" onClick={logout}>
                  Log out
                </button>
                <button
                  className="btn btn-outline-danger"
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete account"}
                </button>
              </div>
              {accountError && (
                <div className="alert alert-danger py-2 mb-0">{accountError}</div>
              )}
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body d-flex flex-column gap-3">
              <div>
                <h5 className="card-title mb-1">Order history</h5>
                <p className="text-muted mb-0">Review your past carts and order details.</p>
              </div>
              {ordersLoading && (
                <div className="d-flex justify-content-center py-3">
                  <div className="spinner-border text-primary" role="status" aria-label="Loading" />
                </div>
              )}
              {ordersError && (
                <div className="alert alert-danger py-2 mb-0">{ordersError}</div>
              )}
              {!ordersLoading && !ordersError && orders.length === 0 && (
                <p className="text-muted mb-0">You have no orders yet.</p>
              )}
              {!ordersLoading && !ordersError && orders.length > 0 && (
                <div className="d-flex flex-column gap-3">
                  {orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    return (
                      <div key={order.id} className="border rounded p-3">
                        <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                          <div>
                            <div className="fw-semibold">Order {order.id}</div>
                            <div className="small text-muted">
                              {order.createdAt
                                ? order.createdAt.toLocaleString()
                                : "Pending timestamp"}
                            </div>
                          </div>
                          <div className="text-md-end">
                            <div className="fw-semibold">${orderTotal(order)}</div>
                            <button
                              className="btn btn-link btn-sm p-0"
                              type="button"
                              onClick={() =>
                                setExpandedOrderId(isExpanded ? null : order.id)
                              }
                            >
                              {isExpanded ? "Hide details" : "View details"}
                            </button>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-3">
                            <ul className="list-group">
                              {order.items.map((item) => (
                                <li
                                  key={`${order.id}-${item.id}`}
                                  className="list-group-item d-flex justify-content-between align-items-start"
                                >
                                  <div>
                                    <div className="fw-semibold">{item.title}</div>
                                    <div className="small text-muted">
                                      Qty: {item.quantity}
                                    </div>
                                  </div>
                                  <div className="fw-semibold">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </div>
                                </li>
                              ))}
                            </ul>
                            <div className="text-end fw-semibold mt-2">
                              Total: ${orderTotal(order)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
