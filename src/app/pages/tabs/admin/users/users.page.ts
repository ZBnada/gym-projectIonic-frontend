import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonRow,
  IonCol,
  IonSelect,
  IonSelectOption,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonChip,
  IonBadge,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonAlert,
  IonModal,
  IonItemDivider,
  AlertController,
  PopoverController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  menuOutline, 
  notifications, 
  addCircle, 
  chevronForwardCircle,
  searchOutline,
  filterOutline,
  personCircleOutline,
  callOutline,
  mailOutline,
  calendarOutline,
  trophyOutline,
  timeOutline,
  closeOutline,
  eyeOutline,
  ellipsisVerticalOutline,
  personAddOutline,
  barbell,
  createOutline,
  trashOutline,
  logOutOutline,
  speedometerOutline,
  personOutline
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/member/auth.service';
import { User, Role } from 'src/app/models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { UserMenuComponent } from './user-menu/user-menu.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonRow,
    IonCol,
    IonSelect,
    IonSelectOption,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonChip,
    IonBadge,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    IonModal,
    IonItemDivider,
    FormsModule,
    CommonModule
  ]
})
export class UsersPage implements OnInit, OnDestroy {

  users = signal<User[]>([]);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private popoverController = inject(PopoverController);

  searchTerm = signal('');
  filterRole = signal<'ALL' | 'ADMIN' | 'CLIENT'>('ALL');
  isLoading = signal(true);
  selectedUser: User | null = null;
  isModalOpen = false;
  userToDelete: User | null = null;

  // Informations de l'utilisateur connecté
  currentUser: User | null = null;

  private userSubscription: Subscription = new Subscription();

  constructor() {
    addIcons({ 
      menuOutline, 
      notifications, 
      addCircle, 
      chevronForwardCircle,
      searchOutline,
      filterOutline,
      personCircleOutline,
      callOutline,
      mailOutline,
      calendarOutline,
      trophyOutline,
      timeOutline,
      closeOutline,
      eyeOutline,
      ellipsisVerticalOutline,
      personAddOutline,
      barbell,
      createOutline,
      trashOutline,
      logOutOutline,
      speedometerOutline,
      personOutline
    });
    this.loadCurrentUser();
  }

