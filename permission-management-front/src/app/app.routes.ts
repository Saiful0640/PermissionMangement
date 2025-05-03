import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CalendarComponent } from './calendar/calendar.component';
import { TimeHistoryComponent } from './attendance/time-history/time-history.component';
import { authGuard } from './auth.guard';
import { PermissionManagementComponent } from './permission-management/permission-management/permission-management.component';
import { UsersManagmentComponent } from './user-management/user-management.component';
import { DepartmentDesignationComponent } from './departments-designations/departments-designations.component';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'attendance/time_history', component: TimeHistoryComponent },
      { path: 'permission', component: PermissionManagementComponent },
      {path:'user',component:UsersManagmentComponent},
      { path: 'department-designation', component: DepartmentDesignationComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'dashboard', redirectTo: 'admin/dashboard', pathMatch: 'full' }
];