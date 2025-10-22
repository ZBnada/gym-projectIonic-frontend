import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonButton, IonIcon, IonGrid, IonRow, 
  IonCol, IonAvatar, IonBadge, IonProgressBar, IonChip, IonItem, 
  IonLabel, IonList, IonButtons, IonSpinner, IonPopover
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/member/auth.service';
import { User, Role } from 'src/app/models/user.model'; // AJOUT IMPORT Role
import { addIcons } from 'ionicons';
import {
  barbell, calendarOutline, trophyOutline, personCircleOutline,
  flameOutline, timeOutline, pulseOutline, starOutline,
  chevronForwardOutline, locationOutline, cashOutline,
  heartOutline, speedometerOutline, bodyOutline,
  playOutline, checkmarkOutline, arrowBackOutline,
  barbellOutline, logOutOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.page.html',
  styleUrls: ['./client-dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonIcon, IonGrid, IonRow,
    IonCol, IonAvatar, IonBadge, IonProgressBar, IonChip, IonItem,
    IonLabel, IonList, IonButtons, IonSpinner, IonPopover
  ]
})
export class ClientDashboardPage implements OnInit, OnDestroy {

  // ==================== INJECTIONS ====================
  private authService = inject(AuthService);
  private router = inject(Router);

  // ==================== SIGNALS ====================
  currentUser = signal<User | null>(null);
  isLoading = signal(true);

  // ==================== DONNÉES DE DÉMONSTRATION ====================
  quickStats = signal({
    workoutsThisWeek: 4,
    caloriesBurned: 1240,
    activeDays: 5,
    currentStreak: 7
  });

  todayWorkout = signal({
    name: 'Full Body Strength',
    time: '18:00 - 19:00',
    coach: 'Coach Sarah',
    location: 'Zone Musculation',
    completed: false
  });

  recentActivities = signal([
    { name: 'Cardio Training', duration: '45 min', calories: 320, date: 'Aujourd\'hui', type: 'cardio' },
    { name: 'Upper Body', duration: '60 min', calories: 280, date: 'Hier', type: 'strength' },
    { name: 'Yoga Flow', duration: '30 min', calories: 150, date: 'Il y a 2 jours', type: 'flexibility' }
  ]);

  fitnessGoals = signal([
    { name: 'Perte de poids', target: '5kg', progress: 60, current: '3kg' },
    { name: 'Force musculaire', target: '100kg', progress: 75, current: '75kg' },
    { name: 'Endurance', target: '10km', progress: 40, current: '4km' }
  ]);

  membershipInfo = signal({
    plan: 'Premium',
    expiry: '15 Déc 2024',
    daysLeft: 45,
    sessionsLeft: 12
  });

  constructor() {
    this.initializeIcons();
  }

  ngOnInit() {
    this.loadUserData();
    this.simulateDataLoading();
  }

  ngOnDestroy() {
    // Nettoyage si nécessaire
  }

  // ==================== INITIALISATION ====================

  private initializeIcons(): void {
    addIcons({
      barbell, calendarOutline, trophyOutline, personCircleOutline,
      flameOutline, timeOutline, pulseOutline, starOutline,
      chevronForwardOutline, locationOutline, cashOutline,
      heartOutline, speedometerOutline, bodyOutline,
      playOutline, checkmarkOutline, arrowBackOutline,
      barbellOutline, logOutOutline
    });
  }

