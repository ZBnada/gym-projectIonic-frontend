import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { Role } from './models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  // 🔹 Pages publiques
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.page').then((m) => m.SignupPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/tabs/home/home.page').then((m) => m.HomePage),
  },

  // 🔹 Routes UNIQUES avec tabs unifié
  {
    path: 'tabs',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      // ==================== ROUTES ADMIN ====================
      {
        path: 'admin-dashboard', // 🔥 Doit correspondre au tab="admin-dashboard"
        loadComponent: () => import('./pages/tabs/admin/admin-dashboard/admin-dashboard.page').then((m) => m.AdminDashboardPage),
        canActivate: [AuthGuard],
        data: { role: Role.ADMIN }
      },
      {
        path: 'users', // 🔥 Doit correspondre au tab="users"
        loadComponent: () => import('./pages/tabs/admin/users/users.page').then((m) => m.UsersPage),
        canActivate: [AuthGuard],
        data: { role: Role.ADMIN }
      },
      {
        path: 'offers-list', // 🔥 Doit correspondre au tab="offers-list"
        loadComponent: () => import('./pages/tabs/admin/offers-list/offers-list.page').then((m) => m.OffersListPage),
        data: { role: Role.ADMIN }
      },
      
  // 🔹 Routes supplémentaires pour les modals/pages hors tabs
  {
    path: 'add-offer',
    loadComponent: () => import('./pages/tabs/admin/add-offer/add-offer.page').then((m) => m.AddOfferPage),
    data: { role: Role.ADMIN }
  },
  {
    path: 'edit-offer/:id',
    loadComponent: () => import('./pages/tabs/admin/edit-offer/edit-offer.page').then((m) => m.EditOfferPage),
    data: { role: Role.ADMIN }
  },
  {
    path: 'offer-details/:id',
    loadComponent: () => import('./pages/tabs/admin/offer-details/offer-details.page').then((m) => m.OfferDetailsPage),
    data: { role: Role.ADMIN }
  },
  {
    path: 'add-user',
    loadComponent: () => import('./pages/tabs/admin/add-user/add-user.page').then((m) => m.AddUserPage),
    data: { role: Role.ADMIN }
  },
  {
    path: 'edit-user/:id',
    loadComponent: () => import('./pages/tabs/admin/edit-user/edit-user.page').then((m) => m.EditUserPage),
    data: { role: Role.ADMIN }
  },


      // ==================== ROUTES CLIENT ====================
      {
        path: 'home-membre', // 🔥 Doit correspondre au tab="home-membre"
        loadComponent: () => import('./pages/tabs/membre/client-dashboard/client-dashboard.page').then((m) => m.ClientDashboardPage),
        data: { role: Role.CLIENT }
      },
      {
        path: 'client-offres', // 🔥 Doit correspondre au tab="client-offres"
        loadComponent: () => import('./pages/tabs/membre/consulte-offre/consulte-offre.page').then((m) => m.ConsulteOffrePage),
        data: { role: Role.CLIENT }
      },

      // ==================== ROUTES COMMUNES ====================
      {
        path: 'profile', // 🔥 Doit correspondre au tab="profile"
        loadComponent: () => import('./pages/tabs/admin/profile/profile.page').then((m) => m.ProfilePage),
      },

      // ==================== REDIRECTIONS PAR DÉFAUT ====================
      // Redirection selon le rôle
      {
        path: '',
        redirectTo: 'home-membre',
        pathMatch: 'full'
      }
    ]
  },

  // 🔹 Fallback
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'client-dashboard',
    loadComponent: () => import('./pages/tabs/membre/client-dashboard/client-dashboard.page').then( m => m.ClientDashboardPage)
  }
];