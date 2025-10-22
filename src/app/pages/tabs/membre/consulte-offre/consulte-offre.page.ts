import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonButtons, 
  IonButton, IonIcon, IonSearchbar, IonSpinner, IonFab, IonFabButton,
  AlertController, LoadingController, IonAvatar
} from '@ionic/angular/standalone';
import { OfferService } from 'src/app/services/offer.service';
import { AuthService } from 'src/app/services/member/auth.service'; // AJOUT IMPORT
import { User, Role } from 'src/app/models/user.model'; // AJOUT IMPORT
import { Offer } from 'src/app/models/offer.model';
import { addIcons } from 'ionicons';
import { 
  menuOutline, 
  addOutline, 
  closeOutline, 
  barbell,
  starOutline,
  diamondOutline,
  trophyOutline,
  cardOutline,
  checkmarkCircle,
  createOutline,
  trashOutline,
  notifications,
  addCircle,
  chevronForwardCircle,
  searchOutline,
  filterOutline,
  personCircleOutline,
  callOutline,
  mailOutline,
  calendarOutline,
  timeOutline,
  eyeOutline,
  ellipsisVerticalOutline,
  personAddOutline,
  arrowBackOutline // AJOUT IMPORT
} from 'ionicons/icons';

@Component({
  selector: 'app-consulte-offre',
  templateUrl: './consulte-offre.page.html',
  styleUrls: ['./consulte-offre.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonButtons,
    IonButton, IonIcon, IonSearchbar, IonSpinner, IonFab, IonFabButton,
    IonAvatar // AJOUT IMPORT
  ]
})
export class ConsulteOffrePage implements OnInit {
  offers = signal<Offer[]>([]);
  filteredOffers = signal<Offer[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  currentUser = signal<User | null>(null); // AJOUT SIGNAL UTILISATEUR

  // AJOUT INJECTIONS
  private authService = inject(AuthService);
  private offerService = inject(OfferService);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({
      menuOutline,
      addOutline,
      closeOutline,
      barbell,
      starOutline,
      diamondOutline,
      trophyOutline,
      cardOutline,
      checkmarkCircle,
      notifications,
      personAddOutline,
      searchOutline,
      arrowBackOutline, // AJOUT ICONE
      personCircleOutline // AJOUT ICONE
    });
  }

  ngOnInit() {
    this.loadUserData(); // AJOUT CHARGEMENT UTILISATEUR
    this.loadOffers();
  }

  // ==================== GESTION UTILISATEUR ====================

  /**
   * 🔹 Charger les données de l'utilisateur
   */
  private loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser.set(user);
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
        const userId = payload.userId || payload.sub;
        
        if (userId) {
          this.authService.getUserById(userId).subscribe({
            next: (user) => {
              this.currentUser.set(user);
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
      this.setDefaultUser();
    }
  }

  private setDefaultUser(): void {
    this.currentUser.set({
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

  // ==================== GESTION OFFERS ====================

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

  onSearchChange(event: any) {
    const term = event.detail.value?.toLowerCase() || '';
    this.searchTerm.set(term);
    
    if (!term) {
      this.filteredOffers.set(this.offers());
    } else {
      const filtered = this.offers().filter(offer =>
        offer.titre.toLowerCase().includes(term) ||
        offer.description.toLowerCase().includes(term) ||
        this.getPlanType(offer).toLowerCase().includes(term)
      );
      this.filteredOffers.set(filtered);
    }
  }

  getPlanType(offer: Offer): string {
    if (offer.prix <= 50) return 'Starter';
    if (offer.prix <= 100) return 'Premium';
    return 'Unlimited';
  }

  getPlanColor(offer: Offer): string {
    const type = this.getPlanType(offer);
    switch(type) {
      case 'Starter': return 'primary';
      case 'Premium': return 'secondary';
      case 'Unlimited': return 'tertiary';
      default: return 'medium';
    }
  }

  getPlanIcon(offer: Offer): string {
    const type = this.getPlanType(offer);
    switch(type) {
      case 'Starter': return 'star-outline';
      case 'Premium': return 'diamond-outline';
      case 'Unlimited': return 'trophy-outline';
      default: return 'card-outline';
    }
  }

  getFeatures(offer: Offer): string[] {
    const baseFeatures = [
      'Accès illimité à la salle',
      'Coach personnel inclus',
      'Programme nutritionnel',
      'Suivi des progrès'
    ];
    
    const type = this.getPlanType(offer);
    if (type === 'Premium') {
      baseFeatures[0] = 'Accès VIP toutes zones';
      baseFeatures[3] = 'Analyses détaillées';
    } else if (type === 'Unlimited') {
      baseFeatures[0] = 'Accès 24/7 illimité';
      baseFeatures[3] = 'Suivi personnalisé avancé';
    }
    
    return baseFeatures;
  }

  // ==================== NAVIGATION ====================

  /**
   * 🔹 Naviguer vers la page précédente
   */
  navigateBack(): void {
    this.router.navigate(['/tabs/users']);
  }

  navigateToAddOffer() {
    this.router.navigate(['/tabs/add-offer']);
  }

  // ==================== ACTIONS ====================

  async deleteOffer(offer: Offer, event: Event) {
    event.stopPropagation();
    
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

  buyNow(offer: Offer, event: Event) {
    event.stopPropagation();
    console.log('Acheter maintenant:', offer);
    // Implémentez la logique d'achat ici
  }
}