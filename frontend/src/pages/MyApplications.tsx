import { useEffect, useState } from "react";
import { applicationService, type JobApplication, type ApplicationStatus } from "../api/applications";
import { reviewsService, type ReviewsResponse } from "../api/reviews"; // Import serwisu opinii
import { useNavigate } from "react-router-dom";

export default function MyApplications() {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // --- STAN DLA MODALA OPINII ---
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedEmployerId, setSelectedEmployerId] = useState<number | null>(null);
    const [employerReviews, setEmployerReviews] = useState<ReviewsResponse | null>(null);
    const [selectedEmployerName, setSelectedEmployerName] = useState(""); // Nazwa firmy do nagłówka

    // Formularz nowej opinii
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");

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

    // --- LOGIKA OPINII ---
    const handleOpenReviews = async (employerId: number, companyName: string) => {
        setSelectedEmployerId(employerId);
        setSelectedEmployerName(companyName);
        setIsReviewModalOpen(true);
        try {
            const data = await reviewsService.getUserReviews(employerId);
            setEmployerReviews(data);
        } catch (e) {
            console.error("Błąd pobierania opinii", e);
        }
    };

    const handleAddReview = async (e: any) => {
        e.preventDefault();
        if (!selectedEmployerId) return;

        try {
            await reviewsService.addReview(selectedEmployerId, newRating, newComment);
            alert("Opinia dodana pomyślnie!");
            const updated = await reviewsService.getUserReviews(selectedEmployerId);
            setEmployerReviews(updated);
            setNewComment("");
            setNewRating(5);
        } catch (e) {
            alert("Wystąpił błąd przy dodawaniu opinii.");
        }
    };

    const renderStars = (rating: number) => {
        return "⭐".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "ACCEPTED": return { bg: "#dcfce7", text: "#166534", label: "✅ Zaproszenie / Zaakceptowana" };
            case "REJECTED": return { bg: "#fee2e2", text: "#991b1b", label: "⛔ Odrzucona" };
            case "SEEN":
            case "VIEWED":   return { bg: "#fef9c3", text: "#854d0e", label: "👁️ Wyświetlona przez pracodawcę" };
            case "NEW":      return { bg: "#dbeafe", text: "#1e40af", label: "📨 Wysłana (Oczekuje)" };
            default:         return { bg: "#f3f4f6", text: "#374151", label: status };
        }
    };

    if (loading) return <div className="p-10 text-center" style={{padding: '40px', color: '#666'}}>Ładowanie Twoich aplikacji...</div>;

    return (
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '40px 20px', position: 'relative' }}>
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
                                    background: 'white', padding: '25px', borderRadius: '12px', 
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: `5px solid ${statusStyle.text}`,
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'
                                }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 5px 0', color: '#111' }}>
                                            {app.offer.title}
                                        </h3>
                                        <div style={{ color: '#4b5563', marginBottom: '5px', fontWeight: '500' }}>
                                            🏢 {app.offer.company} &nbsp;•&nbsp; 📍 {app.offer.location}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                                            📅 Złożono: {new Date(app.appliedAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                                        <span style={{ 
                                            backgroundColor: statusStyle.bg, color: statusStyle.text, 
                                            padding: '8px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '600'
                                        }}>
                                            {statusStyle.label}
                                        </span>

                                        {/* PRZYCISK OCENY PRACODAWCY */}
                                        {app.offer.employer && (
                                            <button 
                                                onClick={() => handleOpenReviews(app.offer.employer.id, app.offer.company)}
                                                style={{ 
                                                    background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', 
                                                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600',
                                                    display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'
                                                }}
                                            >
                                                ⭐ Oceń Pracodawcę
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- MODAL Z OPINIAMI --- */}
            {isReviewModalOpen && selectedEmployerId && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', 
                    zIndex: 1000 
                }}>
                    <div style={{ 
                        background: 'white', width: '600px', maxHeight: '90vh', overflowY: 'auto', 
                        borderRadius: '12px', padding: '30px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <button 
                            onClick={() => setIsReviewModalOpen(false)} 
                            style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}
                        >
                            ×
                        </button>
                        
                        <h2 style={{ marginTop: 0, color: '#111827', fontSize: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px' }}>
                            Opinie o {selectedEmployerName}
                        </h2>
                        
                        {/* Statystyki */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px', background: '#fffbeb', padding: '20px', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#d97706', lineHeight: 1 }}>
                                {employerReviews?.average ? employerReviews.average.toFixed(1) : "0.0"}
                            </div>
                            <div>
                                <div style={{ color: '#f59e0b', fontSize: '1.2rem', letterSpacing: '2px' }}>{renderStars(employerReviews?.average || 0)}</div>
                                <div style={{ color: '#92400e', fontSize: '0.9rem', marginTop: '5px', fontWeight: '500' }}>Na podstawie {employerReviews?.count || 0} opinii</div>
                            </div>
                        </div>

                        {/* Lista */}
                        <h3 style={{ fontSize: '1.1rem', color: '#374151', marginBottom: '15px' }}>Opinie innych studentów</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                            {employerReviews?.reviews && employerReviews.reviews.length > 0 ? (
                                employerReviews.reviews.map(rev => (
                                    <div key={rev.id} style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <strong style={{ color: '#1f2937' }}>{rev.reviewerName}</strong>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div style={{ color: '#f59e0b', fontSize: '0.9rem', marginBottom: '8px' }}>{renderStars(rev.rating)}</div>
                                        <p style={{ margin: 0, color: '#1f2937', fontSize: '0.95rem', lineHeight: 1.5 }}>{rev.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>Brak opinii. Bądź pierwszy!</p>
                            )}
                        </div>

                        {/* Formularz */}
                        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#374151' }}>Oceń pracodawcę</h3>
                            <form onSubmit={handleAddReview}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>Ocena</label>
                                    <select 
                                        value={newRating} 
                                        onChange={(e) => setNewRating(Number(e.target.value))}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#ffffff', color: '#1f2937', fontSize: '1rem' }}
                                    >
                                        <option value="5" style={{color: '#000000'}}>⭐⭐⭐⭐⭐ (5 - Super)</option>
                                        <option value="4" style={{color: '#000000'}}>⭐⭐⭐⭐ (4 - Dobrze)</option>
                                        <option value="3" style={{color: '#000000'}}>⭐⭐⭐ (3 - Może być)</option>
                                        <option value="2" style={{color: '#000000'}}>⭐⭐ (2 - Słabo)</option>
                                        <option value="1" style={{color: '#000000'}}>⭐ (1 - Odradzam)</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>Komentarz</label>
                                    <textarea 
                                        value={newComment} 
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Jak wyglądał proces rekrutacji? Jaka atmosfera?"
                                        required
                                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', minHeight: '100px', fontFamily: 'inherit', resize: 'vertical', background: '#ffffff', color: '#1f2937' }}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 'bold' }}>Dodaj Opinię</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}