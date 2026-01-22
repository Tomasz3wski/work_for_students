package com.work_for_students.application;

import com.work_for_students.offer.Offer;
import com.work_for_students.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findAllByStudentEmail(String email);

    List<Application> findAllByOfferId(Long offerId);

    boolean existsByStudentAndOffer(User student, Offer offer);
}