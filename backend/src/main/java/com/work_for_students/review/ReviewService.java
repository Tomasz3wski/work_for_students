package com.work_for_students.review;

import com.work_for_students.user.User;
import com.work_for_students.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    // Logika pobierania i obliczania statystyk
    public Map<String, Object> getReviewsForUser(Long userId) {
        List<Review> reviews = reviewRepository.findAllByReviewedUserIdOrderByCreatedAtDesc(userId);

        // Oblicz średnią
        double average = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        // Mapowanie encji na prosty obiekt (DTO)
        List<Map<String, Object>> reviewsDto = reviews.stream().map(r -> Map.<String, Object>of(
                "id", r.getId(),
                "rating", r.getRating(),
                "comment", r.getComment(),
                "reviewerName", r.getReviewer().getCompany() != null ? r.getReviewer().getCompany() : r.getReviewer().getName() + " " + r.getReviewer().getSurname(),
                "createdAt", r.getCreatedAt().toString()
        )).collect(Collectors.toList());

        return Map.of(
                "average", average,
                "count", reviews.size(),
                "reviews", reviewsDto
        );
    }

    // Logika dodawania opinii
    @Transactional
    public void addReview(String reviewerEmail, Long reviewedUserId, Integer rating, String comment) {
        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new EntityNotFoundException("Recenzent nie istnieje"));

        User reviewedUser = userRepository.findById(reviewedUserId)
                .orElseThrow(() -> new EntityNotFoundException("Oceniany użytkownik nie istnieje"));

        // Tu można dodać walidację, np. czy rating jest między 1 a 5
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Ocena musi być w skali 1-5");
        }

        Review review = new Review(reviewer, reviewedUser, rating, comment);
        reviewRepository.save(review);
    }
}