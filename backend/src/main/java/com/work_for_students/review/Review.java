package com.work_for_students.review;

import com.work_for_students.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int rating; // 1-5

    @Column(columnDefinition = "TEXT")
    private String comment;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Kto wystawił opinię
    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    // Kogo oceniono
    @ManyToOne
    @JoinColumn(name = "reviewed_user_id")
    private User reviewedUser;

    public Review(User reviewer, User reviewedUser, int rating, String comment) {
        this.reviewer = reviewer;
        this.reviewedUser = reviewedUser;
        this.rating = rating;
        this.comment = comment;
    }
}