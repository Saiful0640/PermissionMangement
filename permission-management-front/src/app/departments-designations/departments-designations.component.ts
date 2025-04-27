import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

interface Department {
  id: number;
  name: string;
}

interface Designation {
  id: number;
  name: string;
}

@Component({
  selector: 'app-departments-designations',
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
    MatIconModule
  ],
  templateUrl: './departments-designations.component.html',
  styleUrls: ['./departments-designations.component.css']
})
export class DepartmentsDesignationsComponent implements OnInit {
  departmentColumns: string[] = ['id', 'name', 'actions'];
  designationColumns: string[] = ['id', 'name', 'actions'];
  departmentDataSource = new MatTableDataSource<Department>([]);
  designationDataSource = new MatTableDataSource<Designation>([]);

  @ViewChild('departmentSort') departmentSort!: MatSort;
  @ViewChild('departmentPaginator') departmentPaginator!: MatPaginator;
  @ViewChild('designationSort') designationSort!: MatSort;
  @ViewChild('designationPaginator') designationPaginator!: MatPaginator;

  constructor(private http: HttpClient, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchDepartments();
    this.fetchDesignations();
    this.departmentDataSource.sort = this.departmentSort;
    this.departmentDataSource.paginator = this.departmentPaginator;
    this.designationDataSource.sort = this.designationSort;
    this.designationDataSource.paginator = this.designationPaginator;
  }

  fetchDepartments(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<Department[]>('http://localhost:8080/api/department', { headers }).subscribe({
      next: (departments) => {
        this.departmentDataSource.data = departments;
      },
      error: (err) => {
        console.error('Error fetching departments:', err);
      }
    });
  }

  fetchDesignations(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<Designation[]>('http://localhost:8080/api/designation', { headers }).subscribe({
      next: (designations) => {
        this.designationDataSource.data = designations;
      },
      error: (err) => {
        console.error('Error fetching designations:', err);
      }
    });
  }

  applyDepartmentFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.departmentDataSource.filter = filterValue.trim().toLowerCase();
  }

  applyDesignationFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.designationDataSource.filter = filterValue.trim().toLowerCase();
  }

  openAddDepartmentDialog(): void {
    const dialogRef = this.dialog.open(DepartmentDialogComponent, {
      width: '400px',
      data: { department: { name: '' } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addDepartment(result);
      }
    });
  }

  openEditDepartmentDialog(department: Department): void {
    const dialogRef = this.dialog.open(DepartmentDialogComponent, {
      width: '400px',
      data: { department: { ...department } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateDepartment(result);
      }
    });
  }

  openAddDesignationDialog(): void {
    const dialogRef = this.dialog.open(DesignationDialogComponent, {
      width: '400px',
      data: { designation: { name: '' } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addDesignation(result);
      }
    });
  }

  openEditDesignationDialog(designation: Designation): void {
    const dialogRef = this.dialog.open(DesignationDialogComponent, {
      width: '400px',
      data: { designation: { ...designation } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateDesignation(result);
      }
    });
  }

  addDepartment(department: Department): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post<Department>('http://localhost:8080/api/department', department, { headers })
      .subscribe({
        next: (newDepartment) => {
          this.departmentDataSource.data = [...this.departmentDataSource.data, newDepartment];
        },
        error: (err) => {
          console.error('Error adding department:', err);
        }
      });
  }

  updateDepartment(department: Department): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.put<Department>(`http://localhost:8080/api/department/${department.id}`, department, { headers })
      .subscribe({
        next: (updatedDepartment) => {
          const index = this.departmentDataSource.data.findIndex(d => d.id === updatedDepartment.id);
          if (index !== -1) {
            this.departmentDataSource.data[index] = updatedDepartment;
            this.departmentDataSource.data = [...this.departmentDataSource.data];
          }
        },
        error: (err) => {
          console.error('Error updating department:', err);
        }
      });
  }

  deleteDepartment(department: Department): void {
    if (!confirm('Are you sure you want to delete this department?')) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.delete(`http://localhost:8080/api/department/${department.id}`, { headers })
      .subscribe({
        next: () => {
          this.departmentDataSource.data = this.departmentDataSource.data.filter(d => d.id !== department.id);
        },
        error: (err) => {
          console.error('Error deleting department:', err);
        }
      });
  }

  addDesignation(designation: Designation): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post<Designation>('http://localhost:8080/api/designation', designation, { headers })
      .subscribe({
        next: (newDesignation) => {
          this.designationDataSource.data = [...this.designationDataSource.data, newDesignation];
        },
        error: (err) => {
          console.error('Error adding designation:', err);
        }
      });
  }

  updateDesignation(designation: Designation): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.put<Designation>(`http://localhost:8080/api/designation/${designation.id}`, designation, { headers })
      .subscribe({
        next: (updatedDesignation) => {
          const index = this.designationDataSource.data.findIndex(d => d.id === updatedDesignation.id);
          if (index !== -1) {
            this.designationDataSource.data[index] = updatedDesignation;
            this.designationDataSource.data = [...this.designationDataSource.data];
          }
        },
        error: (err) => {
          console.error('Error updating designation:', err);
        }
      });
  }

  deleteDesignation(designation: Designation): void {
    if (!confirm('Are you sure you want to delete this designation?')) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.delete(`http://localhost:8080/api/designation/${designation.id}`, { headers })
      .subscribe({
        next: () => {
          this.designationDataSource.data = this.designationDataSource.data.filter(d => d.id !== designation.id);
        },
        error: (err) => {
          console.error('Error deleting designation:', err);
        }
      });
  }
}

@Component({
  selector: 'app-department-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h1 mat-dialog-title>{{ data.department.id ? 'Edit Department' : 'Add Department' }}</h1>
    <div mat-dialog-content>
      <mat-form-field appearance="fill">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="data.department.name" required>
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button [mat-dialog-close]="data.department" [disabled]="!data.department.name">
        {{ data.department.id ? 'Update' : 'Add' }}
      </button>
    </div>
  `
})
export class DepartmentDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { department: Department }) {}

  onCancel(): void {
    this.data.department = null;
  }
}

@Component({
  selector: 'app-designation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h1 mat-dialog-title>{{ data.designation.id ? 'Edit Designation' : 'Add Designation' }}</h1>
    <div mat-dialog-content>
      <mat-form-field appearance="fill">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="data.designation.name" required>
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button [mat-dialog-close]="data.designation" [disabled]="!data.designation.name">
        {{ data.designation.id ? 'Update' : 'Add' }}
      </button>
    </div>
  `
})
export class DesignationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { designation: Designation }) {}

  onCancel(): void {
    this.data.designation = null;
  }
}