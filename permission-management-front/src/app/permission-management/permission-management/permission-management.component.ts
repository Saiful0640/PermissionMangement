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
    MatCheckboxModule,
    CommonModule,
    MatIconModule,
    MatPaginator
  ],
  templateUrl: './permission-management.component.html',
  styleUrls: ['./permission-management.component.css']
})
// export class PermissionManagementComponent implements OnInit {
//   permissions: Permission[] = [];
//   departments: Department[] = [];
//   designations: Designation[] = [];
//   selectedDepartmentId: number | null = null;
//   selectedDesignationId: number | null = null;
//   errorMessage: string | null = null;
//   displayedColumns: string[] = [
//     'id', 'menuName', 'subMenu', 'link', 'status',
//     'canView', 'canCreate', 'canEdit', 'canDelete'
//   ];

//   dataSource = new MatTableDataSource<Permission>([]);
//   @ViewChild(MatSort) sort!: MatSort;
//   @ViewChild(MatPaginator) paginator!: MatPaginator;

//   constructor(private http: HttpClient, public dialog: MatDialog) {}

//   ngOnInit() {
//     this.loadDepartments();
//     this.loadDesignations();
//     this.dataSource.sort=this.sort;
//     this.dataSource.paginator=this.paginator;
//   }

//   loadDepartments() {
//     const token =localStorage.getItem('token');
//     const headers = new HttpHeaders({'Authorization':`Bearer${token}`});

//     this.http.get<Department[]>('http://localhost:8080/api/department').subscribe({
//       next: (data) => {
//         this.departments = data;
//         if (data.length > 0) {
//           this.selectedDepartmentId = data[0].id;
//           this.fetchPermissions();
//         }
//       },
//       error: (err) => {
//         this.errorMessage = 'Failed to load departments';
//         console.error(err);
//       }
//     });
//   }

//   loadDesignations() {
//     this.http.get<Designation[]>('http://localhost:8080/api/designation').subscribe({
//       next: (data) => {
//         this.designations = data;
//         if (data.length > 0) {
//           this.selectedDesignationId = data[0].id;
//           this.fetchPermissions();
//         }
//       },
//       error: (err) => {
//         this.errorMessage = 'Failed to load designations';
//         console.error(err);
//       }
//     });
//   }

//   fetchPermissions() {
//     if (!this.selectedDepartmentId || !this.selectedDesignationId) return;
//     const url = `http://localhost:8080/api/permission?departmentId=${this.selectedDepartmentId}&designationId=${this.selectedDesignationId}`;
//     this.http.get<Permission[]>(url).subscribe({
//       next: (data) => {
//         this.permissions = data;
//         this.errorMessage = data.length === 0 ? 'No permissions found' : null;
//       },
//       error: (err) => {
//         this.errorMessage = 'Failed to load permissions';
//         console.error(err);
//       }
//     });
//   }

//   updatePermission(permission: Permission) {
//     this.http.put(`http://localhost:8080/api/permission/${permission.id}`, permission).subscribe({
//       next: () => console.log('Permission updated'),
//       error: (err) => {
//         this.errorMessage = 'Failed to update permission';
//         console.error(err);
//       }
//     });
//   }
// }


export class PermissionManagementComponent implements OnInit {
  permissions: Permission[] = [];
  departments: Department[] = [];
  designations: Designation[] = [];
  selectedDepartmentId: number | null = null;
  selectedDesignationId: number | null = null;
  errorMessage: string | null = null;
  displayedColumns: string[] = [
    'id', 'menuName', 'subMenu', 'link', 'status',
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
          status: 'active',
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
    CommonModule,
    MatIconModule,
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
      <mat-form-field appearance="fill">
        <mat-label>Status</mat-label>
        <input matInput [(ngModel)]="data.permission.status" required>
      </mat-form-field>
      <div class="checkbox-group">
        <mat-checkbox [(ngModel)]="data.permission.canView">Can View</mat-checkbox>
        <mat-checkbox [(ngModel)]="data.permission.canCreate">Can Create</mat-checkbox>
        <mat-checkbox [(ngModel)]="data.permission.canEdit">Can Edit</mat-checkbox>
        <mat-checkbox [(ngModel)]="data.permission.canDelete">Can Delete</mat-checkbox>
      </div>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button [mat-dialog-close]="data.permission" [disabled]="!data.permission.subMenu || !data.permission.link || !data.permission.status">
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