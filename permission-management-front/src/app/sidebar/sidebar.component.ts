import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../login/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddPermissionDialogComponent } from './add-permission-dialog.component';

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
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatExpansionModule,
    MatButtonModule,
    MatDialogModule
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
      <!-- Add Permission Button -->
      <mat-list-item>
        <button #addPermissionButton mat-raised-button color="primary" (click)="openAddPermissionDialog()" [disabled]="loadingMenus">
          {{ loadingMenus ? 'Loading Menus...' : 'Add Permission' }}
        </button>
      </mat-list-item>
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
    mat-list-item button {
      width: 100%;
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @ViewChild('addPermissionButton') addPermissionButton!: ElementRef; // Use non-null assertion operator

  permissions: PermissionDTO[] = [];
  parentMenus: string[] = [];
  menus: Menu[] = [];
  loadingMenus: boolean = false;
  private userSubscription: Subscription | null = null;
  private user: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.user = user;
      if (this.user) {
        this.fetchPermissions();
        this.fetchMenus();
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
          console.error('Error fetching permissions:', err.status, err.statusText, err.error);
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

  fetchMenus(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.loadingMenus = true;
    this.http.get('http://localhost:8080/api/menu', { headers, responseType: 'text' })
      .subscribe({
        next: (response) => {
          try {
            const menus = JSON.parse(response) as Menu[];
            this.menus = menus;
            console.log('Menus fetched successfully:', this.menus);
          } catch (e) {
            console.error('Failed to parse menus JSON:', e, 'Raw response:', response);
          } finally {
            this.loadingMenus = false;
          }
        },
        error: (err) => {
          console.error('Error fetching menus:', err.status, err.statusText, err.error);
          this.loadingMenus = false;
          if (err.status === 403) {
            console.error('403 Forbidden: Token might be expired. Redirecting to login...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      });
  }

  openAddPermissionDialog(): void {
    const dialogRef = this.dialog.open(AddPermissionDialogComponent, {
      width: '400px',
      data: { menus: this.menus }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchPermissions();
        if (this.addPermissionButton) {
          this.addPermissionButton.nativeElement.focus();
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}