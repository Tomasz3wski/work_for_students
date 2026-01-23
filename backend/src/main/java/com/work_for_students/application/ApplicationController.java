package com.work_for_students.application;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    @Autowired
    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/apply/{offerId}")
    public ResponseEntity<String> applyForJob(@PathVariable Long offerId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            applicationService.applyForOffer(email, offerId);
            return ResponseEntity.ok("Aplikacja została wysłana!");
        } catch (IllegalStateException | SecurityException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<Application>> getMyApplications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(applicationService.getStudentApplications(email));
    }

    @GetMapping("/offer/{offerId}")
    public ResponseEntity<?> getApplicationsForOffer(@PathVariable Long offerId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            return ResponseEntity.ok(applicationService.getApplicationsForOffer(email, offerId));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }


    @PutMapping("/{appId}/status")
    public ResponseEntity<String> changeStatus(@PathVariable Long appId, @RequestParam ApplicationStatus status) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            applicationService.updateStatus(email, appId, status);
            return ResponseEntity.ok("Status zmieniony na: " + status);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @GetMapping("/{id}/cv")
    public ResponseEntity<Resource> downloadCandidateCv(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        try {
            Resource resource = applicationService.getCandidateCv(email, id);

            // Próbujemy ustalić typ pliku (PDF/DOC)
            String contentType = "application/octet-stream";
            try { contentType = resource.getURL().openConnection().getContentType(); } catch (Exception e) {}

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}