import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonButton, IonIcon, IonChip, IonProgressBar,
  IonButtons, IonAvatar, IonBadge, IonAlert,
  PopoverController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  heartOutline, pulseOutline, logOutOutline, peopleOutline, 
  calendarOutline, barbellOutline, cashOutline, trendingUpOutline,
  timeOutline, constructOutline, menuOutline, notificationsOutline,
  personCircleOutline
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/member/auth.service';
import { UserMenuComponent } from './user-menu/user-menu.component';
import { User, Role } from 'src/app/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonIcon, IonChip, IonProgressBar,
    IonButtons, IonAvatar, IonBadge, IonAlert
  ]
})
export class AdminDashboardPage implements OnInit, OnDestroy {

  // ==================== INJECTIONS ====================
  private authService = inject(AuthService);
  private popoverController = inject(PopoverController);
  private router = inject(Router);

  // ==================== SIGNALS ====================
  user = signal<User | null>(null);
  isLoading = signal(true);

  // Variables pour le header
  unreadNotifications = 3;
  showLogoutAlert = false;

  // Boutons pour l'alerte
  alertButtons = [
    {
      text: 'Annuler',
      role: 'cancel',
      handler: () => {
        this.onLogoutCancel();
      }
    },
    {
      text: 'Déconnexion',
      role: 'confirm',
      handler: () => {
        this.logout();
      }
    }
  ];

  // Données pour les programmes d'entraînement
  workoutPrograms = ['All type', 'Strength', 'Chest', 'Arm', 'Cardio', 'Yoga', 'CrossFit'];

  // Total des tâches
  totalTasks = 24;

  // Jours précédents
  previousDays = [12, 13, 14];

  // Date actuelle
  currentDate = '15 Jun';

  // Statistiques du jour
  todayStats = {
    workouts: 18,
    members: 17
  };

  // Jours de la semaine
  weekDays = [
    { name: 'Mon', active: false },
    { name: 'Tue', active: true },
    { name: 'Wed', active: false },
    { name: 'Thu', active: false },
    { name: 'Fri', active: false },
    { name: 'Sat', active: false }
  ];

  // Statistiques de la salle de sport
  gymStats = {
    activeMembers: 524,
    monthlyRevenue: 15420,
    weeklyClasses: 48,
    classAttendance: 12,
    equipmentCount: 89,
    maintenanceNeeded: 3
  };

  private userSubscription: Subscription = new Subscription();

  constructor() {
    addIcons({
      heartOutline, pulseOutline, logOutOutline, peopleOutline,
      calendarOutline, barbellOutline, cashOutline, trendingUpOutline,
      timeOutline, constructOutline, menuOutline, notificationsOutline,
      personCircleOutline
    });
  }

  ngOnInit() {
    this.loadUserProfile();
    this.subscribeToUserChanges();
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  // ==================== GESTION UTILISATEUR ====================

  /**
   * 🔹 S'abonner aux changements de l'utilisateur
   */
  private subscribeToUserChanges(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user.set(user);
        this.isLoading.set(false);
        console.log('Utilisateur connecté mis à jour:', user);
      }
    });
  }

  /**
   * 🔹 Charger le profil utilisateur
   */
  private loadUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.set(currentUser);
      this.isLoading.set(false);
      console.log('Profil chargé depuis localStorage:', currentUser);
    } else {
      this.loadUserFromToken();
    }
  }

  /**
   * 🔹 Charger l'utilisateur depuis le token
   */
  private loadUserFromToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        
        const userId = payload.userId || payload.sub;
        if (userId) {
          this.authService.getUserById(userId).subscribe({
            next: (user) => {
              this.user.set(user);
              this.isLoading.set(false);
              console.log('Profil chargé depuis API:', user);
            },
            error: (error) => {
              console.error('Erreur chargement profil depuis API:', error);
              this.setDefaultUser();
            }
          });
        } else {
          this.setDefaultUser();
        }
      } catch (error) {
        console.error('Erreur décodage token:', error);
        this.setDefaultUser();
      }
    } else {
      console.error('Token non trouvé dans le localStorage');
      this.setDefaultUser();
    }
  }

  private setDefaultUser(): void {
    this.user.set({
      id: 0,
      firstName: 'Administrateur',
      lastName: '',
      email: '',
      role: Role.ADMIN,
      photo: undefined
    });
    this.isLoading.set(false);
  }

  // ==================== GESTION PHOTOS ====================

  /**
   * 🔹 Obtenir l'URL de la photo de profil
   */
  getUserPhoto(): string {
    return this.authService.getPhotoUrl(this.user()?.photo);
  }

  /**
   * 🔹 Vérifier si l'utilisateur a une photo
   */
  hasUserPhoto(): boolean {
    return !!this.user()?.photo;
  }

  /**
   * 🔹 Gérer les erreurs de chargement d'image
   */
  handleImageError(event: any): void {
    console.log('Erreur de chargement de l\'image');
    event.target.style.display = 'none';
  }

  // ==================== MENU DROPDOWN ====================

  /**
   * 🔹 Ouvrir le menu utilisateur
   */
  async openUserMenu(event: any): Promise<void> {
    const popover = await this.popoverController.create({
      component: UserMenuComponent,
      event: event,
      translucent: true,
      side: 'bottom',
      alignment: 'end',
      cssClass: 'user-menu-popover'
    });

    // Gérer les actions du menu
    popover.onDidDismiss().then((result: any) => {
      if (result.data) {
        this.handleMenuAction(result.data.action);
      }
    });

    await popover.present();
  }

  /**
   * 🔹 Gérer les actions du menu
   */
  private handleMenuAction(action: string): void {
    switch (action) {
      case 'dashboard':
        // Déjà sur le dashboard, ne rien faire
        break;
      case 'profile':
        this.router.navigate(['/tabs/profile']);
        break;
      case 'logout':
        this.confirmLogout();
        break;
    }
  }

  // ==================== MÉTHODES EXISTANTES ====================

  openMenu() {
    console.log('Ouvrir le menu latéral');
  }

  openNotifications() {
    console.log('Ouvrir les notifications');
    this.unreadNotifications = 0;
    localStorage.setItem('unreadNotifications', '0');
  }

  openProfile() {
    console.log('Ouvrir le profil admin');
    this.router.navigate(['/tabs/profile']);
  }

  confirmLogout() {
    this.showLogoutAlert = true;
  }

  logout() {
    // Utiliser AuthService pour la déconnexion
    this.authService.logout();
    
    console.log('Déconnexion réussie via AuthService');
    
    // Rediriger vers la page de login
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  onLogoutCancel() {
    this.showLogoutAlert = false;
  }

  navigateTo(section: string) {
    switch(section) {
      case 'members':
        this.router.navigate(['/admin/members']);
        break;
      case 'classes':
        this.router.navigate(['/admin/classes']);
        break;
      case 'equipment':
        this.router.navigate(['/admin/equipment']);
        break;
      case 'finance':
        this.router.navigate(['/admin/finance']);
        break;
    }
  }

  refreshData() {
    console.log('Rafraîchissement des données...');
    this.loadUserProfile();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // ==================== UTILITAIRES AFFICHAGE ====================

  getUserName(): string {
    const user = this.user();
    if (!user) return 'Administrateur';
    return `${user.firstName} ${user.lastName}`.trim();
  }

  getUserEmail(): string {
    return this.user()?.email || 'Non défini';
  }

  getUserRole(): string {
    const user = this.user();
    if (!user) return 'Administrateur';
    return user.role === Role.ADMIN ? 'Administrateur' : 'Client';
  }
}