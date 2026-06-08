import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RideService } from '../../core/services/ride.service';
import { ToastService } from '../../core/services/toast.service';

interface RuleDef {
  key: string;
  label: string;
  icon: string;
  on: boolean;
}

@Component({
  selector: 'app-offer-ride',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offer-ride.component.html',
  styleUrls: ['./offer-ride.component.css']
})
export class OfferRideComponent {
  private rideService = inject(RideService);
  private toast = inject(ToastService);
  private router = inject(Router);

  vehicle = signal<'car' | 'bike'>('car');
  submitting = signal(false);

  from = '';
  to = '';
  date = new Date().toISOString().split('T')[0];
  time = '08:00';
  seats = 2;

  carRules: RuleDef[] = [
    { key: 'music', label: 'Music OK', icon: 'fa-music', on: true },
    { key: 'noSmoking', label: 'No Smoking', icon: 'fa-smoking-ban', on: false },
    { key: 'pets', label: 'Pets OK', icon: 'fa-paw', on: false },
    { key: 'largeBags', label: 'Large Bags', icon: 'fa-bag-shopping', on: false },
    { key: 'womenOnly', label: 'Women Only', icon: 'fa-venus', on: false },
    { key: 'ac', label: 'AC', icon: 'fa-snowflake', on: false }
  ];

  bikeRules: RuleDef[] = [
    { key: 'helmetProvided', label: 'Extra Helmet', icon: 'fa-helmet-safety', on: true },
    { key: 'noSmoking', label: 'No Smoking', icon: 'fa-smoking-ban', on: false },
    { key: 'womenOnly', label: 'Women Only', icon: 'fa-venus', on: false },
    { key: 'cityCentric', label: 'City Only', icon: 'fa-city', on: false }
  ];

  rules = signal<RuleDef[]>(this.carRules);

  selectVehicle(v: 'car' | 'bike') {
    this.vehicle.set(v);
    this.rules.set(v === 'bike' ? this.bikeRules : this.carRules);
    if (v === 'bike') this.seats = 1;
    else if (this.seats < 1) this.seats = 2;
  }

  toggleRule(key: string) {
    this.rules.update((list) =>
      list.map((r) => (r.key === key ? { ...r, on: !r.on } : r))
    );
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  submit() {
    if (this.submitting()) return;
    if (!this.from || !this.to) {
      this.toast.error('Please fill From and To');
      return;
    }
    this.submitting.set(true);

    const rulesObj: any = {};
    this.rules().forEach((r) => (rulesObj[r.key] = r.on));

    this.rideService
      .create({
        type: this.vehicle(),
        from: this.from,
        to: this.to,
        date: this.date,
        depTime: this.time,
        seats: this.seats,
        rules: rulesObj
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.success(`🚗 Your ride ${this.from} → ${this.to} is now live!`);
          this.from = '';
          this.to = '';
          setTimeout(() => this.router.navigate(['/my-rides']), 800);
        },
        error: (err) => {
          this.submitting.set(false);
          this.toast.error(err?.error?.message || 'Could not publish ride');
        }
      });
  }
}
