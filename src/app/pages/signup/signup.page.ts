import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ActionSheetController } from '@ionic/angular';
import { 
  IonHeader, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, 
  IonCheckbox, IonSelect, IonSelectOption, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, eye, eyeOff, closeOutline } from 'ionicons/icons';

import { OfferService } from 'src/app/services/offer.service';
import { Role } from 'src/app/models/user.model';
import { Offer } from 'src/app/models/offer.model';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/member/auth.service';
import { PhotosService } from 'src/app/services/photos.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon,
    IonCheckbox, IonSelect, IonSelectOption, IonSpinner
  ]
})
export class SignupPage implements OnInit, OnDestroy {
  signupForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  selectedFile: File | null = null;
  photoPreview: string | ArrayBuffer | null = null;
  offers: Offer[] = [];
  loadingOffers = false;
  isSubmitting = false;

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private authService: AuthService,
    private offerService: OfferService,
    private photoSer: PhotosService
  ) {
    addIcons({ camera, eye, eyeOff, closeOutline });

    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      offerId: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadOffers();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Ajouter une photo',
      buttons: [
        {
          text: ' Prendre une photo',
          icon: 'camera',
          handler: async () => {
            const dataUrl = await this.photoSer.takePicture();
            if (dataUrl) this.setPhotoFromBase64(dataUrl);
          }
        },
        {
          text: 'Choisir depuis la galerie',
          icon: 'image',
          handler: async () => {
            const dataUrl = await this.photoSer.pickPicture();
            if (dataUrl) this.setPhotoFromBase64(dataUrl);
          }
        },
        { text: 'Annuler', role: 'cancel', icon: 'close' }
      ],
    });
    await actionSheet.present();
  }

  private setPhotoFromBase64(dataUrl: string) {
    this.photoPreview = dataUrl;
    const file = this.dataURLtoFile(dataUrl, 'photo.png');
    this.selectedFile = file;
  }

  private dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  async onSubmit() {
    this.markFormGroupTouched();
    if (this.signupForm.invalid) {
      this.showAlert('Erreur', 'Veuillez corriger les erreurs du formulaire.');
      return;
    }
    if (!this.signupForm.get('acceptTerms')?.value) {
      this.showAlert('Erreur', 'Veuillez accepter les conditions.');
      return;
    }

    await this.submitSignup();
  }

  private async submitSignup() {
    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({ message: 'Création du compte...' });
    await loading.present();

    try {
      const formData = new FormData();
      const v = this.signupForm.value;

      formData.append('firstName', v.firstName.trim());
      formData.append('lastName', v.lastName.trim());
      formData.append('email', v.email.trim());
      formData.append('pwd', v.password);
      formData.append('phone', v.phone.toString());
      formData.append('role', Role.CLIENT);
      formData.append('offerId', v.offerId.toString());

      if (this.selectedFile) {
        formData.append('photo', this.selectedFile, this.selectedFile.name);
      }

      const sub = this.authService.signup(formData).subscribe({
        next: async () => {
          await loading.dismiss();
          this.isSubmitting = false;
          this.showAlert('Succès', 'Compte créé avec succès !');
          this.router.navigate(['/login']);
        },
        error: async (err) => {
          await loading.dismiss();
          this.isSubmitting = false;
          this.showAlert('Erreur', 'Impossible de créer le compte.');
          console.error(err);
        }
      });

      this.subscriptions.add(sub);
    } catch (error) {
      await loading.dismiss();
      this.isSubmitting = false;
      this.showAlert('Erreur', 'Erreur inattendue.');
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      if (control) control.markAsTouched();
    });
  }

  passwordMatchValidator(control: AbstractControl) {
    const pwd = control.get('password')?.value;
    const conf = control.get('confirmPassword')?.value;
    if (pwd !== conf) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }

  removePhoto() {
    this.selectedFile = null;
    this.photoPreview = null;
  }

  // Charge les offres
  loadOffers() {
    this.loadingOffers = true;
    const sub = this.offerService.getAllOffers().subscribe({
      next: (offers) => {
        this.offers = offers;
        this.loadingOffers = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingOffers = false;
      }
    });
    this.subscriptions.add(sub);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') this.showPassword = !this.showPassword;
    else this.showConfirmPassword = !this.showConfirmPassword;
  }

  getOfferDisplay(offer: Offer): string {
    return `${offer.titre} - ${offer.dureeMois} mois - $${offer.prix}`;
  }
  
  // Dans SignupPage, après le constructeur
get firstName() { return this.signupForm.get('firstName'); }
get lastName() { return this.signupForm.get('lastName'); }
get email() { return this.signupForm.get('email'); }
get phone() { return this.signupForm.get('phone'); }
get password() { return this.signupForm.get('password'); }
get confirmPassword() { return this.signupForm.get('confirmPassword'); }
get offerId() { return this.signupForm.get('offerId'); }
get acceptTerms() { return this.signupForm.get('acceptTerms'); }

}
