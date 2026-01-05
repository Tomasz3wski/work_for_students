import { type AuthCredentials } from "../types";

const API_URL = "http://localhost:8080/api/auth";

export interface RegisterData extends AuthCredentials {
	role: string;
	firstName?: string;
	lastName?: string;
	companyName?: string;
	nip?: string;
}

interface AuthResponse {
	token: string;
}

export const authService = {
	login: async (credentials: AuthCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Błąd logowania. Sprawdź dane.");
    }
		const token = await response.text(); 
		return { token }; 
	},

	// --- REJESTRACJA ---
	register: async (data: RegisterData): Promise<void> => {
		// @ts-ignore
		const { confirmPassword, ...requestData } = data;

		const response = await fetch(`${API_URL}/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestData),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Błąd rejestracji.");
		}
		return;
	},
};
