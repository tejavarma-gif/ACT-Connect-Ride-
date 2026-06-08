import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, Notification, Review } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = environment.apiUrl;

  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  updateProfile(data: { name?: string; city?: string; bio?: string; phone?: string }): Observable<{ user: User }> {
    return this.http.put<{ user: User }>(`${this.api}/users/me`, data);
  }

  updateVehicle(data: any): Observable<{ user: User }> {
    return this.http.put<{ user: User }>(`${this.api}/users/me/vehicle`, data);
  }

  updatePreferences(data: any): Observable<{ user: User }> {
    return this.http.put<{ user: User }>(`${this.api}/users/me/preferences`, data);
  }

  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.api}/users/me/reviews`);
  }

  // ── Notifications ──
  loadNotifications(): Observable<{ notifications: Notification[]; unread: number }> {
    return this.http
      .get<{ notifications: Notification[]; unread: number }>(`${this.api}/notifications`)
      .pipe(
        tap((res) => {
          this.notifications.set(res.notifications);
          this.unreadCount.set(res.unread);
        })
      );
  }

  markAllRead(): Observable<any> {
    return this.http.patch(`${this.api}/notifications/read-all`, {}).pipe(
      tap(() => {
        this.notifications.update((list) =>
          list.map((n) => ({ ...n, read: true }))
        );
        this.unreadCount.set(0);
      })
    );
  }
}
