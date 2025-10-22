import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, AlertController, LoadingController, IonicModule } from '@ionic/angular';
import { OfferService } from 'src/app/services/offer.service';
import { Offer, UpdateOffer } from 'src/app/models/offer.model';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class EditOfferPage implements OnInit {
  @Input() offer!: Offer;
  
  editForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private offerService: OfferService
  ) {
    this.editForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      dureeMois: ['', [Validators.required, Validators.min(1), Validators.max(36)]],
      prix: ['', [Validators.required, Validators.min(0)]]
    });

    addIcons({ closeOutline, checkmarkOutline });
  }

  ngOnInit() {
    if (this.offer) {
      this.editForm.patchValue({
        titre: this.offer.titre,
        description: this.offer.description,
        dureeMois: this.offer.dureeMois,
        prix: this.offer.prix
      });
    }
  }

  async onSubmit() {
    if (this.editForm.invalid) {
      this.showAlert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Mise à jour en cours...',
      spinner: 'crescent'
    });
    await loading.present();

    const updateData: UpdateOffer = this.editForm.value;

    this.offerService.updateOffer(this.offer.id!, updateData).subscribe({
      next: async (updatedOffer) => {
        await loading.dismiss();
        await this.showAlert('Succès', 'Offre mise à jour avec succès!');
        this.modalCtrl.dismiss({ success: true, offer: updatedOffer });
      },
      error: async (err) => {
        await loading.dismiss();
        
        let message = 'Une erreur est survenue lors de la mise à jour.';
        if (err.status === 400) {
          message = 'Données invalides. Vérifiez les informations saisies.';
        } else if (err.status === 404) {
          message = 'Offre non trouvée.';
        } else if (err.status === 0) {
          message = 'Serveur injoignable. Vérifiez votre connexion.';
        }

        this.showAlert('Erreur', message);
        console.error('Erreur mise à jour offre:', err);
      }
    });
  }

  onCancel() {
    this.modalCtrl.dismiss({ success: false });
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Getters pour faciliter l'accès aux champs du formulaire
  get titre() { return this.editForm.get('titre'); }
  get description() { return this.editForm.get('description'); }
  get dureeMois() { return this.editForm.get('dureeMois'); }
  get prix() { return this.editForm.get('prix'); }
}