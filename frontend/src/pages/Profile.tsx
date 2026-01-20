import { useEffect, useState } from "react";
import { userService, type UserProfile } from "../api/user";
import { useNavigate } from "react-router-dom";

const DAYS = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

// Typy pomocnicze
type DayAvailability = {
    active: boolean;
    start: string;
    end: string;
};
type AvailabilityMap = Record<string, DayAvailability>;

export default function Profile() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState<string | null>(null);
    const [cvFile, setCvFile] = useState<File | null>(null);
    
    // Inicjalizacja dostępności
    const [availability, setAvailability] = useState<AvailabilityMap>(
        DAYS.reduce((acc, day) => ({
            ...acc,
            [day]: { active: false, start: "08:00", end: "16:00" }
        }), {} as AvailabilityMap)
    );

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await userService.getCurrentUser();
                
                if (data) {
                    setUser(data);
                    // Parsowanie dostępności
                    if (data.availability) {
                        try {
                            const parsed = JSON.parse(data.availability);
                            setAvailability(prev => ({ ...prev, ...parsed }));
                        } catch (e) {
                            console.error("Błąd JSON availability", e);
                        }
                    }
                } else {
                    navigate("/login");
                }
            } catch (err) {
                console.error(err);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    // --- LOGIKA WALIDACJI GODZIN ---
    const handleAvailabilityChange = (day: string, field: keyof DayAvailability, value: any) => {
        setAvailability(prev => {
            const currentDay = prev[day];
            let newStart = currentDay.start;
            let newEnd = currentDay.end;
            let newActive = currentDay.active;

            if (field === 'active') {
                newActive = value;
            } else if (field === 'start') {
                newStart = value;
                // Jeśli nowy Start jest później niż End -> przesuń End na Start
                if (newStart > newEnd) {
                    newEnd = newStart;
                }
            } else if (field === 'end') {
                // Jeśli nowy End jest wcześniej niż Start -> zablokuj zmianę (ustaw na Start)
                if (value < newStart) {
                    newEnd = newStart; 
                } else {
                    newEnd = value;
                }
            }

            return {
                ...prev,
                [day]: { 
                    active: newActive, 
                    start: newStart, 
                    end: newEnd 
                }
            };
        });
    };

    const handleSave = async () => {
        if (!user) return;
        setError("");
        setSuccess(null);
        
        try {
            const userToUpdate = {
                ...user,
                availability: JSON.stringify(availability)
            };

            await userService.updateUser(userToUpdate, cvFile);

            const updatedUser = await userService.getCurrentUser();
            if (updatedUser) {
                setUser(updatedUser);
                setCvFile(null);
            }

            setSuccess("Zapisano pomyślnie! Odśwież stronę, aby się upewnić.");
            document.getElementById('scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Błąd zapisu.");
        }
    };

    // Helper do otwierania zegara po kliknięciu
    const showTimePicker = (e: any) => {
        try {
            if (e.target.showPicker) {
                e.target.showPicker();
            }
        } catch (error) {
            // Fallback
        }
    };

    if (loading) return <div className="p-4 text-center">Ładowanie...</div>;
    if (!user) return <div className="p-4 text-center">Brak użytkownika.</div>;

    // @ts-ignore
    const hasCv = (user.cvPath && user.cvPath.length > 0) || (user.cvLink && user.cvLink.length > 0);

    return (
        <div 
            id="scroll-container"
            style={{ 
                position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0, 
                overflowY: 'auto', backgroundColor: '#f3f4f6', zIndex: 10 
            }}
        >
            {/* CSS TWEAK: Wymuszenie ikony zegara w inputach time */}
            <style>{`
                input[type="time"]::-webkit-calendar-picker-indicator {
                    display: block;
                    background: transparent;
                    bottom: 0; color: transparent; cursor: pointer;
                    height: auto; left: 0; position: absolute; right: 0; top: 0; width: auto;
                }
                .time-input-wrapper {
                    position: relative;
                    display: inline-block;
                }
                /* Ikona zegarka jako tło */
                .time-input-wrapper::after {
                    content: '🕒';
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                    font-size: 0.8rem;
                    opacity: 0.6;
                }
            `}</style>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px 100px 20px' }}>
                
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>Twój Profil</h2>
                    <p style={{ color: '#6b7280', marginTop: '5px' }}>Uzupełnij dane, aby pracodawcy mogli Cię znaleźć.</p>

                    {error && <div style={{ marginTop: '15px', color: '#991b1b', background: '#fee2e2', padding: '10px', borderRadius: '6px' }}>{error}</div>}
                    {success && <div style={{ marginTop: '15px', color: '#065f46', background: '#d1fae5', padding: '10px', borderRadius: '6px' }}>{success}</div>}
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    
                    {/* Dane Podstawowe */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Dane Podstawowe</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email</label>
                                <input type="email" className="input-field" value={user.email} disabled style={{ background: '#f9fafb', color: '#6b7280' }} />
                            </div>

                            {user.role === "STUDENT" && (
                                <>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Imię</label>
                                        <input type="text" className="input-field" value={user.name || ""} onChange={e => setUser({...user, name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Nazwisko</label>
                                        <input type="text" className="input-field" value={user.surname || ""} onChange={e => setUser({...user, surname: e.target.value})} />
                                    </div>
                                </>
                            )}
                             {user.role === "EMPLOYER" && (
                                <>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Firma</label>
                                        <input type="text" className="input-field" value={user.company || ""} onChange={e => setUser({...user, company: e.target.value})} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>NIP</label>
                                        <input type="text" className="input-field" maxLength={10} value={user.nip || ""} onChange={e => setUser({...user, nip: e.target.value.replace(/\D/g, '').slice(0, 10)})} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {user.role === "STUDENT" && (
                        <>
                            {/* CV Section */}
                            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Twoje CV</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1 }}>
                                        <input 
                                            type="file" 
                                            className="input-field"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => setCvFile(e.target.files ? e.target.files[0] : null)}
                                            style={{ padding: '8px' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1, padding: '15px', background: hasCv ? '#ecfdf5' : '#fef2f2', borderRadius: '8px', border: '1px solid', borderColor: hasCv ? '#a7f3d0' : '#fecaca', display: 'flex', alignItems: 'center' }}>
                                        {hasCv ? (
                                            <span style={{ color: '#065f46', fontWeight: 'bold' }}>✓ CV wgrane na serwer</span>
                                        ) : (
                                            <span style={{ color: '#991b1b', fontWeight: 'bold' }}>⚠️ Brak CV</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Dostępność */}
                            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Dostępność</h3>
                                <div>
                                    {DAYS.map(day => (
                                        <div key={day} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '15px', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f9fafb' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={availability[day]?.active || false}
                                                    onChange={(e) => handleAvailabilityChange(day, 'active', e.target.checked)}
                                                    style={{ width: '18px', height: '18px', marginRight: '10px', cursor: 'pointer' }}
                                                />
                                                <span style={{ fontWeight: availability[day]?.active ? 'bold' : 'normal' }}>{day}</span>
                                            </div>
                                            
                                            <div style={{ visibility: availability[day]?.active ? 'visible' : 'hidden', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                <div className="time-input-wrapper">
                                                    <input 
                                                        type="time" 
                                                        className="input-field"
                                                        value={availability[day].start} 
                                                        onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)} 
                                                        onClick={showTimePicker}
                                                        style={{ width: '120px', padding: '8px', cursor: 'pointer' }} 
                                                    />
                                                </div>
                                                <span>-</span>
                                                <div className="time-input-wrapper">
                                                    <input 
                                                        type="time" 
                                                        className="input-field"
                                                        value={availability[day].end} 
                                                        onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)} 
                                                        onClick={showTimePicker}
                                                        style={{ width: '120px', padding: '8px', cursor: 'pointer' }} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '15px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center', boxShadow: '0 -4px 10px rgba(0,0,0,0.05)', zIndex: 20 }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', maxWidth: '400px', padding: '12px', fontSize: '1.1rem' }}>
                            Zapisz Zmiany
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}