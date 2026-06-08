import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  mode = signal<'login' | 'register'>('login');
  loading = signal(false);

  email = '';
  password = '';
  name = '';
  phone = '';
  city = 'Bangalore';

  switchMode(m: 'login' | 'register') {
    this.mode.set(m);
  }

  fillDemo() {
    this.email = 'teja@actcorp.in';
    this.password = 'password123';
    this.mode.set('login');
  }

  submit() {
    if (this.loading()) return;
    if (!this.email || !this.password || (this.mode() === 'register' && (!this.name || !this.phone))) {
      this.toast.error('Please fill all required fields (including phone)');
      return;
    }
    this.loading.set(true);

    const obs =
      this.mode() === 'login'
        ? this.auth.login(this.email, this.password)
        : this.auth.register({
            name: this.name,
            email: this.email,
            password: this.password,
            phone: this.phone,
            city: this.city
          });

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success(
          this.mode() === 'login' ? 'Welcome back!' : 'Account created!'
        );
        this.router.navigate(['/find']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err?.error?.message || 'Something went wrong');
      }
    });
  }
}
