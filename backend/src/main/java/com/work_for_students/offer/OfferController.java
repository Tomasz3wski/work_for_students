package com.work_for_students.offer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
