const API_URL = "http://localhost:8080/reviews";

export interface ReviewDto {
    id: number;
    rating: number; // 1-5
    comment: string;
    reviewerName: string;
    createdAt: string;
}

export interface ReviewsResponse {
    average: number;
    count: number;
    reviews: ReviewDto[];
}

export const reviewsService = {
    getUserReviews: async (userId: number): Promise<ReviewsResponse> => {
        const token = localStorage.getItem("userToken");
        const response = await fetch(`${API_URL}/user/${userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) return { average: 0, count: 0, reviews: [] };
        return response.json();
    },

    addReview: async (reviewedUserId: number, rating: number, comment: string) => {
        const token = localStorage.getItem("userToken");
        const response = await fetch(`${API_URL}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ reviewedUserId, rating, comment })
        });
        if (!response.ok) throw new Error("Błąd dodawania opinii");
    }
};