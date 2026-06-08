import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../core/services/booking.service';
import { RideService } from '../../core/services/ride.service';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { PassengerRide, DriverRide } from '../../core/models/models';

@Component({
  selector: 'app-my-rides',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-rides.component.html',
  styleUrls: ['./my-rides.component.css']
})
export class MyRidesComponent implements OnInit, OnDestroy {
  private bookingService = inject(BookingService);
  private rideService = inject(RideService);
  private toast = inject(ToastService);
  private userService = inject(UserService);

  view = signal<'passenger' | 'driver'>('passenger');

  passengerRides = signal<PassengerRide[]>([]);
  driverRides = signal<DriverRide[]>([]);
  loading = signal(false);

  // rating modal
  rateTarget = signal<PassengerRide | null>(null);
  rateValue = signal(5);
  reviewText = '';

  private pollId: any = null;

  ngOnInit() {
    this.loadAll();
    // Poll for updates so the passenger/driver view reflects changes without a manual refresh
    this.pollId = setInterval(() => this.loadAll(), 8000);
  }

  // clear polling when component destroyed
  ngOnDestroy() {
    if (this.pollId) clearInterval(this.pollId);
  }

  loadAll() {
    this.loading.set(true);
    this.bookingService.myRides().subscribe({
      next: (r) => this.passengerRides.set(r),
      error: () => this.toast.error('Could not load your bookings')
    });
    this.bookingService.driverRequests().subscribe({
      next: (r) => {
        this.driverRides.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Could not load your offered rides');
      }
    });
  }

  setView(v: 'passenger' | 'driver') {
    this.view.set(v);
  }

  pendingCount(): number {
    return this.driverRides().reduce(
      (sum, r) => sum + r.requests.filter((q) => q.status === 'pending').length,
      0
    );
  }

  // active items count for the toggle badges
  passengerActiveCount(): number {
    return this.passengerRides().filter((r) =>
      ['pending', 'accepted', 'active'].includes(r.status)
    ).length;
  }
  driverActiveCount(): number {
    return this.driverRides().filter((r) => r.status === 'active').length;
  }

  // Complete only allowed once a request has been accepted
  canComplete(ride: DriverRide): boolean {
    return (
      ride.status === 'active' &&
      ride.requests.some((q) => q.status === 'accepted' || q.status === 'active')
    );
  }

  // Driver side: grey out completed/cancelled/rejected rides
  isDimmed(status: string): boolean {
    return ['completed', 'cancelled', 'rejected'].includes(status);
  }

  // Passenger side: grey out cancelled/rejected always, but completed
  // only AFTER the passenger has submitted their rating
  isPassengerDimmed(r: PassengerRide): boolean {
    if (r.status === 'cancelled' || r.status === 'rejected') return true;
    if (r.status === 'completed' && r.rated) return true;
    return false;
  }

  // tel: / sms: links (strip spaces)
  telLink(phone: string): string {
    return 'tel:' + (phone || '').replace(/\s+/g, '');
  }
  smsLink(phone: string): string {
    return 'sms:' + (phone || '').replace(/\s+/g, '');
  }

  // ── Driver actions ──
  accept(reqId: string) {
    this.bookingService.accept(reqId).subscribe({
      next: () => {
        this.toast.success('Request accepted ✅');
        this.loadAll();
        this.userService.loadNotifications().subscribe();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Could not accept')
    });
  }

  reject(reqId: string) {
    if (!confirm('Reject this request? The seat will be released.')) return;
    this.bookingService.reject(reqId).subscribe({
      next: () => {
        this.toast.error('Request rejected');
        this.loadAll();
        this.userService.loadNotifications().subscribe();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Could not reject')
    });
  }

  // permanently delete an offered ride
  deleteRide(rideId: string) {
    if (!confirm('Cancel this ride? It will be permanently removed for everyone.')) return;
    this.rideService.cancel(rideId).subscribe({
      next: () => {
        this.toast.error('Ride cancelled and removed.');
        this.loadAll();
        this.userService.loadNotifications().subscribe();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Could not cancel ride')
    });
  }

  // mark an offered ride as completed → passengers can rate
  completeRide(rideId: string) {
    if (!confirm('Mark this ride as completed? Passengers will be asked to rate you.')) return;
    this.rideService.complete(rideId).subscribe({
      next: () => {
        this.toast.success('Ride marked as completed 🏁');
        this.loadAll();
        this.userService.loadNotifications().subscribe();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Could not complete ride')
    });
  }

  // ── Passenger actions ──
  cancelBooking(r: PassengerRide) {
    if (!confirm('Cancel this booking? This cannot be undone.')) return;
    this.bookingService.cancel(r._id).subscribe({
      next: () => {
        this.toast.error('Booking cancelled.');
        this.loadAll();
        this.userService.loadNotifications().subscribe();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Cancel failed')
    });
  }

  openRate(r: PassengerRide) {
    this.rateTarget.set(r);
    this.rateValue.set(5);
    this.reviewText = '';
  }
  closeRate() {
    this.rateTarget.set(null);
  }
  setStars(n: number) {
    this.rateValue.set(n);
  }
  submitRate() {
    const r = this.rateTarget();
    if (!r) return;
    this.bookingService.rate(r._id, this.rateValue(), this.reviewText).subscribe({
      next: () => {
        this.toast.success('Thanks for your review! 🌟');
        this.closeRate();
        this.loadAll();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Could not submit review')
    });
  }

  cap(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
