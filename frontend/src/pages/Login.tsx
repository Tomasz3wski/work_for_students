import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthCredentials } from "../types";
import { authService } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AuthCredentials>({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Stan błędu

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await authService.login(formData);
      
      localStorage.setItem("userToken", response.token);
      
      navigate("/");
      
    } catch (error: any) {
      setErrorMessage(error.message || "Wystąpił nieoczekiwany błąd.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <h2>Witaj ponownie</h2>
        <p className="auth-subtitle">Zaloguj się, aby aplikować na oferty.</p>
        
        {errorMessage && (
          <div style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>
            {errorMessage}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
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