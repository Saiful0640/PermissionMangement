import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  departmentId: number;
  designationId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();
  private token: string | null = null;
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
    this.token = localStorage.getItem('token');
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setUser(response);
        this.setToken(response.token);
        console.log('Login successful, user and token stored:', response);
      })
    );
  }

  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  logout(): Observable<any> {
    const headers = this.token ? new HttpHeaders().set('Authorization', `Bearer ${this.token}`) : undefined;
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      tap(() => {
        this.clearUser();
      })
    );
  }

  clearUser(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    console.log('User and token cleared');
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }
}