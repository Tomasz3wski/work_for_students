package com.work_for_students.review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findAllByReviewedUserIdOrderByCreatedAtDesc(Long userId);
}