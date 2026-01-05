import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import { offersService } from "../api/offers";
import type { JobOffer } from "../types";

export default function Home() {
  const navigate = useNavigate();
  
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await offersService.getAllOffers();
        setOffers(data);
        
        if (data.length > 0) {
          setSelectedOffer(data[0]);
        }
      } catch (err) {
        setError("Błąd pobierania ofert. Upewnij się, że backend działa.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApply = () => {
    if (!localStorage.getItem("userToken")) {
      navigate("/login");
    } else {
      alert(`Aplikowano na: ${selectedOffer?.title}`);
    }
  };

  if (isLoading) return <div style={{padding: '40px', textAlign: 'center'}}>Ładowanie ofert...</div>;
  if (error) return <div style={{padding: '40px', textAlign: 'center', color: 'red'}}>{error}</div>;

  return (
    <div className="split-view">
      {/* LEWY PANEL: Lista z API */}
      <div className="list-pane">
        {offers.length === 0 ? (
          <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>Brak ofert pracy.</div>
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
            </div>
          ))
        )}
      </div>

      {/* PRAWY PANEL: Szczegóły */}
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
              <h3>Opis stanowiska</h3>
              <p>{selectedOffer.description}</p>
              
              <h3>Wymagania</h3>
              <ul>
                {/* Łączenie wymagań globalnych (obiektów) i customowych (stringów) */}
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