import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel,
  IonInput, IonAvatar, IonGrid, IonRow, IonCol, IonBadge, IonChip,
  AlertController, LoadingController
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
export class ProfilePage implements OnInit {

  // ==================== INJECTIONS ====================
  private authService = inject(AuthService);
  public router = inject(Router);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);

  // ==================== SIGNALS ====================
  user = signal<User | null>(null);
  isEditing = signal(false);
  isPasswordVisible = signal(false);

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

  constructor() {
    this.initializeIcons();
  }

  ngOnInit() {
    this.loadUserProfile();
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

  // ==================== GESTION PROFIL ====================

  /**
   * 🔹 Charger le profil utilisateur
   */
  async loadUserProfile(): Promise<void> {
    const loading = await this.showLoading('Chargement du profil...');
    
    this.authService.getCurrentUserFromToken().subscribe({
      next: (user) => {
        this.user.set(user);
        this.populateEditForm(user);
        loading.dismiss();
      },
      error: (err) => {
        console.error('Erreur chargement profil:', err);
        loading.dismiss();
        this.showError('Erreur lors du chargement du profil');
        this.router.navigate(['/login']);
      }
    });
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

  /**
   * 🔹 Obtenir l'URL de la photo de profil
   */
  getUserPhoto(): string {
    const user = this.user();
    return this.authService.getPhotoUrl(user?.photo);
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
   * 🔹 Naviguer vers la page d'accueil
   */
  navigateToHome(): void {
    this.router.navigate(['/tabs/home']);
  }

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