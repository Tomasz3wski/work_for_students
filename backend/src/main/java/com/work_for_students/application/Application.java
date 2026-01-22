package com.work_for_students.application;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.work_for_students.offer.Offer;
import com.work_for_students.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
@Getter
@Setter
@NoArgsConstructor
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "application_seq")
    @SequenceGenerator(name = "application_seq", sequenceName = "application_seq", allocationSize = 1)
    private Long id;

    @CreationTimestamp
    private LocalDateTime appliedAt;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    @JsonIgnoreProperties({"applications", "postedOffers", "password", "tokens"})
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id")
    @JsonIgnoreProperties({"applications", "employer", "requirements"})
    private Offer offer;


    public Application(User student, Offer offer) {
        this.appliedAt = LocalDateTime.now();
        this.status = ApplicationStatus.NEW;
        this.student = student;
        this.offer = offer;
    }
}
