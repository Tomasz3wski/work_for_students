package com.work_for_students.offer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OfferRepository extends JpaRepository<Offer, Long> {
    Optional<Offer> findOfferById(Long id);
}
