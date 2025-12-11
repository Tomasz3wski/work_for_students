import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_OFFERS } from "../data/mockData";
import type { JobOffer } from "../types";

export default function Home() {
  const navigate = useNavigate();
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(MOCK_OFFERS[0]);

  const handleApply = () => {
    if (!localStorage.getItem("userToken")) {
      navigate("/login");
    } else {
      alert(`Aplikowano na: ${selectedOffer?.title}`);
    }
  };

  return (
    <div className="split-view">
      {/* LEWY PANEL: Lista */}
      <div className="list-pane">
        {MOCK_OFFERS.map((offer) => (
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
        ))}
      </div>

      {/* PRAWY PANEL: Szczegóły */}
      <div className="details-pane">
        {selectedOffer ? (
          <div className="details-scroll-container">
            <header className="details-header">
              <h1>{selectedOffer.title}</h1>
              <div className="details-sub">
                {selectedOffer.company} • {selectedOffer.location}
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
                {selectedOffer.requirements.map((req, idx) => <li key={idx}>{req}</li>)}
              </ul>
              
              {/* Dodatkowy tekst by pokazać scrollowanie */}
              <h3>Oferujemy</h3>
              <p>Pracę w młodym zespole, owocowe czwartki i multisport. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.</p>
            </article>
          </div>
        ) : (
          <div className="empty-state">Wybierz ofertę z listy.</div>
        )}
      </div>
    </div>
  );
}