import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, IonicModule } from '@ionic/angular';
import { OfferService } from 'src/app/services/offer.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-offer',
  templateUrl: './add-offer.page.html',
  styleUrls: ['./add-offer.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class AddOfferPage implements OnInit {
  offerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private offerService: OfferService
  ) {
    this.offerForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      dureeMois: ['', [Validators.required, Validators.min(1), Validators.max(36)]],
      prix: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.offerForm.invalid) {
      this.showAlert('Erreur', 'Veuillez remplir tous les champs correctement');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Création de l\'offre...',
      spinner: 'circles'
    });
    await loading.present();

    const offerData = this.offerForm.value;

    this.offerService.createOffer(offerData).subscribe({
      next: async (res) => {
        await loading.dismiss();
        await this.showAlert('Succès', 'Offre créée avec succès!');
        this.offerForm.reset();
        this.router.navigate(['/tabs/offers']); // Rediriger vers la liste des offres
      },
      error: async (err) => {
        await loading.dismiss();
        
        let message = 'Une erreur est survenue lors de la création.';
        if (err.status === 400) {
          message = 'Données invalides. Vérifiez les informations saisies.';
        } else if (err.status === 0) {
          message = 'Serveur injoignable. Vérifiez votre connexion.';
        }

        this.showAlert('Erreur', message);
        console.error('Erreur création offre:', err);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/tabs/offers']);
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
  get titre() { return this.offerForm.get('titre'); }
  get description() { return this.offerForm.get('description'); }
  get dureeMois() { return this.offerForm.get('dureeMois'); }
  get prix() { return this.offerForm.get('prix'); }
}