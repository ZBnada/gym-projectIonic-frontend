import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel,
  IonInput, IonAvatar, IonGrid, IonRow, IonCol, IonBadge, IonChip,
  AlertController, LoadingController,
  PopoverController // AJOUT IMPORT
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, logOutOutline, personCircleOutline, mailOutline,
  callOutline, trophyOutline, calendarOutline, timeOutline, barbell,
  createOutline, lockClosedOutline, eyeOutline, eyeOffOutline,
  checkmarkOutline, closeOutline
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/member/auth.service';
import { User, Role } from 'src/app/models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { UserMenuComponent } from './user-menu/user-menu.component'; // AJOUT IMPORT

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel,
    IonInput, IonAvatar, IonGrid, IonRow, IonCol, IonBadge, IonChip,
    FormsModule, CommonModule
  ]
})
export class ProfilePage implements OnInit, OnDestroy {

  // ==================== INJECTIONS ====================
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private popoverController = inject(PopoverController); // AJOUT INJECTION

  // ==================== SIGNALS ====================
  user = signal<User | null>(null);
  isEditing = signal(false);
  isPasswordVisible = signal(false);
  isLoading = signal(true);

  // ==================== FORMULAIRES ====================
  editForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: Role.CLIENT,
    pwd: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  private userSubscription: Subscription = new Subscription();

  constructor() {
    this.initializeIcons();
  }

