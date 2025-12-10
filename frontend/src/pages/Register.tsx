import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/auth";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Hasła nie są identyczne!");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await authService.register(formData);
      
      alert("Konto założone pomyślnie! Możesz się zalogować.");
      navigate("/login");
      
    } catch (error: any) {
      setErrorMessage(error.message || "Nie udało się utworzyć konta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <h2>Dołącz do nas</h2>
        <p className="auth-subtitle">Znajdź swoją pierwszą pracę już dziś.</p>

        {errorMessage && (
          <div style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>
            {errorMessage}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Imię i Nazwisko</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              className="input-field"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>

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
              placeholder="Min. 8 znaków"
              className="input-field"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Powtórz hasło</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              className="input-field"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? "Tworzenie konta..." : "Zarejestruj się"}
          </button>
        </form>

        <div className="auth-footer">
          Masz już konto? <span className="link" onClick={() => navigate("/login")}>Zaloguj się</span>
        </div>
      </div>
    </div>
  );
}