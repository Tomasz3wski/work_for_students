import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthCredentials } from "../types";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AuthCredentials>({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Symulacja logowania
    setTimeout(() => {
      setIsSubmitting(false);
      localStorage.setItem("userToken", "fake-jwt-token");
      navigate("/"); // Przekieruj na główną
    }, 1000);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <h2>Witaj ponownie</h2>
        <p className="auth-subtitle">Zaloguj się, aby aplikować na oferty.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="np. jan@kowalski.pl"
              className="input-field"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Twoje hasło"
              className="input-field"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>

        <div className="auth-footer">
          Nowy w Work For Students? <span className="link" onClick={() => navigate("/register")}>Załóż konto</span>
        </div>
      </div>
    </div>
  );
}