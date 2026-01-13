import type { JobOffer } from "../types";

const API_URL = "http://localhost:8080/offers"; 

export const offersService = {
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
};