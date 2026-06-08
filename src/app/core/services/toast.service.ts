import { Injectable, signal } from '@angular/core';

export interface ToastMsg {
  id: number;
  type: 'success' | 'error';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<ToastMsg[]>([]);
  private counter = 0;

  show(type: 'success' | 'error', message: string) {
    const id = ++this.counter;
    this.toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  success(message: string) {
    this.show('success', message);
  }
  error(message: string) {
    this.show('error', message);
  }

  dismiss(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