  private loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser.set(user);
      console.log('Utilisateur chargé:', user);
    } else {
      this.loadUserFromToken();
    }
  }

  private loadUserFromToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId || payload.sub;
        
        if (userId) {
          this.authService.getUserById(userId).subscribe({
            next: (user) => {
              this.currentUser.set(user);
              console.log('Utilisateur chargé depuis API:', user);
            },
            error: (error) => {
              console.error('Erreur chargement utilisateur:', error);
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
      console.error('Token non trouvé');
      this.setDefaultUser();
    }
  }

  private setDefaultUser(): void {
    this.currentUser.set({
      id: 0,
      firstName: 'Utilisateur',
      lastName: '',
      email: '',
      role: Role.CLIENT, // CORRECTION ICI - Utilisation de l'enum
      photo: undefined
    });
  }

  private simulateDataLoading(): void {
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1500);
  }

  // ==================== GESTION PHOTOS ====================

  /**
   * 🔹 Obtenir l'URL de la photo de profil
   */
  getUserPhoto(): string {
    return this.authService.getPhotoUrl(this.currentUser()?.photo);
  }

  /**
   * 🔹 Vérifier si l'utilisateur a une photo
   */
  hasUserPhoto(): boolean {
    return !!this.currentUser()?.photo;
  }

  /**
   * 🔹 Gérer les erreurs de chargement d'image
   */
  handleImageError(event: any): void {
    console.log('Erreur de chargement de l\'image');
    event.target.style.display = 'none';
  }

  // ==================== NAVIGATION ====================

  /**
   * 🔹 Naviguer vers la page précédente
   */
  navigateBack(): void {
    this.router.navigate(['/tabs/users']);
  }

  /**
   * 🔹 Naviguer vers les programmes
   */
  navigateToWorkouts(): void {
    this.router.navigate(['/tabs/programs']);
  }

  /**
   * 🔹 Naviguer vers le planning
   */
  navigateToSchedule(): void {
    this.router.navigate(['/tabs/schedule']);
  }

  /**
   * 🔹 Naviguer vers la progression
   */
  navigateToProgress(): void {
    this.router.navigate(['/tabs/progress']);
  }

  /**
   * 🔹 Naviguer vers le profil
   */
  navigateToProfile(): void {
    this.router.navigate(['/tabs/profile']);
  }

  // ==================== ACTIONS ====================

  /**
   * 🔹 Démarrer une séance d'entraînement
   */
  startWorkout(): void {
    console.log('Démarrage de la séance...');
    // Implémentez la logique de démarrage de séance
    // Par exemple, navigation vers la page de séance en cours
  }

  /**
   * 🔹 Marquer la séance comme terminée
   */
  markWorkoutCompleted(): void {
    this.todayWorkout.update(workout => ({
      ...workout,
      completed: true
    }));
  }

  /**
   * 🔹 Déconnexion
   */
  async logout(): Promise<void> {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ==================== UTILITAIRES AFFICHAGE ====================

  /**
   * 🔹 Obtenir l'icône selon le type d'entraînement
   */
  getWorkoutTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'cardio': 'speedometer-outline',
      'strength': 'barbell-outline',
      'flexibility': 'body-outline',
      'yoga': 'body-outline',
      'hiit': 'flame-outline'
    };
    return icons[type] || 'barbell-outline';
  }

  /**
   * 🔹 Obtenir la couleur selon le type d'entraînement
   */
  getWorkoutTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'cardio': 'danger',
      'strength': 'primary',
      'flexibility': 'success',
      'yoga': 'success',
      'hiit': 'warning'
    };
    return colors[type] || 'medium';
  }

  /**
   * 🔹 Obtenir le nom complet de l'utilisateur
   */
  getFullName(): string {
    const user = this.currentUser();
    if (!user) return 'Utilisateur';
    
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur';
  }

  /**
   * 🔹 Obtenir l'email de l'utilisateur
   */
  getUserEmail(): string {
    return this.currentUser()?.email || 'Non spécifié';
  }

  /**
   * 🔹 Obtenir le rôle de l'utilisateur formaté
   */
  getUserRole(): string {
    const role = this.currentUser()?.role;
    return role === Role.ADMIN ? 'Administrateur' : 'Client';
  }

  /**
   * 🔹 Obtenir la couleur du rôle
   */
  getRoleColor(): string {
    const role = this.currentUser()?.role;
    return role === Role.ADMIN ? 'danger' : 'primary';
  }
}