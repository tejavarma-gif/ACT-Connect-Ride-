import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { ThemeService } from '../../core/services/theme.service';

type ModalType = null | 'help' | 'settings' | 'safety';

interface Faq {
  q: string;
  a: string;
  open: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class ShellComponent implements OnInit {
  auth = inject(AuthService);
  userService = inject(UserService);
  toast = inject(ToastService);
  theme = inject(ThemeService);
  router = inject(Router);

  notifOpen = signal(false);
  modal = signal<ModalType>(null);
  mobileMenuOpen = signal(false);

  // settings form
  sName = '';
  sPhone = '';
  sCity = '';
  sBio = '';
  curPassword = '';
  newPassword = '';
  changingPw = signal(false);

  // safety
  emergencyContact = '';
  sosActive = signal(false);

  faqs = signal<Faq[]>([
    { q: 'How does ride pooling work?', a: 'Find a ride matching your route, send a request, and once the driver accepts you are confirmed. Pooling is free between ACT colleagues — share the journey, reduce traffic and carbon.', open: true },
    { q: 'When is my seat confirmed?', a: 'Your seat is held the moment you request it, but it is only confirmed once the driver taps Accept. You will get a notification either way, and once accepted you can both see each other\'s phone number to coordinate.', open: false },
    { q: 'How do I contact my driver or passenger?', a: 'After a request is accepted, a Call and Chat option appears in My Rides for both of you, so you can coordinate the pickup directly.', open: false },
    { q: 'Can I cancel a ride?', a: 'Passengers can tap Cancel on any pending or accepted ride in My Rides → As Passenger. Drivers can Cancel an offered ride (it is removed for everyone) from My Rides → As Driver.', open: false },
    { q: 'How does rating work?', a: 'After the driver marks the ride Completed, you can rate them with stars and a short review. Your review updates the driver\'s rating and shows on their profile.', open: false },
    { q: 'Is it safe?', a: 'All ACT drivers are verified. Use the Safety panel to set an emergency contact, share your trip live, and trigger SOS if needed.', open: false }
  ]);

  get user() {
    return this.auth.currentUser();
  }

  ngOnInit() {
    this.userService.loadNotifications().subscribe({ error: () => {} });
  }

  // ── Notifications ──
  toggleNotif(event: MouseEvent) {
    event.stopPropagation();
    if (this.notifOpen()) {
      this.closeNotif(); // closing → mark as seen
    } else {
      this.notifOpen.set(true); // opening → show new ones (red dots stay visible)
    }
  }
  closeNotif() {
    // Once the panel is closed, treat the notifications as seen and persist it,
    // so the red dots don't come back after a reload. Only acts if something was unread.
    if (this.notifOpen() && this.userService.unreadCount() > 0) {
      this.userService.markAllRead().subscribe();
    }
    this.notifOpen.set(false);
  }
  markAllRead() {
    this.userService.markAllRead().subscribe(() => {
      this.toast.success('All notifications marked as read');
    });
  }

  // ── Quick-link modals ──
  openModal(type: ModalType) {
    const u = this.user;
    if (type === 'settings' && u) {
      this.sName = u.name;
      this.sPhone = u.phone;
      this.sCity = u.city;
      this.sBio = u.bio;
      this.curPassword = '';
      this.newPassword = '';
    }
    if (type === 'safety' && u) {
      this.emergencyContact = u.preferences?.emergencyContact || '';
    }
    this.modal.set(type);
    this.closeNotif();
    document.body.style.overflow = 'hidden';
  }
  closeModal() {
    this.modal.set(null);
    document.body.style.overflow = '';
  }
  toggleFaq(i: number) {
    this.faqs.update((list) =>
      list.map((f, idx) => (idx === i ? { ...f, open: !f.open } : f))
    );
  }

  // Settings: save profile
  saveSettings() {
    this.userService
      .updateProfile({ name: this.sName, phone: this.sPhone, city: this.sCity, bio: this.sBio })
      .subscribe({
        next: (res) => {
          this.auth.setUser(res.user);
          this.toast.success('Settings saved!');
        },
        error: (err) => this.toast.error(err?.error?.message || 'Could not save')
      });
  }

  // Settings: change password
  changePassword() {
    if (this.changingPw()) return;
    if (!this.curPassword || !this.newPassword) {
      this.toast.error('Enter your current and new password');
      return;
    }
    this.changingPw.set(true);
    this.auth.changePassword(this.curPassword, this.newPassword).subscribe({
      next: () => {
        this.changingPw.set(false);
        this.curPassword = '';
        this.newPassword = '';
        this.toast.success('Password updated successfully');
      },
      error: (err) => {
        this.changingPw.set(false);
        this.toast.error(err?.error?.message || 'Could not change password');
      }
    });
  }

  // Settings/Safety: toggle a preference
  togglePref(field: 'shareTripLive' | 'twoFactorAuth', value: boolean, msg: string) {
    this.userService.updatePreferences({ [field]: value }).subscribe({
      next: (res) => {
        this.auth.setUser(res.user);
        this.toast.success(msg);
      },
      error: () => this.toast.error('Could not update setting')
    });
  }

  // Safety: save emergency contact
  saveEmergency() {
    this.userService
      .updatePreferences({ emergencyContact: this.emergencyContact })
      .subscribe({
        next: (res) => {
          this.auth.setUser(res.user);
          this.toast.success('Emergency contact saved');
        },
        error: () => this.toast.error('Could not save contact')
      });
  }

  // Safety: SOS
  triggerSos() {
    this.sosActive.set(true);
    const contact = this.user?.preferences?.emergencyContact;
    this.toast.error(
      contact
        ? `🚨 SOS sent! Alerting ${contact} and ACT ConnectRide Safety with your live location.`
        : '🚨 SOS sent to ACT ConnectRide Safety with your live location.'
    );
    setTimeout(() => this.sosActive.set(false), 5000);
  }

  shareTrip() {
    this.toast.success('🔗 Live trip link copied — share it with anyone you trust.');
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.toast.success('Logged out successfully');
  }

  @HostListener('document:click')
  onDocClick() {
    if (this.notifOpen()) this.closeNotif();
  }

  toggleMobileMenu(event: MouseEvent) {
    event.stopPropagation();
    this.mobileMenuOpen.update((v) => !v);
  }
  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }
}
