import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

interface User {
  id: number;
  username: string;
  password: string;
  departmentId: number;
  designationId: number;
  role: string;
  departmentName?: string;
  designationName?: string;
}

interface Department {
  id: number;
  name: string;
}

interface Designation {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  menuId: number;
  menuName: string | null;
  subMenu: string;
  link: string;
  active: boolean;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  departmentId: number;
  designationId: number;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <div class="user-management-container">
      <h2>User Management</h2>
      <button mat-raised-button color="primary" (click)="openAddDialog()" *ngIf="permissions.canCreate">Add User</button>
      <mat-form-field appearance="fill">
        <mat-label>Filter</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Search users">
      </mat-form-field>
      <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z8">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
          <td mat-cell *matCellDef="let user">{{ user.id }}</td>
        </ng-container>
        <ng-container matColumnDef="username">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Username</th>
          <td mat-cell *matCellDef="let user">{{ user.username }}</td>
        </ng-container>
        <ng-container matColumnDef="departmentName">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
          <td mat-cell *matCellDef="let user">{{ user.departmentName }}</td>
        </ng-container>
        <ng-container matColumnDef="designationName">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Designation</th>
          <td mat-cell *matCellDef="let user">{{ user.designationName }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let user">
            <button mat-icon-button color="primary" (click)="openEditDialog(user)" *ngIf="permissions.canEdit">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteUser(user)" *ngIf="permissions.canDelete">
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
    .user-management-container {
      padding: 20px;
    }
    mat-form-field {
      margin-bottom: 20px;
    }
    table {
      width: 100%;
    }
    button {
      margin: 0 5px;
    }
  `]
})
export class UsersManagmentComponent implements OnInit {
  displayedColumns: string[] = ['id', 'username', 'departmentName', 'designationName', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  departments: Department[] = [];
  designations: Designation[] = [];
  permissions: Permission = {
    id: 0, menuId: 0, menuName: null, subMenu: "User", link: "", active: true,
    canView: false, canCreate: false, canEdit: false, canDelete: false,
    departmentId: 0, designationId: 0
  };

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient, public dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    this.loadDepartmentsAndDesignations();
    this.loadUserPermissions();
  }

  loadDepartmentsAndDesignations(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    Promise.all([
      this.http.get<Department[]>('http://localhost:8080/api/department', { headers }).toPromise(),
      this.http.get<Designation[]>('http://localhost:8080/api/designation', { headers }).toPromise()
    ]).then(([departments, designations]) => {
      this.departments = departments || [];
      this.designations = designations || [];
      this.fetchUsers();
    }).catch(err => {
      console.error('Error loading departments or designations:', err);
      if (err.status === 403) {
        this.logoutAndRedirect();
      }
    });
  }

  loadUserPermissions(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const departmentId = user.departmentId;
    const designationId = user.designationId;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<Permission[]>(`http://localhost:8080/api/permission?departmentId=${departmentId}&designationId=${designationId}`, { headers })
      .subscribe({
        next: (permissions) => {
          const userPermission = permissions.find(p => p.subMenu === "User") || this.permissions;
          this.permissions = userPermission;
        },
        error: (err) => {
          console.error('Error fetching user permissions:', err);
        }
      });
  }

  fetchUsers(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<User[]>('http://localhost:8080/api/users', { headers }).subscribe({
      next: (users) => {
        this.dataSource.data = users.map(user => ({
          ...user,
          departmentName: this.departments.find(d => d.id === user.departmentId)?.name || 'Unknown',
          designationName: this.designations.find(d => d.id === user.designationId)?.name || 'Unknown',
          role: user.role.startsWith('ROLE_') ? user.role.substring(5) : user.role
        }));
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        if (err.status === 403) {
          this.logoutAndRedirect();
        }
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
      data: { user: { username: '', password: '', departmentId: null, designationId: null, role: 'USER' } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addUser(result);
      }
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
      data: { user: { ...user, password: '' } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateUser(result);
      }
    });
  }

  addUser(user: User): void {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token);
    user.role = 'ROLE_' + user.role;
    console.log('User data being sent:', user);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post<User>('http://localhost:8080/api/users', user, { headers })
      .subscribe({
        next: (newUser) => {
          newUser.departmentName = this.departments.find(d => d.id === newUser.departmentId)?.name || 'Unknown';
          newUser.designationName = this.designations.find(d => d.id === newUser.designationId)?.name || 'Unknown';
          newUser.role = newUser.role.startsWith('ROLE_') ? newUser.role.substring(5) : newUser.role;
          this.dataSource.data = [...this.dataSource.data, newUser];
        },
        error: (err) => {
          console.error('Error adding user:', err);
          if (err.status === 403) {
            this.logoutAndRedirect();
          }
        }
      });
  }

