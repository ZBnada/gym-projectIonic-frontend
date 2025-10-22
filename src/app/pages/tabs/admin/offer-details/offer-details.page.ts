import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  AlertController, 
  IonicModule, 
  LoadingController,
  ModalController 
} from '@ionic/angular';
import { OfferService } from 'src/app/services/offer.service';
import { Offer } from 'src/app/models/offer.model';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline,
  createOutline,
  trashOutline,
  calendarOutline,
  cashOutline,
  timeOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.page.html',
  styleUrls: ['./offer-details.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class OfferDetailsPage implements OnInit, OnDestroy {
  offer: Offer | null = null;
  isLoading = true;
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: OfferService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {
    addIcons({
      arrowBackOutline,
      createOutline,
      trashOutline,
      calendarOutline,
      cashOutline,
      timeOutline,
      checkmarkCircleOutline
    });
  }

  ngOnInit() {
    this.loadOfferDetails();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadOfferDetails() {
    const offerId = this.route.snapshot.paramMap.get('id');
    
    if (!offerId) {
      this.showAlert('Erreur', 'ID d\'offre non trouvé');
      this.router.navigate(['/tabs/offers']);
      return;
    }

    this.isLoading = true;

    const detailsSub = this.offerService.getOfferById(+offerId).subscribe({
      next: (offer) => {
        this.offer = offer;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement détails offre:', err);
        this.isLoading = false;
        this.showAlert('Erreur', 'Impossible de charger les détails de l\'offre');
        this.router.navigate(['/tabs/offers']);
      }
    });

    this.subscription.add(detailsSub);
  }

  navigateBack() {
    this.router.navigate(['/tabs/offers-list']);
  }

  async editOffer() {
    if (!this.offer) return;

    // Vous pouvez utiliser le même modal d'édition que dans la liste
    // Ou naviguer vers une page d'édition séparée
    this.router.navigate(['/tabs/edit-offer', this.offer.id]);
  }

  async deleteOffer() {
    if (!this.offer) return;

    const alert = await this.alertCtrl.create({
      header: 'Supprimer l\'offre',
      message: `Êtes-vous sûr de vouloir supprimer "${this.offer.titre}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.performDelete(this.offer!.id!);
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
        this.showAlert('Succès', 'Offre supprimée avec succès');
        this.router.navigate(['/tabs/offers']);
      },
      error: async (err) => {
        loading.dismiss();
        this.showAlert('Erreur', 'Impossible de supprimer l\'offre');
      }
    });
  }

  getDurationText(months: number): string {
    if (months === 1) return '1 mois';
    if (months === 12) return '1 an';
    return `${months} mois`;
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

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}