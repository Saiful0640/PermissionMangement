import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

interface Permission {
  id: number;
  menuId: number;
  menuName: string | null;
  subMenu: string;
  link: string;
  active: boolean; // Changed from status (string) to active (boolean)
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
    MatCheckboxModule,
    MatSortModule,
    MatPaginatorModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule
  ],
  template: `
    <div class="permission-management-container">
      <h2>Manage Permissions</h2>
      <mat-form-field appearance="fill">
        <mat-label>Select Department</mat-label>
        <mat-select [(ngModel)]="selectedDepartmentId" (selectionChange)="fetchPermissions()">
          <mat-option *ngFor="let dept of departments" [value]="dept.id">{{ dept.name }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Select Designation</mat-label>
        <mat-select [(ngModel)]="selectedDesignationId" (selectionChange)="fetchPermissions()">
          <mat-option *ngFor="let des of designations" [value]="des.id">{{ des.name }}</mat-option>
        </mat-select>
      </mat-form-field>
      <button mat-raised-button color="primary" (click)="openAddDialog()">Add Permission</button>
      <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
      <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z8">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
          <td mat-cell *matCellDef="let permission">{{ permission.id }}</td>
        </ng-container>
        <ng-container matColumnDef="menuName">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Parent Menu</th>
          <td mat-cell *matCellDef="let permission">{{ permission.menuName || 'N/A' }}</td>
        </ng-container>
        <ng-container matColumnDef="subMenu">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Sub Menu</th>
          <td mat-cell *matCellDef="let permission">{{ permission.subMenu }}</td>
        </ng-container>
        <ng-container matColumnDef="link">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Link</th>
          <td mat-cell *matCellDef="let permission">{{ permission.link }}</td>
        </ng-container>
        <ng-container matColumnDef="active">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Active</th>
          <td mat-cell *matCellDef="let permission">
            <mat-checkbox [(ngModel)]="permission.active" (change)="updatePermission(permission)"></mat-checkbox>
          </td>
        </ng-container>
        <ng-container matColumnDef="canView">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Can View</th>
          <td mat-cell *matCellDef="let permission">
            <mat-checkbox [(ngModel)]="permission.canView" (change)="updatePermission(permission)"></mat-checkbox>
          </td>
        </ng-container>
        <ng-container matColumnDef="canCreate">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Can Create</th>
          <td mat-cell *matCellDef="let permission">
            <mat-checkbox [(ngModel)]="permission.canCreate" (change)="updatePermission(permission)"></mat-checkbox>
          </td>
        </ng-container>
        <ng-container matColumnDef="canEdit">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Can Edit</th>
          <td mat-cell *matCellDef="let permission">
            <mat-checkbox [(ngModel)]="permission.canEdit" (change)="updatePermission(permission)"></mat-checkbox>
          </td>
        </ng-container>
        <ng-container matColumnDef="canDelete">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Can Delete</th>
          <td mat-cell *matCellDef="let permission">
            <mat-checkbox [(ngModel)]="permission.canDelete" (change)="updatePermission(permission)"></mat-checkbox>
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let permission">
            <button mat-icon-button color="primary" (click)="openEditDialog(permission)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deletePermission(permission)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
    </div>
  `,
  styles: [`
    .permission-management-container {
      padding: 20px;
    }
    mat-form-field {
      margin-right: 20px;
    }
    button {
      margin-bottom: 20px;
    }
    .error-message {
      color: red;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
    }
  `]
})
export class PermissionManagementComponent implements OnInit {
  permissions: Permission[] = [];
  departments: Department[] = [];
  designations: Designation[] = [];
  selectedDepartmentId: number | null = null;
  selectedDesignationId: number | null = null;
  errorMessage: string | null = null;
  displayedColumns: string[] = [
    'id', 'menuName', 'subMenu', 'link', 'active',
    'canView', 'canCreate', 'canEdit', 'canDelete', 'actions'
  ];
  dataSource = new MatTableDataSource<Permission>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient, public dialog: MatDialog) {}

  ngOnInit() {
    this.loadDepartments();
    this.loadDesignations();
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadDepartments() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<Department[]>('http://localhost:8080/api/department', { headers }).subscribe({
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
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<Designation[]>('http://localhost:8080/api/designation', { headers }).subscribe({
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
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `http://localhost:8080/api/permission?departmentId=${this.selectedDepartmentId}&designationId=${this.selectedDesignationId}`;
    this.http.get<Permission[]>(url, { headers }).subscribe({
      next: (data) => {
        this.permissions = data;
        this.dataSource.data = data;
        this.errorMessage = data.length === 0 ? 'No permissions found' : null;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load permissions';
        console.error(err);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(PermissionDialogComponent, {
      width: '500px',
      data: {
        permission: {
          menuId: 0,
          menuName: null,
          subMenu: '',
          link: '',
          active: true,
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false,
          departmentId: this.selectedDepartmentId,
          designationId: this.selectedDesignationId
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addPermission(result);
      }
    });
  }

  openEditDialog(permission: Permission): void {
    const dialogRef = this.dialog.open(PermissionDialogComponent, {
      width: '500px',
      data: { permission: { ...permission } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updatePermission(result);
      }
    });
  }

  addPermission(permission: Permission): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post<Permission>('http://localhost:8080/api/permission', permission, { headers })
      .subscribe({
        next: (newPermission) => {
          this.dataSource.data = [...this.dataSource.data, newPermission];
        },
        error: (err) => {
          this.errorMessage = 'Failed to add permission';
          console.error(err);
        }
      });
  }

  updatePermission(permission: Permission) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.put<Permission>(`http://localhost:8080/api/permission/${permission.id}`, permission, { headers })
      .subscribe({
        next: (updatedPermission) => {
          const index = this.dataSource.data.findIndex(p => p.id === updatedPermission.id);
          if (index !== -1) {
            this.dataSource.data[index] = updatedPermission;
            this.dataSource.data = [...this.dataSource.data];
          }
        },
        error: (err) => {
          this.errorMessage = 'Failed to update permission';
          console.error(err);
        }
      });
  }

  deletePermission(permission: Permission): void {
    if (!confirm('Are you sure you want to delete this permission?')) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.delete(`http://localhost:8080/api/permission/${permission.id}`, { headers })
      .subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(p => p.id !== permission.id);
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete permission';
          console.error(err);
        }
      });
  }
}

@Component({
  selector: 'app-permission-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule
  ],
  template: `
    <h1 mat-dialog-title>{{ data.permission.id ? 'Edit Permission' : 'Add Permission' }}</h1>
    <div mat-dialog-content>
      <mat-form-field appearance="fill">
        <mat-label>Menu Name</mat-label>
        <input matInput [(ngModel)]="data.permission.menuName">
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Sub Menu</mat-label>
        <input matInput [(ngModel)]="data.permission.subMenu" required>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Link</mat-label>
        <input matInput [(ngModel)]="data.permission.link" required>
      </mat-form-field>
      <div class="checkbox-group">
        <mat-checkbox [(ngModel)]="data.permission.active">Active</mat-checkbox>
        <mat-checkbox [(ngModel)]="data.permission.canView">Can View</mat-checkbox>
        <mat-checkbox [(ngModel)]="data.permission.canCreate">Can Create</mat-checkbox>
        <mat-checkbox [(ngModel)]="data.permission.canEdit">Can Edit</mat-checkbox>
        <mat-checkbox [(ngModel)]="data.permission.canDelete">Can Delete</mat-checkbox>
      </div>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button [mat-dialog-close]="data.permission" [disabled]="!data.permission.subMenu || !data.permission.link">
        {{ data.permission.id ? 'Update' : 'Add' }}
      </button>
    </div>
  `,
  styles: [`
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 10px;
    }
  `]
})
export class PermissionDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { permission: Permission }) {}

  onCancel(): void {
    // No action needed as the dialog close will handle the cancellation
  }
}