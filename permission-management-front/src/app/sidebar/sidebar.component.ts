import { Component, OnInit,} from '@angular/core';
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

interface MenuGroup {
  menuName: string | null;
  items: Menu[];
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
  menuGroups: MenuGroup[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('User data from localStorage:', user);
    const url = `http://localhost:8080/api/permission?departmentId=${user.departmentId}&designationId=${user.designationId}`;
    this.http.get<Menu[]>(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: (data) => {
        console.log('Fetched permissions:', data);
        const filteredMenus = data.filter(menu => menu.canView);
        console.log('Filtered menus (canView: true):', filteredMenus);
        
        // Group menus by menuName
        const grouped = filteredMenus.reduce((acc, menu) => {
          const key = menu.menuName || 'top-level';
          if (!acc[key]) acc[key] = [];
          acc[key].push(menu);
          return acc;
        }, {} as { [key: string]: Menu[] });

        // Convert grouped object to array of MenuGroup
        this.menuGroups = Object.keys(grouped).map(key => ({
          menuName: key === 'top-level' ? null : key,
          items: grouped[key]
        }));
        console.log('Menu groups:', this.menuGroups);
      },
      error: (err) => console.error('Error fetching menus:', err)
    });
  }
}