import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/models';

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;
  private tokenKey = 'poolgo_token';

  currentUser = signal<User | null>(null);
  isLoggedIn = computed(() => this.currentUser() !== null);

  constructor(private http: HttpClient) {}

  // sessionStorage is per-TAB, so two accounts in two tabs never collide.
  get token(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    city?: string;
    bio?: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/auth/register`, data)
      .pipe(tap((res) => this.handleAuth(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/auth/login`, { email, password })
      .pipe(tap((res) => this.handleAuth(res)));
  }

  /** Restore session on app boot using stored token */
  loadSession(): Observable<{ user: User }> {
    return this.http
      .get<{ user: User }>(`${this.api}/auth/me`)
      .pipe(tap((res) => this.currentUser.set(res.user)));
  }

  setUser(user: User) {
    this.currentUser.set(user);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.api}/auth/password`, {
      currentPassword,
      newPassword
    });
  }

  logout() {
    sessionStorage.removeItem(this.tokenKey);
    this.currentUser.set(null);
  }

  private handleAuth(res: AuthResponse) {
    sessionStorage.setItem(this.tokenKey, res.token);
    this.currentUser.set(res.user);
  }
}
