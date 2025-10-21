import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  // 🔹 Pages publiques (sans authentification)
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage)
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup.page').then((m) => m.SignupPage)
  },

  // 🔹 Pages protégées avec layout tabs
  {
    path: 'tabs',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },

      // 🔸 Tab Home (accessible à tous)
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/tabs/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'home-membre',
        loadComponent: () =>
          import('./pages/tabs/membre/home-membre/home-membre.page').then(
            (m) => m.HomeMembrePage
          ),
      },

      // 🔸 Tab Users (réservé ADMIN)
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/tabs/admin/users/users.page').then(
            (m) => m.UsersPage
          ),
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' }
      },
      {
        path: 'add-user',
        loadComponent: () =>
          import('./pages/tabs/admin/add-user/add-user.page').then(
            (m) => m.AddUserPage
          ),
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' }
      },
      {
        path: 'edit-user/:id',
        loadComponent: () =>
          import('./pages/tabs/admin/edit-user/edit-user.page').then(
            (m) => m.EditUserPage
          ),
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' }
      },
      {
        path: 'admin-dashboard',
        loadComponent: () =>
          import('./pages/tabs/admin/admin-dashboard/admin-dashboard.page').then(
            (m) => m.AdminDashboardPage
          ),
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' }
      },

      // 🔸 Tab Stats (accessible à tous)
      {
        path: 'stats',
        loadComponent: () =>
          import('./pages/tabs/stats/stats.page').then((m) => m.StatsPage),
      },

      // 🔸 Tab Profile (accessible à tous les utilisateurs connectés)
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/tabs/admin/profile/profile.page').then(
            (m) => m.ProfilePage
          ),
      }
    ],
  },

  // 🔹 Pages standalone (hors tabs)
  {
    path: 'profile-standalone',
    loadComponent: () => 
      import('./pages/tabs/admin/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [AuthGuard]
  },

  // 🔹 Fallback - Redirection vers login pour les routes inconnues
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];