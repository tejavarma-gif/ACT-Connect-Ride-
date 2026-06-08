import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, PassengerRide, DriverRide } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  book(rideId: string, seats: number): Observable<Booking> {
    return this.http.post<Booking>(`${this.api}/bookings`, {
      rideId,
      seats
    });
  }

  // rides I requested as a passenger
  myRides(): Observable<PassengerRide[]> {
    return this.http.get<PassengerRide[]>(`${this.api}/bookings/me`);
  }

  // my offered rides with their incoming requests
  driverRequests(): Observable<DriverRide[]> {
    return this.http.get<DriverRide[]>(`${this.api}/bookings/driver`);
  }

  accept(id: string): Observable<any> {
    return this.http.patch(`${this.api}/bookings/${id}/accept`, {});
  }

  reject(id: string): Observable<any> {
    return this.http.patch(`${this.api}/bookings/${id}/reject`, {});
  }

  cancel(id: string): Observable<any> {
    return this.http.patch(`${this.api}/bookings/${id}/cancel`, {});
  }

  rate(id: string, value: number, review: string): Observable<any> {
    return this.http.patch(`${this.api}/bookings/${id}/rate`, { value, review });
  }
}
