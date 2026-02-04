import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("userToken");
    const isLoggedIn = !!token;

    // --- NOWA LOGIKA: Dekodowanie roli z tokena ---
    let userRole = null;
    if (token) {
        try {
            // Token JWT składa się z 3 części oddzielonych kropkami. 
            // Druga część (payload) zawiera dane użytkownika w Base64.
            const payloadBase64 = token.split('.')[1];
            if (payloadBase64) {
                const decodedJson = atob(payloadBase64);
                const payload = JSON.parse(decodedJson);
                userRole = payload.role; // Zakładamy, że w tokenie jest pole "role"
            }
        } catch (e) {
            console.error("Błąd dekodowania tokena", e);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        window.location.reload(); // Proste przeładowanie czyści stan
    };

    return (
        <nav className='navbar'>
            <div
                className='nav-brand'
                onClick={() => navigate("/")}>
                Work For Students
            </div>

            <div className='nav-buttons' style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {isLoggedIn ? (
                    <>
                        {/* --- NOWY PRZYCISK: Widoczny tylko dla Studenta --- */}
                        {userRole === "STUDENT" && (
                            <button 
                                className='btn btn-secondary btn-sm'
                                onClick={() => navigate("/my-applications")}
                                title="Historia moich aplikacji"
                            >
                                📂 Moje Aplikacje
                            </button>
                        )}

                        <button 
                            className='btn btn-secondary btn-sm'
                            onClick={() => navigate("/profile")}
                            title="Mój Profil"
                        >
                            👤 Profil
                        </button>
                        <button
                            className='btn btn-secondary btn-sm'
                            onClick={handleLogout}>
                            Wyloguj
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className='btn btn-secondary btn-sm'
                            onClick={() => navigate("/login")}>
                            Zaloguj
                        </button>
                        <button
                            className='btn btn-primary btn-sm'
                            onClick={() => navigate("/register")}>
                            Dołącz
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}