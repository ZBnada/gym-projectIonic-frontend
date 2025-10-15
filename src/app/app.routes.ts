import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  // Pages publiques
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
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/tabs/home/home.page').then((m) => m.HomePage)
  },

  // Pages protégées
  {
    path: 'tabs',
    canActivate: [AuthGuard], // ✅ Protection ici
    loadComponent: () =>
      import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
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
      {
        path: 'admin-dashboard',
        loadComponent: () => import('./pages/tabs/admin/admin-dashboard/admin-dashboard.page').then(m => m.AdminDashboardPage),
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' } // 🔹 Seuls les admins peuvent accéder
      },
      {
        path: 'add-user',
        loadComponent: () => 
          import('./pages/tabs/admin/add-user/add-user.page').then(m => m.AddUserPage),
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' } // Seulement pour les admins
      },
      {
        path: 'members',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/tabs/members/members.page').then(
                (m) => m.MembersPage
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/tabs/member-detail/member-detail.page').then(
                (m) => m.MemberDetailPage
              ),
          },
        ],
      },
      {
        path: 'stats',
        loadComponent: () =>
          import('./pages/tabs/stats/stats.page').then((m) => m.StatsPage),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./pages/tabs/account/account.page').then(
            (m) => m.AccountPage
          ),
      },
    ],
  },
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./pages/tabs/admin/admin-dashboard/admin-dashboard.page').then( m => m.AdminDashboardPage)
  },
  {
    path: 'add-user',
    loadComponent: () => import('./pages/tabs/admin/add-user/add-user.page').then( m => m.AddUserPage)
  },

 
];
