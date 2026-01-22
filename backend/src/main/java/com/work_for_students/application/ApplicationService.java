package com.work_for_students.application;

import com.work_for_students.offer.Offer;
import com.work_for_students.offer.OfferRepository;
import com.work_for_students.user.User;
import com.work_for_students.user.UserRepository;
import com.work_for_students.user.UserRole;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final OfferRepository offerRepository;

    @Autowired
    public ApplicationService(ApplicationRepository applicationRepository, UserRepository userRepository, OfferRepository offerRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.offerRepository = offerRepository;
    }

    public void applyForOffer(String studentEmail, Long offerId) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new EntityNotFoundException("Student nie znaleziony"));

        if (student.getRole() != UserRole.STUDENT) {
            throw new IllegalStateException("Tylko studenci mogą aplikować na oferty.");
        }

        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new EntityNotFoundException("Oferta nie istnieje"));

        if (applicationRepository.existsByStudentAndOffer(student, offer)) {
            throw new IllegalStateException("Już aplikowałeś na tę ofertę.");
        }

        Application application = new Application(student, offer);
        applicationRepository.save(application);
    }

    @Transactional
    public List<Application> getStudentApplications(String studentEmail) {
        return applicationRepository.findAllByStudentEmail(studentEmail);
    }

    @Transactional
    public List<Application> getApplicationsForOffer(String employerEmail, Long offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new EntityNotFoundException("Oferta nie istnieje"));

        if (!offer.getEmployer().getEmail().equals(employerEmail)) {
            throw new SecurityException("Nie masz uprawnień do przeglądania aplikacji tej oferty.");
        }

        return applicationRepository.findAllByOfferId(offerId);
    }

    @Transactional
    public void updateStatus(String employerEmail, Long applicationId, ApplicationStatus status) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Aplikacja nie znaleziona"));

        if (!app.getOffer().getEmployer().getEmail().equals(employerEmail)) {
            throw new SecurityException("To nie jest Twoja oferta.");
        }

        app.setStatus(status);
        applicationRepository.save(app);
    }

    @Transactional
    public Resource getCandidateCv(String employerEmail, Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Aplikacja nie znaleziona"));

        // Sprawdzenie uprawnień (czy to oferta tego pracodawcy)
        if (!app.getOffer().getEmployer().getEmail().equals(employerEmail)) {
            throw new SecurityException("Brak dostępu do tego kandydata.");
        }

        // Zmiana statusu na SEEN (jeśli była NEW)
        if (app.getStatus() == ApplicationStatus.NEW) {
            app.setStatus(ApplicationStatus.VIEWED);
            applicationRepository.save(app);
        }

        // Logika pobierania pliku (taka sama jak w UserService)
        String cvPath = app.getStudent().getCvPath();
        if (cvPath == null || cvPath.isEmpty()) {
            throw new EntityNotFoundException("Kandydat nie posiada CV.");
        }

        try {
            Path filePath = Paths.get(cvPath);
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new EntityNotFoundException("Plik CV nie istnieje na serwerze.");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Błąd odczytu pliku: " + e.getMessage());
        }
    }
}