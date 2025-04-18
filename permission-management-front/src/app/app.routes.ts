import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PermissionManagementComponent } from './permission-management/permission-management/permission-management.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { DepartmentDesignationComponent } from './department-designation/department-designation.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'permissions', component: PermissionManagementComponent, canActivate: [authGuard] },
  { path: 'users', component: UserManagementComponent, canActivate: [authGuard] },
  { path: 'departments-designations', component: DepartmentDesignationComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];