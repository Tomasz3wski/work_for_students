package com.work_for_students.offer;

import com.work_for_students.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OfferRepository extends JpaRepository<Offer, Long> {
    Optional<Offer> findOfferById(Long id);
    List<Offer> findAllByEmployer(User employer);
}
