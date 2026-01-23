import type { JobOffer } from "../types";

const API_URL = "http://localhost:8080/offers"; 

export const offersService = {
  // 1. Pobieranie wszystkich ofert (Dla studenta/gościa)
  getAllOffers: async (): Promise<JobOffer[]> => {
    const token = localStorage.getItem("userToken");
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/get`, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("Brak dostępu - zaloguj się.");
      }
      throw new Error("Nie udało się pobrać ofert pracy.");
    }

    return response.json();
  },

  // 2. Pobieranie ofert TYLKO zalogowanego pracodawcy
  getMyOffers: async (): Promise<JobOffer[]> => {
    const token = localStorage.getItem("userToken");

    if (!token) {
        throw new Error("Musisz być zalogowany, aby zobaczyć swoje oferty.");
    }

    const response = await fetch(`${API_URL}/my`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Błąd pobierania twoich ofert.");
    }
    return response.json();
  },

  // 3. Tworzenie nowej oferty
  createOffer: async (offerData: any) => {
      const token = localStorage.getItem("userToken");
      const response = await fetch(`${API_URL}/add`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(offerData)
      });

      if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Nie udało się utworzyć oferty.");
      }
      return response.text();
  },

  // 4. Pobieranie typów ofert (ENUM z backendu) - NOWE
  getOfferTypes: async (): Promise<string[]> => {
      const token = localStorage.getItem("userToken");
      const headers: HeadersInit = {
          "Content-Type": "application/json"
      };
      
      // Dodajemy token na wypadek, gdyby endpoint był zabezpieczony
      if (token) {
          headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/types`, {
          method: "GET",
          headers: headers
      });

      if (!response.ok) {
          throw new Error("Nie udało się pobrać typów ofert.");
      }
      return response.json();
  }
};