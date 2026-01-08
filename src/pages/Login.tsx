import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/products", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(form.email, form.password);
      setForm({ email: "", password: "" });
      navigate("/products");
    } catch (err) {
      setError((err as Error)?.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body d-flex flex-column gap-3">
              <div>
                <h1 className="h4 mb-1">Sign in</h1>
                <p className="text-muted mb-0">Welcome back! Please enter your details.</p>
              </div>
              {error && <div className="alert alert-danger py-2 mb-0">{error}</div>}
              <form className="d-flex flex-column gap-2" onSubmit={handleSubmit}>
                <div>
                  <label className="form-label fw-semibold mb-1" htmlFor="login-email">
                    Email
                  </label>
                  <input
                    id="login-email"
                    className="form-control"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, email: event.target.value }))
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
                    value={form.password}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                    required
                  />
                </div>
                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </form>
              <div className="small text-muted">
                New here? <Link to="/register">Create an account</Link>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
