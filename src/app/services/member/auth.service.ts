import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Role, User } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = 'http://localhost:8091/api/users';
  private readonly backendUrl = 'http://localhost:8091/uploads/';
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // ==================== GESTION UTILISATEUR ====================

  /**
   * 🔹 Charger l'utilisateur depuis le localStorage
   */
  private loadUserFromStorage(): void {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur parsing currentUser:', error);
        this.clearStorage();
      }
    }
  }

  /**
   * 🔹 Récupérer l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * 🔹 Récupérer l'utilisateur depuis le token JWT
   */
  getCurrentUserFromToken(): Observable<User> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Aucun token trouvé'));
    }

    const decoded = this.decodeToken(token);
    const userId = decoded?.userId || decoded?.sub;

    if (!userId) {
      return throwError(() => new Error('ID utilisateur non trouvé dans le token'));
    }

    return this.getUserById(userId);
  }

  /**
   * 🔹 Mettre à jour l'utilisateur courant
   */
  private updateUserInfo(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // ==================== OPÉRATIONS UTILISATEUR ====================

  /**
   * 🔹 Récupérer un utilisateur par ID
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * 🔹 Récupérer un utilisateur par email
   */
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/email/${email}`);
  }

  /**
   * 🔹 Obtenir tous les utilisateurs
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`);
  }

  // ==================== AUTHENTIFICATION ====================

  /**
   * 🔹 Inscription
   */
  signup(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, formData, { 
      responseType: 'text' 
    });
  }

  /**
   * 🔹 Connexion
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { 
      email, 
      pwd: password 
    }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          // Charger les infos utilisateur complètes
          this.getUserByEmail(email).subscribe(user => {
            this.updateUserInfo(user);
          });
        }
      })
    );
  }

  /**
   * 🔹 Déconnexion
   */
  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
  }

  /**
   * 🔹 Vérifier si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * 🔹 Obtenir le rôle actuel
   */
  getRole(): Role | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  // ==================== GESTION PROFIL ====================

  /**
   * 🔹 Mettre à jour le profil utilisateur
   */
  updateUserProfile(userId: number, userData: any): Observable<User> {
    const formData = new FormData();
    
    Object.keys(userData).forEach(key => {
      if (userData[key] !== null && userData[key] !== undefined) {
        formData.append(key, userData[key].toString());
      }
    });

    return this.http.put<User>(`${this.apiUrl}/${userId}`, formData).pipe(
      tap(updatedUser => this.updateUserInfo(updatedUser))
    );
  }

  /**
   * 🔹 Changer le mot de passe (avec ID utilisateur)
   */
  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<any> {
    const formData = new FormData();
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);

    return this.http.put(`${this.apiUrl}/${userId}/change-password`, formData, {
      responseType: 'text'
    });
  }

  /**
   * 🔹 Changer le mot de passe (avec email)
   */
  changePasswordByEmail(email: string, currentPassword: string, newPassword: string): Observable<any> {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);

    return this.http.put(`${this.apiUrl}/change-password`, formData, {
      responseType: 'text'
    });
  }

  // ==================== ADMINISTRATION ====================

  /**
   * 🔹 Ajouter un utilisateur (admin)
   */
  addUser(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/addUser`, formData, { 
      responseType: 'text' 
    });
  }

  /**
   * 🔹 Modifier un utilisateur
   */
  editUser(id: number, formData: FormData): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * 🔹 Supprimer un utilisateur
   */
  deleteUser(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'text'
    });
  }

  // ==================== UTILITAIRES ====================

  /**
   * 🔹 Obtenir l'URL complète de la photo
   */
  getPhotoUrl(photoPath: string | undefined): string {
    if (!photoPath) {
      return 'assets/images/default-avatar.png';
    }
    return `${this.backendUrl}${encodeURIComponent(photoPath)}`;
  }

  /**
   * 🔹 Rafraîchir les données utilisateur
   */
  refreshUserData(): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.email) {
      return throwError(() => new Error('Aucun email utilisateur disponible'));
    }

    return this.getUserByEmail(currentUser.email).pipe(
      tap(user => this.updateUserInfo(user))
    );
  }

  // ==================== PRIVÉ ====================

  /**
   * 🔹 Décode un token JWT
   */
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Erreur decoding token:', error);
      return null;
    }
  }

  /**
   * 🔹 Nettoyer le stockage
   */
  private clearStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }
}