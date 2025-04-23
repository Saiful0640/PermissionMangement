import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';


interface Permission {
  id: number;
  menuId: number;
  menuName: string | null;
  subMenu: string;
  link: string;
  status: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  departmentId: number;
  designationId: number;
}

interface Department {
  id: number;
  name: string;
}

interface Designation {
  id: number;
  name: string;
}

@Component({
  selector: 'app-permission-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule
  ],
  templateUrl: './permission-management.component.html',
  styleUrls: ['./permission-management.component.css']
})
export class PermissionManagementComponent implements OnInit {
  permissions: Permission[] = [];
  departments: Department[] = [];
  designations: Designation[] = [];
  selectedDepartmentId: number | null = null;
  selectedDesignationId: number | null = null;
  errorMessage: string | null = null;
  displayedColumns: string[] = [
    'id', 'menuName', 'subMenu', 'link', 'status',
    'canView', 'canCreate', 'canEdit', 'canDelete'
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDepartments();
    this.loadDesignations();
  }

  loadDepartments() {
    this.http.get<Department[]>('http://localhost:8080/api/department').subscribe({
      next: (data) => {
        this.departments = data;
        if (data.length > 0) {
          this.selectedDepartmentId = data[0].id;
          this.fetchPermissions();
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load departments';
        console.error(err);
      }
    });
  }

  loadDesignations() {
    this.http.get<Designation[]>('http://localhost:8080/api/designation').subscribe({
      next: (data) => {
        this.designations = data;
        if (data.length > 0) {
          this.selectedDesignationId = data[0].id;
          this.fetchPermissions();
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load designations';
        console.error(err);
      }
    });
  }

  fetchPermissions() {
    if (!this.selectedDepartmentId || !this.selectedDesignationId) return;
    const url = `http://localhost:8080/api/permission?departmentId=${this.selectedDepartmentId}&designationId=${this.selectedDesignationId}`;
    this.http.get<Permission[]>(url).subscribe({
      next: (data) => {
        this.permissions = data;
        this.errorMessage = data.length === 0 ? 'No permissions found' : null;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load permissions';
        console.error(err);
      }
    });
  }

  updatePermission(permission: Permission) {
    this.http.put(`http://localhost:8080/api/permission/${permission.id}`, permission).subscribe({
      next: () => console.log('Permission updated'),
      error: (err) => {
        this.errorMessage = 'Failed to update permission';
        console.error(err);
      }
    });
  }
}