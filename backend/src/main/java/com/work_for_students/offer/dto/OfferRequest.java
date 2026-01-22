package com.work_for_students.offer.dto;

import com.work_for_students.offer.OfferType;
import com.work_for_students.requirements.Requirement;
import com.work_for_students.user.User;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OfferRequest {
    String title;
    String location;
    String salary;
    String description;
    String benefits;
    OfferType contractType;
    Boolean remoteWork;
    List<Requirement> globalRequirements;
    List<String> customRequirements;
}
