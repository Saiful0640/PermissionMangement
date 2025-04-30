import { Component, OnInit,} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { RouterModule, Router } from '@angular/router';

interface PermissionDTO {
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

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
      CommonModule,
      RouterModule,
      MatListModule
  ],
  template: `
      <mat-nav-list>
          <ng-container *ngFor="let permission of permissions">
              <mat-list-item [routerLink]="permission.link" routerLinkActive="active" *ngIf="permission.menuName">
                  {{ permission.menuName }}
                  <mat-nav-list>
                      <mat-list-item [routerLink]="permission.link" routerLinkActive="active">
                          {{ permission.subMenu }}
                      </mat-list-item>
                  </mat-nav-list>
              </mat-list-item>
              <mat-list-item [routerLink]="permission.link" routerLinkActive="active" *ngIf="!permission.menuName">
                  {{ permission.subMenu }}
              </mat-list-item>
          </ng-container>
      </mat-nav-list>
  `,
  styles: [`
      .active {
          background-color: #e0e0e0;
      }
  `]
})
export class SidebarComponent implements OnInit {
  permissions: PermissionDTO[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
      this.fetchPermissions();
  }

  fetchPermissions(): void {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const departmentId = user.departmentId;
      const designationId = user.designationId;
      const token = localStorage.getItem('token');

      console.log('User:', user);
      console.log('Token:', token);
      console.log('Fetching permissions for departmentId:', departmentId, 'designationId:', designationId);

      if (!token) {
          console.error('No token found in localStorage. Redirecting to login...');
          this.router.navigate(['/login']);
          return;
      }

      if (!departmentId || !designationId) {
          console.error('DepartmentId or DesignationId missing in user data:', user);
          this.router.navigate(['/login']);
          return;
      }

      const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
      });

      this.http.get<PermissionDTO[]>(`http://localhost:8080/api/permission?departmentId=${departmentId}&designationId=${designationId}`, { headers })
          .subscribe({
              next: (permissions) => {
                  this.permissions = permissions.filter(p => p.canView); // Only show menus where canView is true
                  console.log('Permissions fetched successfully:', this.permissions);
              },
              error: (err) => {
                  console.error('Error fetching permissions:', err);
                  if (err.status === 403) {
                      console.error('403 Forbidden: Check if the token is valid and the user has permission to access this endpoint.');
                      this.router.navigate(['/login']);
                  }
              }
          });
  }

  logout(): void {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
  }
}