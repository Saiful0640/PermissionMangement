import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';

interface User {
  id: number;
  username: string;
  email: string;
  departmentId: number;
  designationId: number;
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
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UsersManagmentComponent implements OnInit {
  displayedColumns: string[] = ['id', 'username', 'email', 'departmentName', 'designationName', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  departments: Department[] = [];
  designations: Designation[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchUsers();
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
      },
      error: (err) => {
        console.error('Failed to load departments:', err);
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
      },
      error: (err) => {
        console.error('Failed to load designations:', err);
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
          designationName: this.designations.find(d => d.id === user.designationId)?.name || 'Unknown'
        }));
      },
      error: (err) => {
        console.error('Error fetching users:', err);
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
      data: { user: { username: '', email: '', departmentId: null, designationId: null } }
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
      data: { user: { ...user } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateUser(result);
      }
    });
  }

  addUser(user: User): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post<User>('http://localhost:8080/api/users', user, { headers })
      .subscribe({
        next: (newUser) => {
          newUser.departmentName = this.departments.find(d => d.id === newUser.departmentId)?.name || 'Unknown';
          newUser.designationName = this.designations.find(d => d.id === newUser.designationId)?.name || 'Unknown';
          this.dataSource.data = [...this.dataSource.data, newUser];
        },
        error: (err) => {
          console.error('Error adding user:', err);
        }
      });
  }

  updateUser(user: User): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.put<User>(`http://localhost:8080/api/users/${user.id}`, user, { headers })
      .subscribe({
        next: (updatedUser) => {
          updatedUser.departmentName = this.departments.find(d => d.id === updatedUser.departmentId)?.name || 'Unknown';
          updatedUser.designationName = this.designations.find(d => d.id === updatedUser.designationId)?.name || 'Unknown';
          const index = this.dataSource.data.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.dataSource.data[index] = updatedUser;
            this.dataSource.data = [...this.dataSource.data];
          }
        },
        error: (err) => {
          console.error('Error updating user:', err);
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
        }
      });
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
      <mat-form-field appearance="fill">
        <mat-label>Email</mat-label>
        <input matInput [(ngModel)]="data.user.email" required>
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
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button [mat-dialog-close]="data.user" [disabled]="!data.user.username || !data.user.email || !data.user.departmentId || !data.user.designationId">
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
    private http: HttpClient
  ) {
    this.loadDepartments();
    this.loadDesignations();
  }

  loadDepartments() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<Department[]>('http://localhost:8080/api/department', { headers }).subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: (err) => {
        console.error('Failed to load departments:', err);
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
      },
      error: (err) => {
        console.error('Failed to load designations:', err);
      }
    });
  }

  onCancel(): void {
    this.data.user = null;
  }
}