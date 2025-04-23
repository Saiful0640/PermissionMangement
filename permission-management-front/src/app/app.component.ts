import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    SidebarComponent
  ],
  template: `
    <div *ngIf="shouldShowSidebar()">
      <app-sidebar></app-sidebar>
    </div>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  constructor(private router: Router) {}

  shouldShowSidebar(): boolean {
    const currentUrl = this.router.url;
    const isLoggedIn = !!localStorage.getItem('token');
    console.log('Current URL:', currentUrl, 'Is Logged In:', isLoggedIn); // Debug log
    return currentUrl !== '/login' && isLoggedIn;
  }
}