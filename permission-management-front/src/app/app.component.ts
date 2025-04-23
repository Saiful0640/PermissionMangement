import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    MatSidenavModule,
    SidebarComponent
  ],
  template:`
    <div *ngIf="isLoggedIn()">
      <mat-sidenav-container>
        <mat-sidenav mode="side" opened>
          <app-sidebar></app-sidebar>
        </mat-sidenav>
        <mat-sidenav-content>
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
    <div *ngIf="!isLoggedIn()">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    mat-sidenav-container {
      height: 100vh;
    }

    mat-sidenav {
      width: 200px;
      background-color: #f4f4f4;
    }

    mat-sidenav-content {
      padding: 20px;
    }
  `]
})
export class AppComponent {
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Debug: Log the router configuration
    console.log('Router Config:', this.router.config);
  }

  isLoggedIn(): boolean {
    const isLoggedIn = !!localStorage.getItem('token');
    console.log('Current URL:', this.router.url, 'Is Logged In:', isLoggedIn);
    return isLoggedIn;
  }
}