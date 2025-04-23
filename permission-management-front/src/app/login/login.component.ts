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
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage: string | null = null;

  constructor(private http: HttpClient, private router:Router) {}

  login() {
    this.errorMessage = null;
    const payload = { username: this.username, password: this.password };
    console.log('Sending login request with payload:', payload);
    this.http.post('http://localhost:8080/api/auth/login', payload).subscribe({
      next: (response: any) => {
        console.log('Login response:', response);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          userId: response.userId,
          username: response.username,
          departmentId: response.departmentId,
          designationId: response.designationId
        }));
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage = err.error || 'Failed to log in. Please check your credentials and try again.';
      }
    });
  }
}