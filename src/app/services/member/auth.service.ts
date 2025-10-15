import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Role, User } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8091/api/users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // 🔹 Charger l'utilisateur depuis le localStorage
  private loadUserFromStorage(): void {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur parsing currentUser:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    }
  }

  // 🔹 Récupérer l'utilisateur actuel
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // 🔹 Décode un token JWT
  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Erreur decoding token:', error);
      return null;
    }
  }

  // 🔹 Récupérer les infos utilisateur depuis le token
  getUserInfoFromToken(): { firstName: string; lastName: string; email: string; role: Role } | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = this.decodeToken(token);
    if (!decoded) return null;

    return {
      firstName: decoded.firstName || decoded.sub,
      lastName: decoded.lastName || '',
      email: decoded.email || decoded.sub,
      role: decoded.role || Role.CLIENT
    };
  }

  // 🔹 Mettre à jour l'utilisateur courant
  updateUserInfo(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // 🔹 Récupérer un utilisateur par email
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${email}`);
  }

  // 🔹 Inscription classique
  signup(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, formData, { responseType: 'text' });
  }

  // 🔹 Ajouter un utilisateur (admin/client avec photo)
  addUser(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/addUser`, formData, { responseType: 'text' });
  }

  // 🔹 Connexion
  login(email: string, pwd: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, pwd }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);

          // Charger les infos complètes depuis le backend
          this.getUserByEmail(email).subscribe(user => {
            this.updateUserInfo(user);
          });
        }
      })
    );
  }

  // 🔹 Déconnexion
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // 🔹 Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // 🔹 Retourne le rôle actuel
  getRole(): Role | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  // 🔹 Rafraîchir les données utilisateur depuis le backend
  refreshUserData(): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.email) {
      throw new Error('Aucun email utilisateur disponible');
    }

    return this.getUserByEmail(currentUser.email).pipe(
      tap(user => this.updateUserInfo(user))
    );
  }
}
