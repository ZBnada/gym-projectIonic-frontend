import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Role } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole: Role = payload.role;

      const requiredRole = route.data['role'] as Role | undefined;

      if (requiredRole && payload.role !== requiredRole) {
        // Rediriger vers la page appropriée selon le rôle
        this.redirectBasedOnRole(userRole);
        return false;
      }

      return true; // ✅ Utilisateur connecté et rôle correct
    } catch {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      return false;
    }
  }

  private redirectBasedOnRole(role: Role): void {
    switch(role) {
      case Role.ADMIN:
        this.router.navigate(['/tabs/admin-dashboard']);
        break;
      case Role.CLIENT:
      default:
        this.router.navigate(['/tabs/home-membre']);
        break;
    }
  }
}