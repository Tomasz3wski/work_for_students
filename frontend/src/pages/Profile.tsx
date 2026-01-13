import { useEffect, useState } from "react";
import { userService, type UserProfile } from "../api/user";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const data = await userService.getCurrentUser();
            if (data) {
                setUser(data);
            } else {
                navigate("/login");
            }
            setLoading(false);
        };
        fetchUser();
    }, [navigate]);

    const handleSave = async () => {
        if (!user) return;
        try {
            await userService.updateUser(user);
            alert("Zapisano zmiany (Teoretycznie - sprawdź backend!)");
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return <div className="p-4">Ładowanie profilu...</div>;
    if (!user) return <div className="p-4">Nie znaleziono użytkownika.</div>;

    return (
        <div className="auth-container">
            <h2>Edycja Profilu</h2>
            {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="form-group">
                    <label>Email (nieedytowalny)</label>
                    <input type="email" value={user.email} disabled />
                </div>

                {user.role === "STUDENT" && (
                    <>
                        <div className="form-group">
                            <label>Imię</label>
                            <input 
                                type="text" 
                                value={user.name || ""} 
                                onChange={e => setUser({...user, name: e.target.value})} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Nazwisko</label>
                            <input 
                                type="text" 
                                value={user.surname || ""} 
                                onChange={e => setUser({...user, surname: e.target.value})} 
                            />
                        </div>
                    </>
                )}

                {user.role === "EMPLOYER" && (
                    <>
                        <div className="form-group">
                            <label>Nazwa Firmy</label>
                            <input 
                                type="text" 
                                value={user.company || ""} 
                                onChange={e => setUser({...user, company: e.target.value})} 
                            />
                        </div>
                        <div className="form-group">
                            <label>NIP</label>
                            <input 
                                type="text" 
                                value={user.nip || ""} 
                                onChange={e => setUser({...user, nip: e.target.value})} 
                            />
                        </div>
                    </>
                )}

                <button type="submit" className="btn btn-primary" style={{marginTop: '20px'}}>
                    Zapisz zmiany
                </button>
            </form>
        </div>
    );
}