  updateUser(user: User): void {
    const token = localStorage.getItem('token');
    console.log('Token being sent for Update:', token);
    user.role = 'ROLE_' + user.role;
    console.log('User data being sent for update:', user);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.put<User>(`http://localhost:8080/api/users/${user.id}`, user, { headers })
      .subscribe({
        next: (updatedUser) => {
          updatedUser.departmentName = this.departments.find(d => d.id === updatedUser.departmentId)?.name || 'Unknown';
          updatedUser.designationName = this.designations.find(d => d.id === updatedUser.designationId)?.name || 'Unknown';
          updatedUser.role = updatedUser.role.startsWith('ROLE_') ? updatedUser.role.substring(5) : updatedUser.role;
          const index = this.dataSource.data.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.dataSource.data[index] = updatedUser;
            this.dataSource.data = [...this.dataSource.data];
          }
        },
        error: (err) => {
          console.error('Error updating user:', err);
          if (err.status === 403) {
            this.logoutAndRedirect();
          }
        }
      });
  }

  deleteUser(user: User): void {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.delete(`http://localhost:8080/api/users/${user.id}`, { headers })
      .subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(u => u.id !== user.id);
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          if (err.status === 403) {
            this.logoutAndRedirect();
          }
        }
      });
  }

  logoutAndRedirect(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <h1 mat-dialog-title>{{ data.user.id ? 'Edit User' : 'Add User' }}</h1>
    <div mat-dialog-content>
      <mat-form-field appearance="fill">
        <mat-label>Username</mat-label>
        <input matInput [(ngModel)]="data.user.username" required>
      </mat-form-field>
      <mat-form-field appearance="fill" *ngIf="!data.user.id">
        <mat-label>Password</mat-label>
        <input matInput type="password" [(ngModel)]="data.user.password" required>
      </mat-form-field>
      <mat-form-field appearance="fill" *ngIf="data.user.id">
        <mat-label>New Password (optional)</mat-label>
        <input matInput type="password" [(ngModel)]="data.user.password">
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Department</mat-label>
        <mat-select [(ngModel)]="data.user.departmentId" required>
          <mat-option *ngFor="let dept of departments" [value]="dept.id">{{ dept.name }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Designation</mat-label>
        <mat-select [(ngModel)]="data.user.designationId" required>
          <mat-option *ngFor="let des of designations" [value]="des.id">{{ des.name }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Role</mat-label>
        <mat-select [(ngModel)]="data.user.role" required>
          <mat-option value="USER">User</mat-option>
          <mat-option value="ADMIN">Admin</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button [mat-dialog-close]="data.user" [disabled]="!isFormValid()">
        {{ data.user.id ? 'Update' : 'Add' }}
      </button>
    </div>
  `
})
export class UserDialogComponent {
  departments: Department[] = [];
  designations: Designation[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private http: HttpClient,
    private dialogRef: MatDialogRef<UserDialogComponent>
  ) {
    this.loadDepartmentsAndDesignations();
  }

  loadDepartmentsAndDesignations(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    Promise.all([
      this.http.get<Department[]>('http://localhost:8080/api/department', { headers }).toPromise(),
      this.http.get<Designation[]>('http://localhost:8080/api/designation', { headers }).toPromise()
    ]).then(([departments, designations]) => {
      this.departments = departments || [];
      this.designations = designations || [];
    }).catch(err => {
      console.error('Error loading departments or designations:', err);
    });
  }

  isFormValid(): boolean {
    if (this.data.user.id) {
      return !!this.data.user.username && !!this.data.user.departmentId && !!this.data.user.designationId && !!this.data.user.role;
    } else {
      return !!this.data.user.username && !!this.data.user.password && !!this.data.user.departmentId && !!this.data.user.designationId && !!this.data.user.role;
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}