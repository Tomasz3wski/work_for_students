const API_URL = "http://localhost:8080/requirements"; 

export interface Requirement {
    id: number;
    name: string;
}

export const requirementsService = {
    getAll: async (): Promise<Requirement[]> => {
        const token = localStorage.getItem("userToken");
        const response = await fetch(API_URL, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) return [];
        return response.json();
    },

    // --- NOWA METODA ---
    add: async (name: string) => {
        const token = localStorage.getItem("userToken");
        const response = await fetch(`${API_URL}/add`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });

        if (!response.ok) {
            throw new Error("Nie udało się dodać wymagania.");
        }
        return response.json();
    }
};