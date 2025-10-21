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

      const requiredRole = route.data['role'] as Role | undefined;

      if (requiredRole && payload.role !== requiredRole) {
        // l'utilisateur est connecté mais n'a pas le rôle requis
        this.router.navigate(['/home']); // ou une page "Accès refusé"
        return false;
      }

      return true; // ✅ Utilisateur connecté et rôle correct (ou pas de rôle requis)
    } catch {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
