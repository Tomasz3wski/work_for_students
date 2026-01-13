const API_URL = "http://localhost:8080/users";

export interface UserProfile {
    id: number;
    email: string;
    role: "STUDENT" | "EMPLOYER";
    name?: string;
    surname?: string;
    company?: string;
    nip?: string;
}

export const userService = {
    // Pobieramy wszystkich i filtrujemy, bo backend nie ma endpointu /me
    getCurrentUser: async (): Promise<UserProfile | null> => {
        const token = localStorage.getItem("userToken");
        if (!token) return null;

        try {
            // Dekodowanie payloadu JWT "na piechotę"
            const payloadBase64 = token.split('.')[1];
            const decodedJson = atob(payloadBase64);
            const payload = JSON.parse(decodedJson);
            const userEmail = payload.sub; // Zakładam, że email jest w 'sub'

            const response = await fetch(`${API_URL}/get`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error("Nie udało się pobrać użytkowników");

            const users: UserProfile[] = await response.json();
            // Szukamy zalogowanego użytkownika
            return users.find(u => u.email === userEmail) || null;
        } catch (error) {
            console.error("Błąd pobierania profilu:", error);
            return null;
        }
    },

    updateUser: async (user: UserProfile): Promise<void> => {
        const token = localStorage.getItem("userToken");
        const response = await fetch(`${API_URL}/update`, { 
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(user),
        });

        if (!response.ok) {
            throw new Error("Backend nie obsługuje edycji (brak endpointu PUT /users/update)");
        }
    }
};