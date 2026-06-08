import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrap">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast {{ t.type }} show" (click)="toast.dismiss(t.id)">
          <div class="toast-icon">
            <i class="fa-solid" [class.fa-check]="t.type === 'success'" [class.fa-xmark]="t.type === 'error'"></i>
          </div>
          <div class="toast-msg">{{ t.message }}</div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-wrap {
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 400;
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: flex-end;
    }
    .toast {
      background: var(--card);
      border: 1px solid rgba(228,0,43,0.3);
      border-radius: var(--radius);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      max-width: 360px;
      cursor: pointer;
      animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes toastIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .toast.error { border-color: rgba(255,107,74,0.4); }
    .toast-icon {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; flex-shrink: 0;
    }
    .toast.success .toast-icon { background: rgba(43,217,128,0.15); color: var(--green); }
    .toast.error .toast-icon { background: rgba(255,107,74,0.15); color: var(--accent3); }
  `]
})
export class ToastComponent {
  toast = inject(ToastService);
}