  ngOnInit() {
    this.loadUsers();
    this.subscribeToUserChanges();
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  // S'abonner aux changements de l'utilisateur connecté
  private subscribeToUserChanges() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('Utilisateur connecté mis à jour:', user);
    });
  }

  // Charger les informations de l'utilisateur connecté depuis AuthService
  private loadCurrentUser() {
    // Récupérer depuis le localStorage via AuthService
    const savedUser = this.authService.getCurrentUser();
    if (savedUser) {
      this.currentUser = savedUser;
      console.log('Utilisateur chargé depuis localStorage:', savedUser);
    } else {
      // Si pas dans localStorage, essayer de récupérer depuis le token
      this.loadUserFromToken();
    }
  }

  // Charger l'utilisateur depuis le token
  private loadUserFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        
        // Récupérer l'utilisateur complet depuis la base de données
        const userId = payload.userId || payload.sub;
        if (userId) {
          this.authService.getUserById(userId).subscribe({
            next: (user) => {
              this.currentUser = user;
              console.log('Utilisateur chargé depuis API:', user);
            },
            error: (error) => {
              console.error('Erreur chargement utilisateur depuis API:', error);
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

  private setDefaultUser() {
    this.currentUser = {
      id: 0,
      firstName: 'Utilisateur',
      lastName: '',
      email: '',
      role: Role.CLIENT,
      photo: undefined
    };
  }

  // Obtenir la photo de l'utilisateur connecté via AuthService
  getCurrentUserPhoto(): string {
    return this.authService.getPhotoUrl(this.currentUser?.photo);
  }

  // Vérifier si l'utilisateur a une photo
  hasUserPhoto(): boolean {
    return !!this.currentUser?.photo;
  }

  // Gérer les erreurs de chargement d'image
  handleImageError(event: any) {
    console.log('Erreur de chargement de l\'image, utilisation de l\'icône par défaut');
    event.target.style.display = 'none';
    // L'icône sera affichée automatiquement via le template
  }

  // Ouvrir le menu dropdown utilisateur
  async openUserMenu(event: any) {
    const popover = await this.popoverController.create({
      component: UserMenuComponent,
      event: event,
      translucent: true,
      side: 'bottom',
      alignment: 'end',
      cssClass: 'user-menu-popover'
    });

    // Gérer les actions du menu
    popover.onDidDismiss().then((result) => {
      if (result.data) {
        this.handleMenuAction(result.data.action);
      }
    });

    await popover.present();
  }

  // Gérer les actions du menu
  private handleMenuAction(action: string) {
    switch (action) {
      case 'dashboard':
        this.router.navigate(['/tabs/admin-dashboard']);
        break;
      case 'profile':
        this.router.navigate(['/tabs/profile']);
        break;
      case 'logout':
        this.logout();
        break;
    }
  }

  // Déconnexion
  private logout() {
    this.alertController.create({
      header: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Déconnecter',
          handler: () => {
            this.performLogout();
          }
        }
      ]
    }).then(alert => alert.present());
  }

  private performLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadUsers() {
    this.isLoading.set(true);
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
        this.isLoading.set(false);
      }
    });
  }

  doRefresh(event: any) {
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        event.target.complete();
      },
      error: (err) => {
        console.error('Erreur lors du rafraîchissement', err);
        event.target.complete();
      }
    });
  }

  get filteredUsers() {
    return this.users().filter(user => {
      const matchesRole = this.filterRole() === 'ALL' || user.role === this.filterRole();
      const matchesSearch = user.firstName.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
                            user.lastName.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
                            user.email.toLowerCase().includes(this.searchTerm().toLowerCase());
      return matchesRole && matchesSearch;
    });
  }

  getUserPhoto(user: User): string {
    return this.authService.getPhotoUrl(user.photo);
  }

  getMembershipStatusColor(status: string | undefined): string {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'danger';
      case 'PENDING': return 'warning';
      default: return 'medium';
    }
  }

  getMembershipStatusText(status: string | undefined): string {
    switch (status) {
      case 'ACTIVE': return 'Actif';
      case 'INACTIVE': return 'Inactif';
      case 'PENDING': return 'En attente';
      default: return 'Non défini';
    }
  }

  getRoleColor(role: Role): string {
    return role === Role.ADMIN ? 'danger' : 'primary';
  }

  getRoleText(role: Role): string {
    return role === Role.ADMIN ? 'Administrateur' : 'Client';
  }

  openUserDetails(user: User) {
    this.selectedUser = user;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedUser = null;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Non défini';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getDaysRemaining(endDate: Date | undefined): string {
    if (!endDate) return 'Non défini';
    
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expiré';
    if (diffDays === 0) return 'Dernier jour';
    return `${diffDays} jours`;
  }

  // Navigation vers la page d'ajout d'utilisateur
  navigateToAddUser() {
    this.router.navigate(['/tabs/add-user']);
  }

  // Édition d'utilisateur
  editUser(user: User, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/tabs/edit-user', user.id]);
  }

  // Suppression d'utilisateur
  async deleteUser(user: User, event: Event) {
    event.stopPropagation();
    this.userToDelete = user;
    
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Voulez-vous vraiment supprimer ${user.firstName} ${user.lastName} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => { this.userToDelete = null; }
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => { this.confirmDelete(); }
        }
      ]
    });
  
    await alert.present();
  }
  
  private confirmDelete() {
    if (!this.userToDelete?.id) return;
  
    this.authService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.users.set(this.users().filter(u => u.id !== this.userToDelete?.id));
        this.userToDelete = null;
        this.showAlert('Succès', 'Utilisateur supprimé avec succès');
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.showAlert('Erreur', 'Impossible de supprimer cet utilisateur');
        this.userToDelete = null;
      }
    });
  }
  
  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}