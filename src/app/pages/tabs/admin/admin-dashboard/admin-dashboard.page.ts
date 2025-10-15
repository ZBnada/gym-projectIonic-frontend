import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonButton, IonIcon, IonChip, IonProgressBar,
  IonButtons, IonAvatar, IonBadge, IonAlert
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  heartOutline, pulseOutline, logOutOutline, peopleOutline, 
  calendarOutline, barbellOutline, cashOutline, trendingUpOutline,
  timeOutline, constructOutline, menuOutline, notificationsOutline
} from 'ionicons/icons';

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
export class AdminDashboardPage implements OnInit {

  // Variables pour le header
  userPhoto: string = '';
  unreadNotifications = 3;
  showLogoutAlert = false;
  authToken: string | null = null;
  userData: any = null;

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

  constructor(private router: Router) {
    addIcons({
      heartOutline, pulseOutline, logOutOutline, peopleOutline,
      calendarOutline, barbellOutline, cashOutline, trendingUpOutline,
      timeOutline, constructOutline, menuOutline, notificationsOutline
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  // Charger les données utilisateur avec le token
  loadUserData() {
    // Récupérer le token du localStorage
    this.authToken = localStorage.getItem('authToken') || 
                    localStorage.getItem('token') || 
                    localStorage.getItem('accessToken');
    
    // Récupérer les données utilisateur
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      try {
        this.userData = JSON.parse(savedUserData);
      } catch (e) {
        console.error('Erreur parsing userData:', e);
      }
    }

    if (this.authToken && this.userData) {
      // Charger la photo de profil avec le token
      this.loadAdminProfile();
    } else {
      // Photo par défaut si pas de token
      this.userPhoto = this.getDefaultAvatar();
      console.warn('Token ou données utilisateur non trouvés dans le localStorage');
    }
    
    // Charger les notifications
    const savedNotifications = localStorage.getItem('unreadNotifications');
    if (savedNotifications) {
      this.unreadNotifications = parseInt(savedNotifications, 10);
    }
  }

  // Charger le profil admin avec le token
  loadAdminProfile() {
    if (!this.authToken || !this.userData) return;

    // Si l'URL de la photo est déjà dans les données utilisateur
    if (this.userData.photoUrl) {
      this.userPhoto = this.userData.photoUrl;
      return;
    }

    // Si vous avez besoin de faire un appel API pour récupérer la photo
    this.getProfilePhotoFromAPI().then((photoUrl: string) => {
      this.userPhoto = photoUrl;
    }).catch(error => {
      console.error('Erreur chargement photo profil:', error);
      this.userPhoto = this.getDefaultAvatar();
    });
  }

  // Méthode pour récupérer la photo depuis l'API
  private async getProfilePhotoFromAPI(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Simuler un appel API avec le token
      setTimeout(() => {
        if (this.authToken) {
          // En production, vous feriez:
          // return this.http.get('/api/admin/profile/photo', {
          //   headers: { 
          //     'Authorization': `Bearer ${this.authToken}`,
          //     'Content-Type': 'application/json'
          //   }
          // }).toPromise();
          
          // Simulation de réponse API
          const mockPhotoUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
          resolve(mockPhotoUrl);
        } else {
          reject('Token non disponible');
        }
      }, 300);
    });
  }

  // Avatar par défaut
  private getDefaultAvatar(): string {
    return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
  }

  // Gérer les erreurs de chargement d'image
  handleImageError(event: any) {
    console.log('Erreur de chargement de l\'image, utilisation de l\'image par défaut');
    event.target.src = this.getDefaultAvatar();
  }

  // Ouvrir le menu
  openMenu() {
    console.log('Ouvrir le menu latéral');
    // Implémentez votre logique de menu ici
  }

  // Ouvrir les notifications
  openNotifications() {
    console.log('Ouvrir les notifications');
    this.unreadNotifications = 0;
    localStorage.setItem('unreadNotifications', '0');
    // Implémentez votre logique de notifications ici
  }

  // Ouvrir le profil
  openProfile() {
    console.log('Ouvrir le profil admin');
    this.router.navigate(['/admin/profile']);
  }

  // Confirmation de déconnexion
  confirmLogout() {
    this.showLogoutAlert = true;
  }

  // Déconnexion
  logout() {
    // Supprimer toutes les données d'authentification
    const itemsToRemove = [
      'authToken',
      'token', 
      'accessToken',
      'refreshToken',
      'userData',
      'adminPermissions',
      'unreadNotifications'
    ];

    itemsToRemove.forEach(item => {
      localStorage.removeItem(item);
      sessionStorage.removeItem(item);
    });

    console.log('Déconnexion réussie - Token supprimé');
    
    // Rediriger vers la page de login
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  // Annuler la déconnexion
  onLogoutCancel() {
    this.showLogoutAlert = false;
  }

  // Navigation vers différentes sections
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

  // Méthode pour rafraîchir les données
  refreshData() {
    console.log('Rafraîchissement des données...');
    this.loadUserData(); // Recharger les données utilisateur
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return !!this.authToken;
  }
}