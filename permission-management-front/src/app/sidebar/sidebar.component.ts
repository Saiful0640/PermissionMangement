import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../login/auth.service';

interface PermissionDTO {
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
  selector: 'app-sidebar',
  standalone: true,
  imports: [
      CommonModule,
      RouterModule,
      MatListModule,
      MatExpansionModule
  ],
  template: `
      <mat-nav-list>
          <!-- Group permissions by parent menu (menuName) -->
          <ng-container *ngFor="let parentMenu of parentMenus">
              <mat-expansion-panel>
                  <mat-expansion-panel-header>
                      <mat-panel-title>{{ parentMenu }}</mat-panel-title>
                  </mat-expansion-panel-header>
                  <mat-nav-list>
                      <ng-container *ngFor="let permission of permissions">
                          <mat-list-item
                              *ngIf="permission.menuName === parentMenu && permission.subMenu"
                              [routerLink]="permission.link"
                              routerLinkActive="active">
                              {{ permission.subMenu }}
                          </mat-list-item>
                      </ng-container>
                  </mat-nav-list>
              </mat-expansion-panel>
          </ng-container>
          <!-- Standalone menus without a parent menu -->
          <ng-container *ngFor="let permission of permissions">
              <mat-list-item
                  *ngIf="!permission.menuName && permission.subMenu"
                  [routerLink]="permission.link"
                  routerLinkActive="active">
                  {{ permission.subMenu }}
              </mat-list-item>
          </ng-container>
      </mat-nav-list>
  `,
  styles: [`
      .active {
          background-color: #e0e0e0;
      }
      mat-expansion-panel {
          margin-bottom: 8px;
      }
      mat-nav-list {
          padding: 0;
      }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  permissions: PermissionDTO[] = [];
  parentMenus: string[] = [];
  private userSubscription: Subscription | null = null;
  private user: any = null;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.user = user;
      if (this.user) {
        this.fetchPermissions();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  fetchPermissions(): void {
    const departmentId = this.user.departmentId;
    const designationId = this.user.designationId;
    const token = localStorage.getItem('token');

    console.log('User:', this.user);
    console.log('Token:', token);
    console.log('Fetching permissions for departmentId:', departmentId, 'designationId:', designationId);

    if (!token) {
      console.error('No token found in localStorage. Redirecting to login...');
      this.router.navigate(['/login']);
      return;
    }

    if (!departmentId || !designationId) {
      console.error('DepartmentId or DesignationId missing in user data:', this.user);
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<PermissionDTO[]>(`http://localhost:8080/api/permission?departmentId=${departmentId}&designationId=${designationId}`, { headers })
      .subscribe({
        next: (permissions) => {
          this.permissions = permissions.filter(p => p.canView && p.active);
          this.parentMenus = [...new Set(permissions
            .filter(p => p.menuName)
            .map(p => p.menuName!))];
          console.log('Permissions fetched successfully:', this.permissions);
          console.log('Parent menus:', this.parentMenus);
        },
        error: (err) => {
          console.error('Error fetching permissions:', err);
          if (err.status === 403) {
            console.error('403 Forbidden: Token might be expired. Attempting to refresh by redirecting to login...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}