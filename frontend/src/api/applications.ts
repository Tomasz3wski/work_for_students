// Zmieniamy adres bazowy na właściwy dla ApplicationController
const API_URL = "http://localhost:8080/applications"; 

export type ApplicationStatus = "NEW" | "VIEWED" | "SEEN"| "ACCEPTED" | "REJECTED";

export interface JobApplication {
    id: number;
    appliedAt: string;
    status: ApplicationStatus;
    student: {
        id: number;
        name: string;
        surname: string;
        email: string;
        cvPath?: string;
        availability?: string;
    };
    offer: {
        id: number;
        title: string;
        company: string;
        location: string;
    };
}

export const applicationService = {

    getApplicantCv: async (applicationId: number): Promise<Blob> => {
        const token = localStorage.getItem("userToken");
        const response = await fetch(`${API_URL}/${applicationId}/cv`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Nie udało się pobrać CV (brak pliku lub uprawnień).");
        return response.blob();
    },
    // 1. Aplikuj na ofertę
    // POST http://localhost:8080/applications/apply/{id}
    applyForOffer: async (offerId: number) => {
        const token = localStorage.getItem("userToken");
        
        // Ważne: używamy API_URL zdefiniowanego wyżej (końcówka /applications)
        const response = await fetch(`${API_URL}/apply/${offerId}`, {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${token}`,
                // Przy POST bez body (tylko parametry w URL) Content-Type nie jest wymagany, ale nie zaszkodzi
            }
        });

        if (!response.ok) {
            const txt = await response.text();
            // Obsługa typowych błędów HTTP
            if (response.status === 403) throw new Error("Brak uprawnień lub błąd autoryzacji.");
            if (response.status === 400) throw new Error(txt || "Nieprawidłowe żądanie.");
            throw new Error(txt || "Błąd podczas aplikowania.");
        }
        return response.text();
    },

    // 2. Moje aplikacje (dla Studenta)
    // GET http://localhost:8080/applications/my
    getMyApplications: async (): Promise<JobApplication[]> => {
        const token = localStorage.getItem("userToken");
        const response = await fetch(`${API_URL}/my`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Błąd pobierania aplikacji");
        return response.json();
    },

    // 3. Aplikacje na ofertę (dla Pracodawcy)
    // GET http://localhost:8080/applications/offer/{id}
    getApplicationsForOffer: async (offerId: number): Promise<JobApplication[]> => {
        const token = localStorage.getItem("userToken");
        const response = await fetch(`${API_URL}/offer/${offerId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Brak dostępu lub błąd");
        return response.json();
    },

    // 4. Zmiana statusu (dla Pracodawcy)
    // PUT http://localhost:8080/applications/{id}/status
    changeStatus: async (appId: number, status: ApplicationStatus) => {
        const token = localStorage.getItem("userToken");
        const response = await fetch(`${API_URL}/${appId}/status?status=${status}`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Nie udało się zmienić statusu");
    }
};

