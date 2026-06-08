import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ShellComponent } from './shared/components/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/auth.component').then((m) => m.AuthComponent)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'find', pathMatch: 'full' },
      {
        path: 'find',
        loadComponent: () =>
          import('./features/find-ride/find-ride.component').then(
            (m) => m.FindRideComponent
          )
      },
      {
        path: 'offer',
        loadComponent: () =>
          import('./features/offer-ride/offer-ride.component').then(
            (m) => m.OfferRideComponent
          )
      },
      {
        path: 'my-rides',
        loadComponent: () =>
          import('./features/my-rides/my-rides.component').then(
            (m) => m.MyRidesComponent
          )
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent
          )
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
