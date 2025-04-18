package com.permissionmanagement.repository;

import com.permissionmanagement.Model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    /*@Query(value = "SELECT * FROM permissions WHERE department = :department AND designation = :designation", nativeQuery = true)
    List<Permission> findByDepartmentAndDesignation(@org.springframework.data.repository.query.Param("department") String department,
                                                    @org.springframework.data.repository.query.Param("designation") String designation);*/

    List<Permission>findByDepartmentIdAndDesignationId(Long departmentId, Long designationId);
}
