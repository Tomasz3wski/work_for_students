import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import { offersService } from "../api/offers";
// @ts-ignore
import { applicationService, type JobApplication, type ApplicationStatus } from "../api/applications";
// @ts-ignore
import { reviewsService, type ReviewsResponse } from "../api/reviews";
// @ts-ignore
import { userService, type UserProfile } from "../api/user";
import type { JobOffer } from "../types";

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");
  
  // Rozpoznawanie roli użytkownika z tokena JWT
  let userRole = "GUEST";
  if (token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        userRole = payload.role;
    } catch(e) {
        console.error("Błąd dekodowania tokena", e);
    }
  }

  // Wybór odpowiedniego dashboardu
  if (userRole === "EMPLOYER") {
      return <EmployerDashboard />;
  }

  return <StudentDashboard navigate={navigate} token={token} />;
}

// ==========================================
// 🏢 DASHBOARD PRACODAWCY
// ==========================================
function EmployerDashboard() {
    const [myOffers, setMyOffers] = useState<JobOffer[]>([]);
    const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
    const [candidates, setCandidates] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);

    // Stan dla funkcji "Cofnij"
    const [undoState, setUndoState] = useState<{ appId: number, prevStatus: ApplicationStatus } | null>(null);
    const undoTimerRef = useRef<number | null>(null);

    // --- STAN DLA MODALA OPINII ---
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [studentReviews, setStudentReviews] = useState<ReviewsResponse | null>(null);
    
    // Formularz nowej opinii
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");

    // 1. Pobieranie ofert pracodawcy
    useEffect(() => {
        offersService.getMyOffers()
            .then(data => {
                setMyOffers(data);
                if(data.length > 0) setSelectedOfferId(data[0].id);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // 2. Pobieranie kandydatów dla wybranej oferty
    useEffect(() => {
        if (selectedOfferId) {
            // Resetujemy undo przy zmianie oferty
            if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
            setUndoState(null);

            applicationService.getApplicationsForOffer(selectedOfferId)
                .then(setCandidates)
                .catch(err => {
                    console.error(err);
                    setCandidates([]);
                });
        }
    }, [selectedOfferId]);

    // --- LOGIKA ZMIANY STATUSU + COFNIJ ---
    const handleStatusChange = async (appId: number, newStatus: ApplicationStatus) => {
        const currentApp = candidates.find(c => c.id === appId);
        if (!currentApp) return;
        const prevStatus = currentApp.status;

        if (undoTimerRef.current) {
            clearTimeout(undoTimerRef.current);
            setUndoState(null);
        }

        try {
            // Optymistyczna aktualizacja UI
            setCandidates(prev => prev.map(app => 
                app.id === appId ? { ...app, status: newStatus } : app
            ));

            // API Call
            await applicationService.changeStatus(appId, newStatus);

            // Ustawienie Undo
            setUndoState({ appId, prevStatus });

            // Timer 5 sekund
            undoTimerRef.current = window.setTimeout(() => {
                setUndoState(null);
                undoTimerRef.current = null;
            }, 5000);

        } catch (e) {
            alert("Błąd zmiany statusu");
            setCandidates(prev => prev.map(app => 
                app.id === appId ? { ...app, status: prevStatus } : app
            ));
        }
    };

    const handleUndo = async () => {
        if (!undoState) return;
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

        try {
            await applicationService.changeStatus(undoState.appId, undoState.prevStatus);
            setCandidates(prev => prev.map(app => 
                app.id === undoState.appId ? { ...app, status: undoState.prevStatus } : app
            ));
            setUndoState(null);
        } catch (e) {
            alert("Nie udało się cofnąć zmiany.");
        }
    };

    // --- LOGIKA POBIERANIA CV ---
    const handleViewCv = async (appId: number) => {
        try {
            const blob = await applicationService.getApplicantCv(appId);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank'); // Otwórz w nowej karcie
            
            // Jeśli status był NEW, zmień na SEEN w UI (Backend robi to samo przy pobraniu)
            setCandidates(prev => prev.map(app => {
                if (app.id === appId && app.status === 'NEW') {
                    return { ...app, status: 'SEEN' };
                }
                return app;
            }));
        } catch (e) {
            alert("Błąd: Nie udało się pobrać CV (brak pliku lub błąd serwera).");
        }
    };

    // --- LOGIKA OPINII ---
    const handleOpenReviews = async (studentId: number) => {
        setSelectedStudentId(studentId);
        setIsReviewModalOpen(true);
        try {
            const data = await reviewsService.getUserReviews(studentId);
            setStudentReviews(data);
        } catch (e) {
            console.error("Błąd pobierania opinii", e);
        }
    };

    const handleAddReview = async (e: any) => {
        e.preventDefault();
        if (!selectedStudentId) return;

        try {
            await reviewsService.addReview(selectedStudentId, newRating, newComment);
            alert("Opinia dodana pomyślnie!");
            
            // Odśwież listę opinii
            const updated = await reviewsService.getUserReviews(selectedStudentId);
            setStudentReviews(updated);
            
            // Wyczyść formularz
            setNewComment("");
            setNewRating(5);
        } catch (e) {
            alert("Wystąpił błąd przy dodawaniu opinii.");
        }
    };

    const renderStars = (rating: number) => {
        return "⭐".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
    };

    // --- POMOCNICZE UI ---
    const getInitials = (name: string, surname: string) => {
        return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
    };

    const renderAvailability = (jsonString?: string) => {
        if (!jsonString) return <span style={{fontSize: '0.8rem', color: '#9ca3af'}}>Brak danych o dostępności</span>;
        try {
            const schedule = JSON.parse(jsonString);
            const activeDays = Object.entries(schedule).filter(([_, val]: any) => val.active);
            if (activeDays.length === 0) return <span style={{fontSize: '0.8rem', color: '#9ca3af'}}>Elastycznie / Brak danych</span>;

            return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '5px' }}>
                    {activeDays.map(([day, val]: any) => (
                        <div key={day} style={{ 
                            background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px', 
                            padding: '2px 6px', fontSize: '0.75rem', color: '#4b5563', display: 'flex', gap: '4px' 
                        }}>
                            <strong style={{color: '#374151'}}>{day.substring(0, 3)}.</strong> 
                            <span>{val.start}-{val.end}</span>
                        </div>
                    ))}
                </div>
            );
        } catch (e) { return null; }
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: '#666' }}>Ładowanie panelu...</div>;

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#f9fafb', position: 'relative' }}>
            
            {/* LEWY PANEL: Lista Ofert */}
            <div style={{ width: '350px', background: 'white', borderRight: '1px solid #e5e7eb', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#111827', fontWeight: '700' }}>Twoje Ogłoszenia</h2>
                </div>
                {myOffers.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>Nie dodałeś jeszcze ofert.</div>
                ) : (
                    myOffers.map(offer => {
                        const isSelected = selectedOfferId === offer.id;
                        return (
                            <div key={offer.id} onClick={() => setSelectedOfferId(offer.id)} style={{
                                padding: '20px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6',
                                background: isSelected ? '#eff6ff' : 'white', 
                                borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent', 
                                transition: 'all 0.2s'
                            }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#1e40af' : '#374151' }}>{offer.title}</h3>
                                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>📍 {offer.location}</div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* PRAWY PANEL: Lista Kandydatów */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                {selectedOfferId ? (
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                            <div>
                                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111', margin: 0 }}>
                                    {myOffers.find(o => o.id === selectedOfferId)?.title}
                                </h1>
                            </div>
                            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
                                Aplikacji: {candidates.length}
                            </div>
                        </header>

                        {candidates.length === 0 ? (
                            <div style={{ background: 'white', padding: '50px', borderRadius: '12px', textAlign: 'center', color: '#9ca3af' }}>
                                Brak zgłoszeń na tę ofertę.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {candidates.map(app => {
                                    const isUndoActive = undoState?.appId === app.id;

                                    return (
                                        <div key={app.id} style={{ 
                                            background: 'white', borderRadius: '12px', padding: '25px', 
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'flex', 
                                            gap: '20px', border: '1px solid #f3f4f6'
                                        }}>
                                            {/* AWATAR */}
                                            <div style={{ 
                                                width: '50px', height: '50px', background: '#3b82f6', color: 'white', 
                                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0
                                            }}>
                                                {getInitials(app.student.name, app.student.surname)}
                                            </div>

                                            {/* TREŚĆ KARTY */}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <div>
                                                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>{app.student.name} {app.student.surname}</h3>
                                                        <a href={`mailto:${app.student.email}`} style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>✉️ {app.student.email}</a>
                                                    </div>
                                                    
                                                    {/* STATUSY (WIZUALIZACJA) */}
                                                    <div>
                                                        {app.status === 'ACCEPTED' && <span style={{ color: '#166534', background: '#dcfce7', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem' }}>✅ Zaakceptowany</span>}
                                                        {app.status === 'REJECTED' && <span style={{ color: '#991b1b', background: '#fee2e2', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem' }}>⛔ Odrzucony</span>}
                                                        {(app.status === 'SEEN' || app.status === 'VIEWED') && <span style={{ color: '#854d0e', background: '#fef9c3', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem' }}>👁️ Wyświetlona</span>}
                                                        {app.status === 'NEW' && <span style={{ color: '#1e40af', background: '#dbeafe', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem' }}>🆕 Nowa</span>}
                                                    </div>
                                                </div>

                                                {/* DOSTĘPNOŚĆ */}
                                                <div style={{ marginTop: '10px' }}>
                                                    {renderAvailability(app.student.availability)}
                                                </div>

                                                {/* DOLNA BELKA (CV + AKCJE) */}
                                                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    
                                                    {/* LEWA STRONA BELKI: CV + OPINIE */}
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        {/* PRZYCISK CV */}
                                                        {app.student.cvPath ? (
                                                            <button 
                                                                onClick={() => handleViewCv(app.id)}
                                                                className="btn"
                                                                style={{ 
                                                                    background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', 
                                                                    padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600',
                                                                    display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', transition: 'background 0.2s'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.background = '#dbeafe'}
                                                                onMouseOut={(e) => e.currentTarget.style.background = '#eff6ff'}
                                                            >
                                                                📄 Zobacz CV
                                                            </button>
                                                        ) : (
                                                            <span style={{ background: '#fff1f2', color: '#be123c', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #fecdd3' }}>
                                                                ⚠️ Brak CV
                                                            </span>
                                                        )}

                                                        {/* PRZYCISK OPINIE */}
                                                        <button 
                                                            onClick={() => handleOpenReviews(app.student.id)}
                                                            className="btn"
                                                            style={{ 
                                                                background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', 
                                                                padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600',
                                                                display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'
                                                            }}
                                                        >
                                                            ⭐ Opinie
                                                        </button>
                                                    </div>

                                                    {/* PRAWA STRONA BELKI: PRZYCISKI AKCJI / COFNIJ */}
                                                    <div style={{ display: 'flex', gap: '8px', minWidth: '160px', justifyContent: 'flex-end' }}>
                                                        {isUndoActive ? (
                                                            <button 
                                                                onClick={handleUndo}
                                                                className="btn"
                                                                style={{ 
                                                                    background: '#4b5563', color: 'white', padding: '6px 14px', 
                                                                    borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                                                                    display: 'flex', alignItems: 'center', gap: '5px'
                                                                }}
                                                            >
                                                                ↩ Cofnij zmianę
                                                            </button>
                                                        ) : (
                                                            <>
                                                                {app.status !== 'ACCEPTED' && (
                                                                    <button onClick={() => handleStatusChange(app.id, 'ACCEPTED')} className="btn" style={{ background: '#10b981', color: 'white', padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                                                        Zatrudnij
                                                                    </button>
                                                                )}
                                                                {app.status !== 'REJECTED' && (
                                                                    <button onClick={() => handleStatusChange(app.id, 'REJECTED')} className="btn" style={{ background: 'white', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                                                        Odrzuć
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#9ca3af', flexDirection: 'column' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.3 }}>👈</div>
                        <p>Wybierz ofertę z listy po lewej stronie.</p>
                    </div>
                )}
            </div>

            {/* --- MODAL Z OPINIAMI --- */}
            {isReviewModalOpen && selectedStudentId && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', 
                    zIndex: 1000 
                }}>
                    <div style={{ 
                        background: 'white', width: '600px', maxHeight: '90vh', overflowY: 'auto', 
                        borderRadius: '12px', padding: '30px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        {/* Przycisk Zamknij */}
                        <button 
                            onClick={() => setIsReviewModalOpen(false)} 
                            style={{ 
                                position: 'absolute', top: '15px', right: '15px', border: 'none', 
                                background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280'
                            }}
                        >
                            ×
                        </button>
                        
                        <h2 style={{ marginTop: 0, color: '#111827', fontSize: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px' }}>
                            Profil Studenta
                        </h2>
                        
                        {/* Statystyki Ocen */}
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px', 
                            background: '#fffbeb', padding: '20px', borderRadius: '8px', border: '1px solid #fcd34d'
                        }}>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#d97706', lineHeight: 1 }}>
                                {studentReviews?.average ? studentReviews.average.toFixed(1) : "0.0"}
                            </div>
                            <div>
                                <div style={{ color: '#f59e0b', fontSize: '1.2rem', letterSpacing: '2px' }}>
                                    {renderStars(studentReviews?.average || 0)}
                                </div>
                                <div style={{ color: '#92400e', fontSize: '0.9rem', marginTop: '5px', fontWeight: '500' }}>
                                    Na podstawie {studentReviews?.count || 0} opinii
                                </div>
                            </div>
                        </div>

                        {/* Lista Opinii */}
                        <h3 style={{ fontSize: '1.1rem', color: '#374151', marginBottom: '15px' }}>Opinie pracodawców</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                            {studentReviews?.reviews && studentReviews.reviews.length > 0 ? (
                                studentReviews.reviews.map(rev => (
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

                        {/* Formularz dodawania opinii */}
                        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#374151' }}>Wystaw opinię</h3>
                            <form onSubmit={handleAddReview}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>Ocena</label>
                                    <select 
                                        value={newRating} 
                                        onChange={(e) => setNewRating(Number(e.target.value))}
                                        style={{ 
                                            width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', 
                                            background: '#ffffff', color: '#1f2937', fontSize: '1rem' 
                                        }}
                                    >
                                        <option value="5" style={{color: '#000000'}}>⭐⭐⭐⭐⭐ (5 - Wybitny)</option>
                                        <option value="4" style={{color: '#000000'}}>⭐⭐⭐⭐ (4 - Dobry)</option>
                                        <option value="3" style={{color: '#000000'}}>⭐⭐⭐ (3 - Przeciętny)</option>
                                        <option value="2" style={{color: '#000000'}}>⭐⭐ (2 - Słaby)</option>
                                        <option value="1" style={{color: '#000000'}}>⭐ (1 - Unikać)</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>Komentarz</label>
                                    <textarea 
                                        value={newComment} 
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Jak przebiegła współpraca? Co wyróżnia tego kandydata?"
                                        required
                                        style={{ 
                                            width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', 
                                            minHeight: '100px', fontFamily: 'inherit', resize: 'vertical', 
                                            background: '#ffffff', color: '#1f2937' 
                                        }}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 'bold' }}>
                                    Dodaj Opinię
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// 🎓 DASHBOARD STUDENTA / GOŚCIA (Z MĄDRYM PORÓWNYWANIEM GODZIN)
// ==========================================
function StudentDashboard({ navigate, token }: { navigate: any, token: string | null }) {
    const [offers, setOffers] = useState<JobOffer[]>([]);
    const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Profil studenta
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    // 1. Pobierz oferty ORAZ profil studenta (żeby znać jego dostępność)
    useEffect(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          
          // Pobieramy oferty
          const offersData = await offersService.getAllOffers();
          setOffers(offersData);
          if (offersData.length > 0) setSelectedOffer(offersData[0]);

          // Jeśli zalogowany, pobierz profil (do porównania godzin)
          if (token) {
              const userData = await userService.getCurrentUser();
              setUserProfile(userData);
          }

        } catch (err) {
          setError("Błąd pobierania danych.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [token]);
  
    const handleApply = async () => {
      if (!token) {
        navigate("/login");
        return;
      }
      if (!selectedOffer) return;
  
      if (!window.confirm(`Aplikować na: ${selectedOffer.title}?`)) return;
  
      try {
          const msg = await applicationService.applyForOffer(selectedOffer.id);
          alert("✅ " + msg);
      } catch (err: any) {
          alert("❌ Błąd: " + (err.message || "Nie udało się zaaplikować."));
      }
    };

    // --- LOGIKA PORÓWNYWANIA GODZIN ---
    const renderTimeMatching = () => {
        if (!selectedOffer?.workHoursStart || !selectedOffer?.workHoursEnd) {
            return (
                <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', border: '1px solid #bae6fd', marginBottom: '20px' }}>
                    <span style={{ fontWeight: 'bold', color: '#0284c7' }}>🕒 Godziny pracy: Elastyczne / Nie podano</span>
                </div>
            );
        }

        const offerStart = parseInt(selectedOffer.workHoursStart.replace(":", ""));
        const offerEnd = parseInt(selectedOffer.workHoursEnd.replace(":", ""));

        // Jeśli nie ma profilu lub dostępności, pokaż tylko wymagania
        if (!userProfile?.availability) {
            return (
                <div style={{ background: '#f3f4f6', padding: '15px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>🕒 Wymagane godziny:</div>
                    <div style={{ fontSize: '1.2rem', color: '#111' }}>{selectedOffer.workHoursStart} - {selectedOffer.workHoursEnd}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '5px' }}>Uzupełnij swój profil, aby zobaczyć dopasowanie.</div>
                </div>
            );
        }

        const schedule = JSON.parse(userProfile.availability);
        
        return (
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#1f2937' }}>
                    🕒 Dopasowanie godzin ({selectedOffer.workHoursStart} - {selectedOffer.workHoursEnd})
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                    {Object.entries(schedule).map(([day, val]: any) => {
                        if (!val.active) return null; // Pomiń dni nieaktywne

                        const studStart = parseInt(val.start.replace(":", ""));
                        const studEnd = parseInt(val.end.replace(":", ""));

                        // Logika dopasowania:
                        // 1. Idealne lub szersze: Student zaczyna wcześniej/równo I kończy później/równo
                        const isFullMatch = studStart <= offerStart && studEnd >= offerEnd;
                        
                        // 2. Częściowe: Jakikolwiek overlap
                        const isPartialMatch = (studStart < offerEnd) && (studEnd > offerStart);

                        let bg = "#fee2e2"; // Czerwony (brak pokrycia lub za mało)
                        let text = "#991b1b";
                        let icon = "⚠️";

                        if (isFullMatch) {
                            bg = "#dcfce7"; text = "#166534"; icon = "✅";
                        } else if (isPartialMatch) {
                            bg = "#fef9c3"; text = "#854d0e"; icon = "⚠️ Częściowo";
                        }

                        return (
                            <div key={day} style={{ background: bg, color: text, padding: '10px', borderRadius: '8px', fontSize: '0.85rem', border: `1px solid ${text}40` }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{day.substring(0, 3)}</div>
                                <div>{val.start} - {val.end}</div>
                                <div style={{ marginTop: '5px', fontWeight: 'bold' }}>{icon}</div>
                            </div>
                        );
                    })}
                </div>
                {/* Legenda/Info */}
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '10px', fontStyle: 'italic' }}>
                    Porównano Twoją dostępność z wymaganiami oferty.
                </div>
            </div>
        );
    };
  
    if (isLoading) return <div style={{padding: '40px', textAlign: 'center'}}>Ładowanie ofert...</div>;
    if (error) return <div style={{padding: '40px', textAlign: 'center', color: 'red'}}>{error}</div>;
  
    return (
      <div className="split-view">
        {/* Lewy panel: Lista ofert */}
        <div className="list-pane">
          {offers.length === 0 ? (
            <div className="p-5 text-center text-gray-500">Brak ofert pracy.</div>
          ) : (
            offers.map((offer) => (
              <div 
                key={offer.id} 
                className={`offer-item ${selectedOffer?.id === offer.id ? 'selected' : ''}`}
                onClick={() => setSelectedOffer(offer)}
              >
                <h3 className="offer-title">{offer.title}</h3>
                <p className="offer-company">{offer.company}</p>
                <div className="offer-meta">
                  {offer.location} • <span className="salary-text">{offer.salary}</span>
                </div>
                {/* Mały podgląd godzin na liście */}
                {offer.workHoursStart && (
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                        🕒 {offer.workHoursStart} - {offer.workHoursEnd}
                    </div>
                )}
              </div>
            ))
          )}
        </div>
  
        {/* Prawy panel: Szczegóły oferty */}
        <div className="details-pane">
          {selectedOffer ? (
            <div className="details-scroll-container">
              <header className="details-header">
                <h1>{selectedOffer.title}</h1>
                <div className="details-sub">
                  {selectedOffer.company} • {selectedOffer.location}
                  {selectedOffer.remoteWork && " • Zdalnie"}
                </div>
                <div className="salary-large">{selectedOffer.salary}</div>
                
                <div className="action-buttons">
                  <button className="btn btn-primary" onClick={handleApply}>Aplikuj teraz</button>
                  <button className="btn btn-secondary">Zapisz</button>
                </div>
              </header>
  
              <hr className="divider" />
  
              <article className="details-body">
                {/* --- SEKCJA DOPASOWANIA GODZIN --- */}
                {renderTimeMatching()}

                <h3>Opis stanowiska</h3>
                <p>{selectedOffer.description}</p>
                
                <h3>Wymagania</h3>
                <ul>
                  {selectedOffer.globalRequirements?.map((req) => (
                    <li key={`glob-${req.id}`}>{req.name}</li>
                  ))}
                  {selectedOffer.customRequirements?.map((req, idx) => (
                    <li key={`cust-${idx}`}>{req}</li>
                  ))}
                </ul>
  
                {selectedOffer.benefits && (
                  <>
                      <h3>Oferujemy</h3>
                      <p>{selectedOffer.benefits}</p>
                  </>
                )}
              </article>
            </div>
          ) : (
            <div className="empty-state">Wybierz ofertę z listy.</div>
          )}
        </div>
      </div>
    );
}