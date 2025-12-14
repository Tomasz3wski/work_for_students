package com.work_for_students.offer;

import com.work_for_students.requirements.Requirement;
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
    private String location;
    private String salary;

    @Lob
    private String description;
    @Lob
    private String benefits;

    private OfferType contractType;
    private Boolean remoteWork;

    @ManyToMany
    @JoinTable(
            name = "offer_requirement",
            joinColumns = @JoinColumn(name = "offer_id"),
            inverseJoinColumns = @JoinColumn(name = "requirement_id")
    )
    private List<Requirement> globalRequirements;

    @ElementCollection
    private List<String> customRequirements;


    public Offer(String salary, String description, String benefits, OfferType contractType, Boolean remoteWork, List<Requirement> globalRequirements, List<String> customRequirements, String location, String title) {
        this.salary = salary;
        this.description = description;
        this.benefits = benefits;
        this.contractType = contractType;
        this.remoteWork = remoteWork;
        this.globalRequirements = globalRequirements;
        this.customRequirements = customRequirements;
        this.location = location;
        this.title = title;
    }
}
