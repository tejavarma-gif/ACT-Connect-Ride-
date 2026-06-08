import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { Review } from '../../core/models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  editing = signal(false);
  editingVehicle = signal(false);
  reviews = signal<Review[]>([]);

  // edit buffers
  name = '';
  city = '';
  bio = '';
  phone = '';
  vModel = '';
  vNumber = '';
  vColor = '';

  ngOnInit() {
    this.userService.getReviews().subscribe({
      next: (r) => this.reviews.set(r),
      error: () => {}
    });
  }

  stars(n: number): number[] {
    return Array(Math.round(n)).fill(0);
  }

  get user() {
    return this.auth.currentUser();
  }

  badgeIcon(b: string): string {
    const map: Record<string, string> = {
      'Gold Driver': '🥇',
      'Top Rated': '⭐',
      'Eco Hero': '🌿',
      'Quick Accept': '⚡'
    };
    return map[b] || '🏅';
  }
  badgeDesc(b: string): string {
    const map: Record<string, string> = {
      'Gold Driver': '50+ rides',
      'Top Rated': '4.8+ rating',
      'Eco Hero': '1t CO₂ saved',
      'Quick Accept': '<2min response'
    };
    return map[b] || '';
  }

  startEdit() {
    const u = this.user;
    if (!u) return;
    this.name = u.name;
    this.city = u.city;
    this.bio = u.bio;
    this.phone = u.phone;
    this.editing.set(true);
  }
  saveProfile() {
    this.userService
      .updateProfile({ name: this.name, city: this.city, bio: this.bio, phone: this.phone })
      .subscribe({
        next: (res) => {
          this.auth.setUser(res.user);
          this.editing.set(false);
          this.toast.success('Profile updated!');
        },
        error: (err) => this.toast.error(err?.error?.message || 'Update failed')
      });
  }

  startVehicleEdit() {
    const v = this.user?.vehicle;
    this.vModel = v?.model || '';
    this.vNumber = v?.number || '';
    this.vColor = v?.color || '';
    this.editingVehicle.set(true);
  }
  saveVehicle() {
    this.userService
      .updateVehicle({ model: this.vModel, number: this.vNumber, color: this.vColor })
      .subscribe({
        next: (res) => {
          this.auth.setUser(res.user);
          this.editingVehicle.set(false);
          this.toast.success('Vehicle updated!');
        },
        error: (err) => this.toast.error(err?.error?.message || 'Update failed')
      });
  }

  updatePref(field: string, value: any, msg: string) {
    this.userService.updatePreferences({ [field]: value }).subscribe({
      next: (res) => {
        this.auth.setUser(res.user);
        this.toast.success(msg);
      },
      error: () => this.toast.error('Could not update preference')
    });
  }

  // ── simple preference editors ──
  editMusic() {
    const cur = this.user?.preferences?.music || '';
    const val = prompt('Set your music preference:', cur);
    if (val !== null && val.trim()) this.updatePref('music', val.trim(), 'Music preference saved!');
  }

  toggleNotifications() {
    const on = this.user?.preferences?.notifications !== 'Off';
    this.updatePref('notifications', on ? 'Off' : 'All enabled', 'Notifications updated!');
  }

  cycleLanguage() {
    const langs = ['English', 'Hindi', 'Telugu', 'Kannada', 'Tamil'];
    const cur = this.user?.preferences?.language || 'English';
    const next = langs[(langs.indexOf(cur) + 1) % langs.length];
    this.updatePref('language', next, 'Language set to ' + next);
  }

  editEmergency() {
    const cur = this.user?.preferences?.emergencyContact || '';
    const val = prompt('Emergency contact (name & phone):', cur);
    if (val !== null) this.updatePref('emergencyContact', val.trim(), 'Emergency contact saved!');
  }

  prefToast(msg: string) {
    this.toast.success(msg);
  }
}
