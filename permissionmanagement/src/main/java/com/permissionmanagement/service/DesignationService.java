package com.permissionmanagement.service;

import com.permissionmanagement.Model.Designation;
import com.permissionmanagement.repository.DesignationRepository;
import com.permissionmanagement.service.Iservice.IDesignationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DesignationService implements IDesignationService {

    @Autowired
    DesignationRepository designationRepository;
    public List<Designation> getAllDesignation(){
        return designationRepository.findAll();
    }
    public Designation saveDesignation(Designation designation){
        return designationRepository.save(designation);
    }
}
