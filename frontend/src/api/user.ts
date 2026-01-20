// Upewnij się, że ten URL pasuje do Twojego backendu
const API_URL = "http://localhost:8080/users";

export interface UserProfile {
    id: number;
    email: string;
    role: "STUDENT" | "EMPLOYER";
    name?: string;
    surname?: string;
    company?: string;
    nip?: string;
    cvPath?: string; // Nowa nazwa pola (ścieżka do pliku)
    availability?: string; // JSON String z godzinami
}

export const userService = {
    // 1. Pobieranie zalogowanego użytkownika
    // Używamy endpointu /me, który dodaliśmy do UserController.
    // Jeśli z jakiegoś powodu go nie masz, przywróć starą logikę, ale zalecam /me.
    getCurrentUser: async (): Promise<UserProfile | null> => {
        const token = localStorage.getItem("userToken"); // Sprawdź czy klucz to "userToken" czy "token" (w poprzednich plikach było "token")
        if (!token) return null;

        try {
            const response = await fetch(`${API_URL}/me`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // Jeśli backend zwróci 404 lub 403, wyloguj lub zwróć null
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error("Błąd pobierania profilu:", error);
            return null;
        }
    },

    // 2. Aktualizacja profilu (Dane + Plik CV)
    updateUser: async (user: UserProfile, file?: File | null): Promise<void> => {
        const token = localStorage.getItem("userToken");
        
        // Używamy FormData, aby przesłać plik i JSON w jednym żądaniu
        const formData = new FormData();
        
        // Backend oczekuje części "user" jako JSON
        const userBlob = new Blob([JSON.stringify(user)], {
            type: 'application/json'
        });
        formData.append("user", userBlob);

        // Backend oczekuje części "file" (opcjonalnie)
        if (file) {
            formData.append("file", file);
        }

        const response = await fetch(`${API_URL}/update`, { 
            method: "PUT",
            headers: {
                // WAŻNE: Nie ustawiamy "Content-Type": "multipart/form-data" ręcznie!
                // Przeglądarka sama ustawi ten nagłówek wraz z boundary.
                "Authorization": `Bearer ${token}`
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Błąd aktualizacji profilu");
        }
    }
};