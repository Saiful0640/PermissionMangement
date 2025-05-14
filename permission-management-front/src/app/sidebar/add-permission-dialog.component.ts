import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

interface PermissionDTO {
  id: number;
  menuId: number;
  menuName: string | null;
  subMenu: string | null;
  link: string | null;
  active: boolean;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  departmentId: number | null;
  designationId: number | null;
  role: string | null;
  userId: number | null;
}

interface Menu {
  id: number;
  menuName: string;
  subMenu: string | null;
  link: string | null;
  parentMenu: Menu | null;
}

interface Department {
  id: number;
  name: string;
}

interface Designation {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
}

@Component({
  selector: 'app-add-permission-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    FormsModule,
    MatCheckboxModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Add New Permission</h2>
    <mat-dialog-content>
      <form #addPermissionForm="ngForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill">
          <mat-label>Select Menu</mat-label>
          <mat-select [(ngModel)]="newPermission.menuId" name="menuId" required>
            <mat-option *ngIf="data.menus.length === 0" [value]="null" disabled>
              No menus available
            </mat-option>
            <mat-option *ngFor="let menu of data.menus" [value]="menu.id">
              {{ menu.menuName }} {{ menu.subMenu ? ' > ' + menu.subMenu : '' }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Select Department</mat-label>
          <mat-select [(ngModel)]="newPermission.departmentId" name="departmentId">
            <mat-option [value]="null">None</mat-option>
            <mat-option *ngFor="let dept of departments" [value]="dept.id">
              {{ dept.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Select Designation</mat-label>
          <mat-select [(ngModel)]="newPermission.designationId" name="designationId">
            <mat-option [value]="null">None</mat-option>
            <mat-option *ngFor="let des of designations" [value]="des.id">
              {{ des.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Select Role</mat-label>
          <mat-select [(ngModel)]="newPermission.role" name="role">
            <mat-option [value]="null">None</mat-option>
            <mat-option *ngFor="let role of roles" [value]="role">
              {{ role }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Select User</mat-label>
          <mat-select [(ngModel)]="newPermission.userId" name="userId">
            <mat-option [value]="null">None</mat-option>
            <mat-option *ngFor="let user of users" [value]="user.id">
              {{ user.username }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <div style="margin-bottom: 10px;">
          <mat-checkbox [(ngModel)]="newPermission.canView" name="canView">
            Allow Viewing
          </mat-checkbox>
        </div>
        <div style="margin-bottom: 10px;">
          <mat-checkbox [(ngModel)]="newPermission.canCreate" name="canCreate">
            Allow Creating
          </mat-checkbox>
        </div>
        <div style="margin-bottom: 10px;">
          <mat-checkbox [(ngModel)]="newPermission.canEdit" name="canEdit">
            Allow Editing
          </mat-checkbox>
        </div>
        <div style="margin-bottom: 10px;">
          <mat-checkbox [(ngModel)]="newPermission.canDelete" name="canDelete">
            Allow Deleting
          </mat-checkbox>
        </div>
        <mat-dialog-actions>
          <button mat-button mat-dialog-close>Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="!addPermissionForm.valid">Add</button>
        </mat-dialog-actions>
      </form>
    </mat-dialog-content>
  `
})
export class AddPermissionDialogComponent implements OnInit {
  newPermission: PermissionDTO = {
    id: 0,
    menuId: 0,
    menuName: null,
    subMenu: null,
    link: null,
    active: true,
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    departmentId: null,
    designationId: null,
    role: null,
    userId: null
  };

  departments: Department[] = [];
  designations: Designation[] = [];
  roles: string[] = [];
  users: User[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddPermissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { menus: Menu[] },
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchDepartments();
    this.fetchDesignations();
    this.fetchRoles();
    this.fetchUsers();
  }

  fetchDepartments(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<Department[]>('http://localhost:8080/api/department', { headers })
      .subscribe({
        next: (departments) => {
          this.departments = departments;
          console.log('Departments fetched successfully:', this.departments);
        },
        error: (err) => {
          console.error('Error fetching departments:', err.status, err.statusText, err.error);
        }
      });
  }

  fetchDesignations(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<Designation[]>('http://localhost:8080/api/designation', { headers })
      .subscribe({
        next: (designations) => {
          this.designations = designations;
          console.log('Designations fetched successfully:', this.designations);
        },
        error: (err) => {
          console.error('Error fetching designations:', err.status, err.statusText, err.error);
        }
      });
  }

  fetchRoles(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<string[]>('http://localhost:8080/api/role', { headers })
      .subscribe({
        next: (roles) => {
          this.roles = roles;
          console.log('Roles fetched successfully:', this.roles);
        },
        error: (err) => {
          console.error('Error fetching roles:', err.status, err.statusText, err.error);
        }
      });
  }

  fetchUsers(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<User[]>('http://localhost:8080/api/user', { headers })
      .subscribe({
        next: (users) => {
          this.users = users;
          console.log('Users fetched successfully:', this.users);
        },
        error: (err) => {
          console.error('Error fetching users:', err.status, err.statusText, err.error);
        }
      });
  }

  onSubmit(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post<PermissionDTO>('http://localhost:8080/api/permission', this.newPermission, { headers })
      .subscribe({
        next: (response) => {
          console.log('Permission added successfully:', response);
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error adding permission:', err.status, err.statusText, err.error);
          this.dialogRef.close(false);
        }
      });
  }
}