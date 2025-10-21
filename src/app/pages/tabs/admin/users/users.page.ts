import { Component, inject, OnInit, signal } from '@angular/core';
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
  AlertController
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
  trashOutline
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/member/auth.service';
import { User, Role } from 'src/app/models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http'; // Ajout important

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
export class UsersPage implements OnInit {

  users = signal<User[]>([]);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertController = inject(AlertController);

  searchTerm = signal('');
  filterRole = signal<'ALL' | 'ADMIN' | 'CLIENT'>('ALL');
  isLoading = signal(true);
  selectedUser: User | null = null;
  isModalOpen = false;
  userToDelete: User | null = null;

  // URL backend pour images
  private backendUrl = 'http://localhost:8091/uploads/';

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
      trashOutline
    });
  }

  ngOnInit() {
    this.loadUsers();
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
    return user.photo ? this.backendUrl + encodeURIComponent(user.photo) : 'assets/images/default-avatar.png';
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
    event.stopPropagation(); //  Empêche le clic de déclencher un autre événement
    this.router.navigate(['/tabs/edit-user', user.id]); // Redirection correcte
  }

  //deleteUser
  async deleteUser(user: User, event: Event) {
    event.stopPropagation(); // Empêche l'ouverture du modal
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
        // Supprimer l'utilisateur de la liste localement
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
  

  private async showSuccessAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Succès',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Erreur',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}