  ngOnInit() {
    this.loadUserProfile();
    this.subscribeToUserChanges();
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  // ==================== INITIALISATION ====================

  private initializeIcons(): void {
    addIcons({
      arrowBackOutline, logOutOutline, personCircleOutline, mailOutline,
      callOutline, trophyOutline, calendarOutline, timeOutline, barbell,
      createOutline, lockClosedOutline, eyeOutline, eyeOffOutline,
      checkmarkOutline, closeOutline
    });
  }

  // ==================== GESTION UTILISATEUR ====================

  /**
   * 🔹 S'abonner aux changements de l'utilisateur
   */
  private subscribeToUserChanges(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user.set(user);
        this.populateEditForm(user);
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
      this.populateEditForm(currentUser);
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
              this.populateEditForm(user);
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
      firstName: 'Utilisateur',
      lastName: '',
      email: '',
      role: Role.CLIENT,
      photo: undefined
    });
    this.isLoading.set(false);
  }

  private populateEditForm(user: User): void {
    this.editForm = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone?.toString() || '',
      role: user.role || Role.CLIENT,
      pwd: ''
    };
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

  // ==================== ÉDITION PROFIL ====================

  /**
   * 🔹 Démarrer l'édition du profil
   */
  startEditing(): void {
    this.isEditing.set(true);
  }

  /**
   * 🔹 Annuler l'édition
   */
  cancelEditing(): void {
    this.isEditing.set(false);
    if (this.user()) {
      this.populateEditForm(this.user()!);
    }
  }

  /**
   * 🔹 Sauvegarder les modifications du profil
   */
  async saveProfile(): Promise<void> {
    const userId = this.getUserId();
    if (!userId) {
      this.showError('ID utilisateur non disponible');
      return;
    }

    if (!this.isFormValid()) {
      this.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const loading = await this.showLoading('Sauvegarde en cours...');

    try {
      const formData = new FormData();
      
      // Champs obligatoires
      formData.append('firstName', this.editForm.firstName);
      formData.append('lastName', this.editForm.lastName);
      formData.append('email', this.editForm.email);
      formData.append('role', this.editForm.role.toString());
      
      // Champs optionnels
      if (this.editForm.phone) {
        formData.append('phone', this.editForm.phone.toString());
      }
      
      // Mot de passe optionnel
      if (this.editForm.pwd && this.editForm.pwd.trim() !== '') {
        formData.append('pwd', this.editForm.pwd);
      }

      this.authService.editUser(userId, formData).subscribe({
        next: (updatedUser) => {
          this.user.set(updatedUser);
          this.isEditing.set(false);
          loading.dismiss();
          this.showSuccess('Profil mis à jour avec succès');
        },
        error: (err) => {
          console.error('Erreur sauvegarde:', err);
          loading.dismiss();
          this.handleSaveError(err);
        }
      });

    } catch (error) {
      console.error('Erreur préparation données:', error);
      loading.dismiss();
      this.showError('Erreur lors de la préparation des données');
    }
  }

  // ==================== GESTION MOT DE PASSE ====================

  /**
   * 🔹 Changer le mot de passe
   */
  async changePassword(): Promise<void> {
    if (!this.isPasswordFormValid()) {
      this.showError('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.showError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const loading = await this.showLoading('Changement du mot de passe...');
    const userId = this.getUserId();
    
    this.authService.changePassword(
      userId,
      this.passwordForm.currentPassword,
      this.passwordForm.newPassword
    ).subscribe({
      next: () => {
        loading.dismiss();
        this.resetPasswordForm();
        this.showSuccess('Mot de passe changé avec succès');
      },
      error: (err) => {
        console.error('Erreur changement mot de passe:', err);
        loading.dismiss();
        this.handlePasswordError(err);
      }
    });
  }

  /**
   * 🔹 Basculer la visibilité du mot de passe
   */
  togglePasswordVisibility(): void {
    this.isPasswordVisible.set(!this.isPasswordVisible());
  }

  // ==================== NAVIGATION ====================

  /**
   * 🔹 Naviguer vers la page des utilisateurs
   */
  navigateToUsers(): void {
    this.router.navigate(['/tabs/users']);
  }

  // ==================== DÉCONNEXION ====================

  /**
   * 🔹 Déconnexion de l'utilisateur
   */
  async logout(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { 
          text: 'Déconnexion', 
          role: 'destructive',
          handler: () => this.confirmLogout()
        }
      ]
    });

    await alert.present();
  }

  private confirmLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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
        this.router.navigate(['/tabs/admin-dashboard']);
        break;
      case 'profile':
        // Déjà sur la page profile, ne rien faire
        break;
      case 'logout':
        this.logout();
        break;
    }
  }

  // ==================== UTILITAIRES AFFICHAGE ====================

  getRoleColor(role: Role): string {
    return role === Role.ADMIN ? 'danger' : 'primary';
  }

  getRoleText(role: Role): string {
    return role === Role.ADMIN ? 'Administrateur' : 'Client';
  }

  getMembershipStatusColor(status: string | undefined): string {
    const statusColors: { [key: string]: string } = {
      'ACTIVE': 'success',
      'INACTIVE': 'danger',
      'PENDING': 'warning'
    };
    return statusColors[status || ''] || 'medium';
  }

  getMembershipStatusText(status: string | undefined): string {
    const statusTexts: { [key: string]: string } = {
      'ACTIVE': 'Actif',
      'INACTIVE': 'Inactif',
      'PENDING': 'En attente'
    };
    return statusTexts[status || ''] || 'Non défini';
  }

  formatDate(date: Date | undefined): string {
    return date ? new Date(date).toLocaleDateString('fr-FR') : 'Non défini';
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

  // ==================== VALIDATION ====================

  private isFormValid(): boolean {
    return !!(this.editForm.firstName && this.editForm.lastName && this.editForm.email);
  }

  private isPasswordFormValid(): boolean {
    return this.passwordForm.newPassword === this.passwordForm.confirmPassword;
  }

  // ==================== GESTION ERREURS ====================

  private handleSaveError(err: any): void {
    let errorMessage = 'Erreur lors de la mise à jour du profil';
    
    if (err.status === 403) {
      errorMessage = 'Accès interdit - Vous n\'avez pas les permissions nécessaires';
    } else if (err.status === 400) {
      errorMessage = 'Données invalides - Vérifiez les informations saisies';
    } else if (err.status === 404) {
      errorMessage = 'Utilisateur non trouvé';
    }
    
    this.showError(errorMessage);
  }

  private handlePasswordError(err: any): void {
    const errorMessage = err.status === 401 
      ? 'Mot de passe actuel incorrect' 
      : 'Erreur lors du changement de mot de passe';
    this.showError(errorMessage);
  }

  // ==================== UTILITAIRES INTERNES ====================

  private getUserId(): number {
    const user = this.user();
    if (!user?.id) {
      throw new Error('ID utilisateur non disponible');
    }
    return user.id;
  }

  private resetPasswordForm(): void {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  private async showLoading(message: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({ message });
    await loading.present();
    return loading;
  }

  private async showSuccess(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Succès',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showError(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Erreur',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}