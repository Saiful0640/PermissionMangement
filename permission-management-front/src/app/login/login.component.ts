import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

interface LoginResponse {
  token: string;
  userId: number;  
  username: string;
  departmentId: number;
  designationId: number;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
      CommonModule,
      FormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule
  ],
  template: `
      <div class="login-container">
          <h2>Login</h2>
          <form (ngSubmit)="onSubmit()">
              <mat-form-field appearance="fill">
                  <mat-label>Username</mat-label>
                  <input matInput [(ngModel)]="username" name="username" required>
              </mat-form-field>
              <mat-form-field appearance="fill">
                  <mat-label>Password</mat-label>
                  <input matInput type="password" [(ngModel)]="password" name="password" required>
              </mat-form-field>
              <button mat-raised-button color="primary" type="submit">Login</button>
          </form>
      </div>
  `,
  styles: [`
      .login-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
      }
      mat-form-field {
          width: 300px;
      }
      button {
          margin-top: 20px;
      }
  `]
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
      const credentials = {
          username: this.username,
          password: this.password
      };

      this.http.post<LoginResponse>('http://localhost:8080/api/auth/login', credentials).subscribe({
          next: (response) => {
              localStorage.setItem('token', response.token);
              localStorage.setItem('user', JSON.stringify({
                  id: response.userId,  
                  username: response.username,
                  departmentId: response.departmentId,
                  designationId: response.designationId  // Fixed typo: was response.departmentId
              }));
              console.log('Login successful, user stored:', JSON.parse(localStorage.getItem('user') || '{}'));
              this.router.navigate(['/admin/dashboard']);
          },
          error: (err) => {
              console.error('Login failed:', err);
          }
      });
  }
}