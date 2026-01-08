import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, profile, loading, updateProfile, deleteAccount, logout } = useAuth();
  const [form, setForm] = useState({ name: "", address: "" });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        address: profile.address ?? "",
      });
    }
  }, [profile]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSaving(true);
    try {
      await updateProfile(form);
      setMessage("Profile updated.");
    } catch (err) {
      setError((err as Error)?.message || "Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account and all related data? This cannot be undone."
    );
    if (!confirmed) return;
    setError(null);
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch (err) {
      setError((err as Error)?.message || "Unable to delete account.");
    } finally {
      setIsDeleting(false);
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
          Sign in to manage your profile.
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link className="btn btn-primary" to="/login">
            Go to login
          </Link>
          <Link className="btn btn-outline-secondary" to="/register">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="mb-1">Profile</h1>
          <p className="text-muted mb-0">Update your contact information.</p>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body d-flex flex-column gap-3">
          {message && <div className="alert alert-success py-2 mb-0">{message}</div>}
          {error && <div className="alert alert-danger py-2 mb-0">{error}</div>}
          <div className="small text-muted">Signed in as {user.email}</div>
          <form className="d-flex flex-column gap-2" onSubmit={handleSubmit}>
            <div>
              <label className="form-label fw-semibold mb-1" htmlFor="profile-name">
                Name
              </label>
              <input
                id="profile-name"
                className="form-control"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
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
                value={form.address}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, address: event.target.value }))
                }
                required
              />
            </div>
            <button className="btn btn-primary align-self-start" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
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
        </div>
      </div>
    </div>
  );
};

export default Profile;
