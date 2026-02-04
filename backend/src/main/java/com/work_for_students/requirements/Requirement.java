package com.work_for_students.requirements;

import com.work_for_students.offer.Offer;
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
public class Requirement {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "req_seq")
    @SequenceGenerator(name = "req_seq", sequenceName = "req_seq", allocationSize = 1)
    private Long id;

    private String name;

    public Requirement(String name) {
        this.name = name;
    }
}
