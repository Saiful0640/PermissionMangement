package com.permissionmanagement.service.Iservice;

import com.permissionmanagement.Model.Designation;

import java.util.List;

public interface IDesignationService {
    public List<Designation> getAllDesignation();
    public Designation saveDesignation(Designation designation);
}
