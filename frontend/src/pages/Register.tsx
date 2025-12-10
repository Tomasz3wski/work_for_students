import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Hasła nie są identyczne!");
      return;
    }

    setIsSubmitting(true);

    // Symulacja rejestracji
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Konto założone! Możesz się teraz zalogować.");
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <h2>Dołącz do nas</h2>
        <p className="auth-subtitle">Znajdź swoją pierwszą pracę już dziś.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Imię i Nazwisko</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="np. Jan Kowalski"
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
              placeholder="Powtórz hasło"
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