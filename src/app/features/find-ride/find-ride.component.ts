import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RideService } from '../../core/services/ride.service';
import { BookingService } from '../../core/services/booking.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { Ride, Stats } from '../../core/models/models';

@Component({
  selector: 'app-find-ride',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './find-ride.component.html',
  styleUrls: ['./find-ride.component.css']
})
export class FindRideComponent implements OnInit {
  private rideService = inject(RideService);
  private bookingService = inject(BookingService);
  private userService = inject(UserService);
  toast = inject(ToastService);

  rides = signal<Ride[]>([]);
  stats = signal<Stats | null>(null);
  loading = signal(false);

  from = '';
  to = '';
  date = '';
  time = '08:30';
  passengers = 1;

  vehicleFilter = signal<'all' | 'car' | 'bike'>('all');
  activeChip = signal<string>('all');

  // booking modal
  modalRide = signal<Ride | null>(null);
  booking = signal(false);

  ngOnInit() {
    this.loadStats();
    this.fetchRides();
  }

  loadStats() {
    this.rideService.stats().subscribe({
      next: (s) => this.stats.set(s),
      error: () => {}
    });
  }

  fetchRides() {
    this.loading.set(true);
    const sort =
      this.activeChip() === 'fast' ? 'fast' : this.activeChip() === 'rated' ? 'rated' : '';
    const type =
      this.activeChip() === 'car'
        ? 'car'
        : this.activeChip() === 'bike'
        ? 'bike'
        : this.vehicleFilter();

    this.rideService
      .search({ from: this.from, to: this.to, date: this.date, type, sort })
      .subscribe({
        next: (r) => {
          this.rides.set(r);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.toast.error('Could not load rides');
        }
      });
  }

  doSearch() {
    this.toast.success('Finding rides for you…');
    this.fetchRides();
  }

  setVehicle(v: 'all' | 'car' | 'bike') {
    this.vehicleFilter.set(v);
    this.activeChip.set('all');
    this.fetchRides();
  }

  filter(chip: string) {
    this.activeChip.set(chip);
    this.fetchRides();
  }

  openModal(ride: Ride) {
    this.modalRide.set(ride);
    document.body.style.overflow = 'hidden';
  }
  closeModal() {
    this.modalRide.set(null);
    document.body.style.overflow = '';
  }

  confirmBook() {
    const ride = this.modalRide();
    if (!ride || this.booking()) return;
    this.booking.set(true);
    this.bookingService.book(ride._id, 1).subscribe({
      next: () => {
        this.booking.set(false);
        this.toast.success(
          `📨 Request sent to ${ride.driver.name}! Their contact will be shared once accepted.`
        );
        this.closeModal();
        this.fetchRides();
        this.loadStats();
        this.userService.loadNotifications().subscribe();
      },
      error: (err) => {
        this.booking.set(false);
        this.toast.error(err?.error?.message || 'Request failed');
      }
    });
  }

  badgeLabel(b: string) {
    return b === 'bike' ? '🏍️ Bike' : '🚗 Car';
  }
}
