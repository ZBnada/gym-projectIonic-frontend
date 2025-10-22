import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  AlertController, 
  LoadingController,
  ModalController,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonGrid, IonRow, IonCol, IonSelect, IonSelectOption,
  IonSearchbar, IonSpinner, IonFab, IonFabButton, IonBadge,
  IonAvatar, PopoverController
} from '@ionic/angular/standalone';
import { OfferService } from 'src/app/services/offer.service';
import { Offer } from 'src/app/models/offer.model';
import { AuthService } from 'src/app/services/member/auth.service';
import { UserMenuComponent } from './user-menu/user-menu.component';
import { User, Role } from 'src/app/models/user.model';
import { addIcons } from 'ionicons';
import { 
  menuOutline, 
  addOutline, 
  closeOutline, 
  barbell,
  notifications,
  personAddOutline,
  searchOutline,
  ellipsisVerticalOutline,
  createOutline,
  trashOutline,
  documentOutline,
  personCircleOutline
} from 'ionicons/icons';
import { EditOfferPage } from '../edit-offer/edit-offer.page';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers-list',
  templateUrl: './offers-list.page.html',
  styleUrls: ['./offers-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonContent, IonGrid, IonRow, IonCol, IonSelect, IonSelectOption,
    IonSearchbar, IonSpinner, IonFab, IonFabButton, IonBadge,
    IonAvatar
  ]
})
export class OffersListPage implements OnInit, OnDestroy {

  // ==================== INJECTIONS ====================
  private offerService = inject(OfferService);
  private authService = inject(AuthService);
  private popoverController = inject(PopoverController);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);
  private modalCtrl = inject(ModalController);

  // ==================== SIGNALS ====================
  offers = signal<Offer[]>([]);
  filteredOffers = signal<Offer[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  entriesPerPage = signal(10);
  currentPage = signal(1);
  user = signal<User | null>(null);
  unreadNotifications = signal(3);

  private userSubscription: Subscription = new Subscription();

  constructor() {
    addIcons({
      menuOutline,
      addOutline,
      closeOutline,
      barbell,
      notifications,
      personAddOutline,
      searchOutline,
      ellipsisVerticalOutline,
      createOutline,
      trashOutline,
      documentOutline,
      personCircleOutline
    });
  }

  ngOnInit() {
    this.loadOffers();
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

  // ==================== DÉCONNEXION ====================

  /**
   * 🔹 Déconnexion de l'utilisateur
   */
  async logout(): Promise<void> {
    const alert = await this.alertCtrl.create({
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

  // ==================== GESTION DES OFFRES ====================

  /**
   * 🔹 Charger les offres
   */
  loadOffers() {
    this.isLoading.set(true);

    this.offerService.getAllOffers().subscribe({
      next: (offers) => {
        this.offers.set(offers);
        this.filteredOffers.set(offers);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement offres:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * 🔹 Gérer la recherche
   */
  onSearchChange(event: any) {
    const term = event.detail.value?.toLowerCase() || '';
    this.searchTerm.set(term);
    
    if (!term) {
      this.filteredOffers.set(this.offers());
    } else {
      const filtered = this.offers().filter(offer =>
        offer.titre.toLowerCase().includes(term) ||
        offer.description.toLowerCase().includes(term)
      );
      this.filteredOffers.set(filtered);
    }
    this.currentPage.set(1);
  }

  /**
   * 🔹 Changer le nombre d'entrées par page
   */
  onEntriesPerPageChange(event: any) {
    this.entriesPerPage.set(parseInt(event.detail.value));
    this.currentPage.set(1);
  }

  // ==================== PAGINATION ====================

  get paginatedOffers() {
    const startIndex = (this.currentPage() - 1) * this.entriesPerPage();
    const endIndex = startIndex + this.entriesPerPage();
    return this.filteredOffers().slice(startIndex, endIndex);
  }

  get totalPages() {
    return Math.ceil(this.filteredOffers().length / this.entriesPerPage());
  }

  nextPage() {
    if (this.currentPage() < this.totalPages) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  getDisplayRange() {
    const start = (this.currentPage() - 1) * this.entriesPerPage() + 1;
    const end = Math.min(this.currentPage() * this.entriesPerPage(), this.filteredOffers().length);
    return { start, end };
  }

  // ==================== ACTIONS SUR LES OFFRES ====================

  /**
   * 🔹 Naviguer vers l'ajout d'offre
   */
  navigateToAddOffer() {
    this.router.navigate(['/tabs/add-offer']);
  }

  /**
   * 🔹 Supprimer une offre
   */
  async deleteOffer(offer: Offer) {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer l\'offre',
      message: `Êtes-vous sûr de vouloir supprimer "${offer.titre}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.performDelete(offer.id!);
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * 🔹 Ouvrir l'édition d'offre
   */
  async openEditOffer(offer: Offer) {
    const modal = await this.modalCtrl.create({
      component: EditOfferPage,
      componentProps: {
        offer: offer
      },
      presentingElement: await this.modalCtrl.getTop(),
      cssClass: 'edit-offer-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.success) {
        // Mettre à jour la liste si l'offre a été modifiée
        this.loadOffers();
      }
    });

    await modal.present();
  }

  /**
   * 🔹 Voir les détails de l'offre
   */
  viewOfferDetails(offer: Offer) {
    this.router.navigate(['/tabs/offer-details', offer.id]);
  }

  /**
   * 🔹 Ajouter au panier
   */
  addToCart(offer: Offer) {
    console.log('Ajouter au panier:', offer);
    // Implémentez la logique d'ajout au panier ici
  }

  /**
   * 🔹 Ouvrir les notifications
   */
  openNotifications() {
    console.log('Ouvrir les notifications');
    this.unreadNotifications.set(0);
    localStorage.setItem('unreadNotifications', '0');
  }

  // ==================== MÉTHODES PRIVÉES ====================

  private async performDelete(offerId: number) {
    const loading = await this.loadingCtrl.create({
      message: 'Suppression...',
    });
    await loading.present();

    this.offerService.deleteOffer(offerId).subscribe({
      next: () => {
        loading.dismiss();
        const updatedOffers = this.offers().filter(o => o.id !== offerId);
        this.offers.set(updatedOffers);
        this.filteredOffers.set(updatedOffers);
      },
      error: async (err) => {
        loading.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Erreur',
          message: 'Impossible de supprimer l\'offre',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}