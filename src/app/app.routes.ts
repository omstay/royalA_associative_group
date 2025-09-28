// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/admin-login/admin-login.component')
      .then(m => m.AdminLoginComponent)
  },
 { 
  path: 'register', 
  loadComponent: () => import('./components/admin-register/admin-register.component')
    .then(m => m.AdminRegisterComponent)  // <-- must match exported class name
},

  { 
    path: 'user-login', 
    loadComponent: () => import('./components/user-login/user-login')
      .then(m => m.UserLogin)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [() => import('./guards/auth-guard').then(m => m.AuthGuard)]
  },
  { 
    path: 'onboarding', 
    loadComponent: () => import('./components/onboarding/onboarding')
      .then(m => m.OnboardingComponent),
    canActivate: [() => import('./guards/auth-guard').then(m => m.AuthGuard)]
  },
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];

// Alternative simpler routes (if lazy loading doesn't work)
/*
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminRegisterComponent } from './components/admin-register/admin-register.component';
import { UserLoginComponent } from './components/user-login/user-login.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: AdminLoginComponent },
  { path: 'register', component: AdminRegisterComponent },
  { path: 'user-login', component: UserLoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'onboarding', component: OnboardingComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];
*/