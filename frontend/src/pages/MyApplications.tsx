import { useEffect, useState } from "react";
import { applicationService, type JobApplication, type ApplicationStatus } from "../api/applications";
import { useNavigate } from "react-router-dom";

export default function MyApplications() {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const data = await applicationService.getMyApplications();
                setApplications(data);
            } catch (err: any) {
                console.error(err);
                if (err.message.includes("403")) navigate("/login");
                setError("Nie udało się pobrać Twoich aplikacji.");
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, [navigate]);

    // --- TUTAJ BYŁ PROBLEM: Dodano obsługę "VIEWED" i "SEEN" ---
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "ACCEPTED": 
                return { bg: "#dcfce7", text: "#166534", label: "✅ Zaproszenie / Zaakceptowana" };
            case "REJECTED": 
                return { bg: "#fee2e2", text: "#991b1b", label: "⛔ Odrzucona" };
            
            case "VIEWED":     
                return { bg: "#fef9c3", text: "#854d0e", label: "👁️ Wyświetlona" };
            
            case "NEW":      
                return { bg: "#dbeafe", text: "#1e40af", label: "📨 Wysłana (Oczekuje)" };
            
            default:         
                return { bg: "#f3f4f6", text: "#374151", label: status };
        }
    };

    if (loading) return <div className="p-10 text-center" style={{padding: '40px', color: '#666'}}>Ładowanie Twoich aplikacji...</div>;

    return (
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                
                <header style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111', margin: 0 }}>Moje Aplikacje</h2>
                    <p style={{ color: '#6b7280', marginTop: '5px' }}>Śledź status swoich zgłoszeń.</p>
                </header>

                {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

                {applications.length === 0 ? (
                    <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📭</div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#374151' }}>Brak aplikacji</h3>
                        <p style={{ color: '#6b7280', margin: '10px 0 20px 0' }}>Nie aplikowałeś jeszcze na żadną ofertę pracy.</p>
                        <button onClick={() => navigate("/")} className="btn btn-primary">Przeglądaj Oferty</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {applications.map((app) => {
                            const statusStyle = getStatusStyle(app.status);
                            return (
                                <div key={app.id} style={{ 
                                    background: 'white', 
                                    padding: '25px', 
                                    borderRadius: '12px', 
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    borderLeft: `5px solid ${statusStyle.text}`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '15px'
                                }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 5px 0', color: '#111' }}>
                                            {app.offer.title}
                                        </h3>
                                        <div style={{ color: '#4b5563', marginBottom: '5px', fontWeight: '500' }}>
                                            🏢 {app.offer.company} &nbsp;•&nbsp; 📍 {app.offer.location}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                                            📅 Złożono: {new Date(app.appliedAt).toLocaleDateString()} o {new Date(app.appliedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>

                                    <div>
                                        <span style={{ 
                                            backgroundColor: statusStyle.bg, 
                                            color: statusStyle.text, 
                                            padding: '8px 16px', 
                                            borderRadius: '50px', 
                                            fontSize: '0.9rem', 
                                            fontWeight: '600',
                                            display: 'inline-block'
                                        }}>
                                            {statusStyle.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}