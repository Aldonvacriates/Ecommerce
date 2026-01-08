import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    password: "",
  });
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
      await register({
        email: form.email,
        password: form.password,
        name: form.name,
        address: form.address,
      });
      setForm({ name: "", address: "", email: "", password: "" });
      navigate("/products");
    } catch (err) {
      setError((err as Error)?.message || "Unable to create account.");
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
        <div className="col-md-7 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body d-flex flex-column gap-3">
              <div>
                <h1 className="h4 mb-1">Create an account</h1>
                <p className="text-muted mb-0">Join to manage orders and checkout faster.</p>
              </div>
              {error && <div className="alert alert-danger py-2 mb-0">{error}</div>}
              <form className="d-flex flex-column gap-2" onSubmit={handleSubmit}>
                <div>
                  <label className="form-label fw-semibold mb-1" htmlFor="register-name">
                    Name
                  </label>
                  <input
                    id="register-name"
                    className="form-control"
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
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
                    value={form.address}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, address: event.target.value }))
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
                    value={form.email}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, email: event.target.value }))
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
                    value={form.password}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                    required
                  />
                </div>
                <button className="btn btn-dark" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create account"}
                </button>
              </form>
              <div className="small text-muted">
                Already have an account? <Link to="/login">Sign in</Link>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
