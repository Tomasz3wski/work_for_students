package com.work_for_students.offer;

import com.work_for_students.offer.dto.OfferRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/offers")
public class OfferController {

    private final OfferService offerService;

    @Autowired
    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @GetMapping("/get")
    public List<Offer> getAll() {
        return offerService.getAll();
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return offerService.getById(id);
    }
    @PostMapping("/add")
    public ResponseEntity<?> createOffer(@RequestBody OfferRequest request, Authentication authentication) {
        return offerService.saveNewOffer(request, authentication.getName());
    }
}
