import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

interface Menu {
  menuName: string | null;
  subMenu: string;
  link: string;
  canView: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menus: Menu[] = [];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.departmentId && user.designationId) {
        const url = `http://localhost:8080/api/permissions?departmentId=${user.departmentId}&designationId=${user.designationId}`;
        this.http.get<Menu[]>(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).subscribe({
          next: (data) => {
            this.menus = data.filter(menu => menu.canView);
          },
          error: (err) => console.error('Error fetching menus:', err)
        });
      } else {
        console.warn('User data missing departmentId or designationId');
      }
    }
  }
}