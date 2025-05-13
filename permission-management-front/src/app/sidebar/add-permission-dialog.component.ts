import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select'; // Ensure this is included

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

@Component({
  selector: 'app-add-permission-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    FormsModule,
    MatCheckboxModule,
    MatSelectModule // Verify this is present
  ],
  template: `
    <h2 mat-dialog-title>Add New Permission</h2>
    <mat-dialog-content>
      <form #addPermissionForm="ngForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill">
          <mat-label>Select Menu</mat-label>
          <mat-select [(ngModel)]="newPermission.menuId" name="menuId" required>
            <mat-option *ngFor="let menu of data.menus" [value]="menu.id">
              {{ menu.menuName }} {{ menu.subMenu ? ' > ' + menu.subMenu : '' }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Department ID</mat-label>
          <input matInput [(ngModel)]="newPermission.departmentId" name="departmentId" type="number">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Designation ID</mat-label>
          <input matInput [(ngModel)]="newPermission.designationId" name="designationId" type="number">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Role</mat-label>
          <input matInput [(ngModel)]="newPermission.role" name="role">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>User ID</mat-label>
          <input matInput [(ngModel)]="newPermission.userId" name="userId" type="number">
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
export class AddPermissionDialogComponent {
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

  constructor(
    public dialogRef: MatDialogRef<AddPermissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { menus: Menu[] },
    private http: HttpClient
  ) {}

  onSubmit(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post<PermissionDTO>('http://localhost:8080/api/permission', this.newPermission, { headers })
      .subscribe({
        next: (response) => {
          console.log('Permission added successfully:', response);
          this.dialogRef.close(true); // Close dialog with success
        },
        error: (err) => {
          console.error('Error adding permission:', err.status, err.statusText, err.error);
          this.dialogRef.close(false); // Close dialog with failure
        }
      });
  }
}