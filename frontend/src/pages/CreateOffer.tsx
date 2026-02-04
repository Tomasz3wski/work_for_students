import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import { requirementsService, type Requirement } from "../api/requirements";
// @ts-ignore
import { offersService } from "../api/offers";

export default function CreateOffer() {
    const navigate = useNavigate();
    
    // Podstawowe pola
    const [formData, setFormData] = useState({
        title: "",
        location: "",
        salary: "",
        description: "",
        benefits: "",
        contractType: "", // Puste na start, załadujemy z API
        remoteWork: false,
        // Nowe pola godzinowe
        workHoursStart: "",
        workHoursEnd: ""
    });

    // Dane z Backend
    const [availableGlobalReqs, setAvailableGlobalReqs] = useState<Requirement[]>([]);
    const [availableOfferTypes, setAvailableOfferTypes] = useState<string[]>([]);
    
    // Wybrane wymagania
    const [selectedGlobalIds, setSelectedGlobalIds] = useState<number[]>([]);
    const [customReqs, setCustomReqs] = useState<string[]>([]);
    const [tempCustomReq, setTempCustomReq] = useState("");

    const [loading, setLoading] = useState(false);

    // Inicjalizacja danych
    useEffect(() => {
        // 1. Pobierz wymagania
        requirementsService.getAll()
            .then(setAvailableGlobalReqs)
            .catch(err => console.error("Błąd wymagań:", err));

        // 2. Pobierz typy ofert (Enum)
        offersService.getOfferTypes()
            .then((types: string[]) => {
                setAvailableOfferTypes(types);
                // Ustaw domyślnie pierwszy typ, jeśli dostępny
                if (types.length > 0) {
                    setFormData(prev => ({ ...prev, contractType: types[0] }));
                }
            })
            .catch((err: any) => console.error("Błąd typów ofert:", err));
    }, []);

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // --- LOGIKA WYMAGAŃ ---
    const toggleGlobalReq = (id: number) => {
        setSelectedGlobalIds(prev => 
            prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
        );
    };

    const addCustomReq = (e: any) => {
        e.preventDefault();
        if (!tempCustomReq.trim()) return;
        if (customReqs.includes(tempCustomReq.trim())) {
            alert("To wymaganie jest już na liście.");
            return;
        }
        setCustomReqs([...customReqs, tempCustomReq.trim()]);
        setTempCustomReq("");
    };

    const removeCustomReq = (reqToRemove: string) => {
        setCustomReqs(prev => prev.filter(req => req !== reqToRemove));
    };

    // --- WYSYŁKA ---
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            globalRequirements: selectedGlobalIds.map(id => ({ id })), 
            customRequirements: customReqs
        };

        try {
            await offersService.createOffer(payload);
            alert("✅ Oferta została utworzona pomyślnie!");
            navigate("/");
        } catch (err: any) {
            alert("❌ Błąd: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        // GLÓWNY KONTENER: Fixed position naprawia problem ze scrollem i wychodzeniem poza ekran
        <div style={{ 
            position: 'fixed', 
            top: '64px', // Wysokość navbara
            left: 0, 
            right: 0, 
            bottom: 0, 
            overflowY: 'auto', // Kluczowe dla przewijania
            background: '#f3f4f6', 
            padding: '40px 20px',
            color: '#1f2937' // Ciemny tekst dla kontrastu
        }}>
            <div style={{ 
                maxWidth: '800px', 
                margin: '0 auto 80px auto', // Margines dolny żeby nie ucięło przycisków
                background: '#ffffff', 
                padding: '40px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', color: '#111827' }}>
                    Utwórz nową ofertę
                </h1>
                
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                    
                    {/* Tytuł */}
                    <div className="form-group">
                        <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151'}}>Stanowisko</label>
                        <input 
                            required 
                            name="title" 
                            value={formData.title} 
                            onChange={handleChange} 
                            placeholder="np. Junior Java Developer" 
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px', 
                                border: '1px solid #d1d5db', background: '#fff', color: '#000', fontSize: '1rem'
                            }} 
                        />
                    </div>

                    {/* Lokalizacja i Wynagrodzenie */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151'}}>Lokalizacja</label>
                            <input 
                                required 
                                name="location" 
                                value={formData.location} 
                                onChange={handleChange} 
                                placeholder="np. Kraków" 
                                style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#000'}} 
                            />
                        </div>
                        <div>
                            <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151'}}>Wynagrodzenie (PLN)</label>
                            <input 
                                required 
                                name="salary" 
                                value={formData.salary} 
                                onChange={handleChange} 
                                placeholder="np. 6000 - 8000" 
                                style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#000'}} 
                            />
                        </div>
                    </div>

                    {/* Typ umowy (Z API) i Zdalna */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'end' }}>
                        <div>
                            <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151'}}>Typ Umowy</label>
                            <select 
                                name="contractType" 
                                value={formData.contractType} 
                                onChange={handleChange} 
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '8px', 
                                    border: '1px solid #d1d5db', background: '#fff', color: '#000', cursor: 'pointer'
                                }}
                            >
                                {availableOfferTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ paddingBottom: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#374151' }}>
                                <input 
                                    type="checkbox" 
                                    name="remoteWork" 
                                    checked={formData.remoteWork} 
                                    onChange={handleChange} 
                                    style={{width: '20px', height: '20px', accentColor: '#2563eb'}} 
                                />
                                <span style={{fontWeight: '600'}}>Praca w pełni zdalna</span>
                            </label>
                        </div>
                    </div>

                    {/* NOWA SEKCJA: WYMAGANE GODZINY (WIDEŁKI) */}
                    <div>
                        <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151'}}>
                            Wymagane godziny pracy (Widełki)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type="time" 
                                    name="workHoursStart"
                                    value={formData.workHoursStart || ""} 
                                    onChange={handleChange} 
                                    style={{
                                        padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', 
                                        background: '#ffffff', color: '#000000', cursor: 'pointer', minWidth: '130px'
                                    }} 
                                />
                            </div>
                            <span style={{ fontWeight: 'bold', color: '#374151' }}>—</span>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type="time" 
                                    name="workHoursEnd"
                                    value={formData.workHoursEnd || ""} 
                                    onChange={handleChange} 
                                    style={{
                                        padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', 
                                        background: '#ffffff', color: '#000000', cursor: 'pointer', minWidth: '130px'
                                    }} 
                                />
                            </div>
                            <span style={{ fontSize: '0.85rem', color: '#6b7280', marginLeft: '10px' }}>
                                (Zostaw puste jeśli elastyczne)
                            </span>
                        </div>
                    </div>

                    {/* Opis */}
                    <div>
                        <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151'}}>Opis stanowiska</label>
                        <textarea 
                            required 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            rows={5} 
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px', 
                                border: '1px solid #d1d5db', fontFamily: 'inherit', background: '#fff', color: '#000'
                            }} 
                        />
                    </div>

                    {/* Benefity */}
                    <div>
                        <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151'}}>Benefity</label>
                        <input 
                            name="benefits" 
                            value={formData.benefits} 
                            onChange={handleChange} 
                            placeholder="np. Multisport, Opieka medyczna" 
                            style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#000'}} 
                        />
                    </div>

                    <hr style={{border: '0', borderTop: '1px solid #e5e7eb', margin: '20px 0'}} />

                    {/* --- WYMAGANIA GLOBALNE --- */}
                    <div>
                        <label style={{display: 'block', fontWeight: '600', marginBottom: '15px', color: '#374151'}}>
                            Wymagane technologie (Wybierz z listy)
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {availableGlobalReqs.length > 0 ? (
                                availableGlobalReqs.map(req => (
                                    <label key={req.id} style={{ 
                                        padding: '8px 16px', 
                                        borderRadius: '20px', 
                                        border: selectedGlobalIds.includes(req.id) ? '2px solid #2563eb' : '1px solid #d1d5db',
                                        background: selectedGlobalIds.includes(req.id) ? '#eff6ff' : 'white',
                                        color: selectedGlobalIds.includes(req.id) ? '#1e40af' : '#374151',
                                        cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s'
                                    }}>
                                        <input 
                                            type="checkbox" 
                                            style={{display: 'none'}} 
                                            checked={selectedGlobalIds.includes(req.id)}
                                            onChange={() => toggleGlobalReq(req.id)}
                                        />
                                        {req.name}
                                    </label>
                                ))
                            ) : (
                                <span style={{color: '#6b7280', fontStyle: 'italic'}}>
                                    Brak zdefiniowanych wymagań w bazie. Dodaj je w SQL.
                                </span>
                            )}
                        </div>
                    </div>

                    {/* --- WYMAGANIA CUSTOMOWE --- */}
                    <div>
                        <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151'}}>Wymagania dodatkowe</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                value={tempCustomReq} 
                                onChange={(e) => setTempCustomReq(e.target.value)} 
                                onKeyDown={(e) => { if(e.key === 'Enter') addCustomReq(e); }}
                                placeholder="Wpisz i kliknij Dodaj (np. Znajomość Scrum)" 
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px', 
                                    border: '1px solid #d1d5db', background: '#fff', color: '#000'
                                }} 
                            />
                            <button 
                                onClick={addCustomReq} 
                                type="button"
                                style={{
                                    background: '#4b5563', color: 'white', padding: '0 25px', 
                                    borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600'
                                }}
                            >
                                Dodaj
                            </button>
                        </div>
                        
                        {/* Lista dodanych customów */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
                            {customReqs.map((req, idx) => (
                                <span key={idx} style={{ 
                                    background: '#e0f2fe', color: '#0369a1', padding: '8px 16px', borderRadius: '20px', 
                                    fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px',
                                    border: '1px solid #bae6fd'
                                }}>
                                    {req}
                                    <button 
                                        type="button"
                                        onClick={() => removeCustomReq(req)}
                                        style={{ 
                                            background: 'transparent', border: 'none', color: '#0369a1', 
                                            cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', lineHeight: 0,
                                            marginLeft: '4px'
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                        <button type="button" onClick={() => navigate("/")} style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                            Anuluj
                        </button>
                        <button disabled={loading} type="submit" style={{ flex: 2, padding: '14px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1, fontSize: '1rem' }}>
                            {loading ? "Wysyłanie..." : "Opublikuj Ofertę"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}