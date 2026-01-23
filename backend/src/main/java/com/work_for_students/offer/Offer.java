package com.work_for_students.offer;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.work_for_students.application.Application;
import com.work_for_students.requirements.Requirement;
import com.work_for_students.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "offer_seq")
    @SequenceGenerator(name = "offer_seq", sequenceName = "offer_seq", allocationSize = 1)
    private Long id;

    private String title;
    private String company;
    private String location;
    private String salary;

    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(columnDefinition = "TEXT")
    private String benefits;

    private OfferType contractType;
    private Boolean remoteWork;

    // ...
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id")
    @JsonIgnoreProperties({"postedOffers", "applications", "password", "tokens", "availability", "hibernateLazyInitializer", "handler"})
    private User employer;

    @JsonIgnore
    @OneToMany(mappedBy = "offer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Application> applications;

    @ManyToMany
    @JoinTable(
            name = "offer_requirement",
            joinColumns = @JoinColumn(name = "offer_id"),
            inverseJoinColumns = @JoinColumn(name = "requirement_id")
    )
    private List<Requirement> globalRequirements;

    @ElementCollection
    private List<String> customRequirements;
    @Column(name = "work_hours_start")
    private String workHoursStart;

    @Column(name = "work_hours_end")
    private String workHoursEnd;

    public Offer(String salary, String description, String benefits, OfferType contractType, Boolean remoteWork, List<Requirement> globalRequirements, List<String> customRequirements, String location, String title, String company) {
        this.salary = salary;
        this.description = description;
        this.benefits = benefits;
        this.contractType = contractType;
        this.remoteWork = remoteWork;
        this.globalRequirements = globalRequirements;
        this.customRequirements = customRequirements;
        this.location = location;
        this.title = title;
        this.company = company;
    }
}
