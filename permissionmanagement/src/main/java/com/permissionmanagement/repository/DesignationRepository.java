package com.permissionmanagement.repository;

import com.permissionmanagement.Model.Designation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DesignationRepository extends JpaRepository<Designation, Long> {

    Designation findByName(String name);
}
