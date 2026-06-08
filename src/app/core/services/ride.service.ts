import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ride, Stats } from '../models/models';

export interface RideSearch {
  from?: string;
  to?: string;
  type?: string;
  date?: string;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class RideService {
  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  search(q: RideSearch): Observable<Ride[]> {
    let params = new HttpParams();
    Object.entries(q).forEach(([k, v]) => {
      if (v) params = params.set(k, v);
    });
    return this.http.get<Ride[]>(`${this.api}/rides`, { params });
  }

  get(id: string): Observable<Ride> {
    return this.http.get<Ride>(`${this.api}/rides/${id}`);
  }

  stats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.api}/rides/stats/today`);
  }

  create(data: any): Observable<Ride> {
    return this.http.post<Ride>(`${this.api}/rides`, data);
  }

  myOffered(): Observable<Ride[]> {
    return this.http.get<Ride[]>(`${this.api}/rides/me/offered`);
  }

  cancel(id: string): Observable<any> {
    return this.http.delete(`${this.api}/rides/${id}`);
  }

  complete(id: string): Observable<any> {
    return this.http.patch(`${this.api}/rides/${id}/complete`, {});
  }
}
