import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import { testConnection } from "../api/client";

export default function Navbar() {
  const navigate = useNavigate();
  const [backendMessage, setBackendMessage] = useState("Łączenie...");
  const isLoggedIn = !!localStorage.getItem("userToken");

  useEffect(() => {
    testConnection()
      .then((msg: string) => setBackendMessage(msg))
      .catch(() => setBackendMessage("Offline"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    window.location.reload(); // Najprostszy sposób na odświeżenie stanu aplikacji
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate("/")}>
        Work For Students
      </div>
      
      <div className="nav-center-info">
        Status: <span className={backendMessage === "Offline" ? "status-error" : "status-ok"}>
          {backendMessage}
        </span>
      </div>

      <div className="nav-buttons">
        {isLoggedIn ? (
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Wyloguj
          </button>
        ) : (
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/login")}>
              Zaloguj
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/login")}>
              Dołącz
            </button>
          </>
        )}
      </div>
    </nav>
  );
}