package com.work_for_students.review;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    // Wstrzykujemy TYLKO Serwis
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserReviews(@PathVariable Long userId) {
        try {
            Map<String, Object> result = reviewService.getReviewsForUser(userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Błąd pobierania opinii.");
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> payload) {
        // Wyciągamy email z tokena (Security Context)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        try {
            Long reviewedUserId = Long.valueOf(payload.get("reviewedUserId").toString());
            Integer rating = Integer.valueOf(payload.get("rating").toString());
            String comment = (String) payload.get("comment");

            // Przekazujemy do serwisu
            reviewService.addReview(email, reviewedUserId, rating, comment);

            return ResponseEntity.ok("Opinia dodana pomyślnie.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Błąd dodawania opinii: " + e.getMessage());
        }
    }
}