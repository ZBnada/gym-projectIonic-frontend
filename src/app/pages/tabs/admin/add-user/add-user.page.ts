import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonSpinner, IonButtons, IonNote, ActionSheetController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, personOutline, cameraOutline, trashOutline, eyeOutline, eyeOffOutline, imageOutline } from 'ionicons/icons';
import { Offer } from 'src/app/models/offer.model';
import { AuthService } from 'src/app/services/member/auth.service';
import { OfferService } from 'src/app/services/offer.service';
import { PhotosService } from 'src/app/services/photos.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.page.html',
  styleUrls: ['./add-user.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
    IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonSpinner, IonButtons, IonNote
  ]
})
export class AddUserPage implements OnInit {

  userForm: FormGroup;
  showPassword = false;
  selectedPhoto: File | null = null;
  photoPreview: string | null = null;
  isLoading = false;
  offers: Offer[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private offerService: OfferService,
    private photoSer: PhotosService,
    private actionSheetCtrl: ActionSheetController
  ) {
    addIcons({ arrowBackOutline, personOutline, cameraOutline, trashOutline, eyeOutline, eyeOffOutline, imageOutline });
    this.userForm = this.createForm();
  }

  ngOnInit() {
    this.loadOffers();
    this.userForm.get('role')?.valueChanges.subscribe(role => {
      if (role === 'ADMIN') {
        this.userForm.get('offerId')?.setValue(null);
        this.userForm.get('offerId')?.clearValidators();
      } else {
        this.userForm.get('offerId')?.setValidators(Validators.required);
      }
      this.userForm.get('offerId')?.updateValueAndValidity();
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      pwd: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['CLIENT', Validators.required],
      offerId: [null]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const pwd = form.get('pwd')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return pwd === confirm ? null : { mismatch: true };
  }

  // 📸 ActionSheet pour choisir la source de la photo
  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Ajouter une photo',
      buttons: [
        {
          text: 'Prendre une photo',
          icon: 'camera',
          handler: async () => {
            const photoData = await this.photoSer.takePicture();
            if (photoData) this.savePhoto(photoData);
          }
        },
        {
          text: 'Choisir depuis la galerie',
          icon: 'image',
          handler: async () => {
            const photoData = await this.photoSer.pickPicture();
            if (photoData) this.savePhoto(photoData);
          }
        },
        {
          text: 'Annuler',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  // Convertir DataURL en File
  async savePhoto(dataUrl: string) {
    this.photoPreview = dataUrl;
    const blob = await (await fetch(dataUrl)).blob();
    this.selectedPhoto = new File([blob], `photo_${Date.now()}.jpeg`, { type: blob.type });
  }

  removePhoto() {
    this.selectedPhoto = null;
    this.photoPreview = null;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  loadOffers() {
    this.offerService.getAllOffers().subscribe({
      next: (data) => this.offers = data,
      error: (err) => console.error('Erreur chargement offres :', err)
    });
  }

  // 👤 Ajouter l’utilisateur
  async addUser() {
    if (!this.userForm.valid) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    const formData = new FormData();
    Object.keys(this.userForm.value).forEach(key => {
      const value = this.userForm.value[key];
      if (value != null) formData.append(key, value.toString());
    });
    if (this.selectedPhoto) formData.append('photo', this.selectedPhoto);

    this.authService.addUser(formData).subscribe({
      next: () => {
        alert('Utilisateur créé avec succès !');
        this.router.navigate(['/tabs/admin-dashboard']);
      },
      error: err => {
        console.error(err);
        alert('Erreur lors de la création');
      },
      complete: () => this.isLoading = false
    });
  }

  goBack() {
    this.router.navigate(['/tabs/admin-dashboard']);
  }

  getEmailErrorMessage() {
    const email = this.userForm.get('email');
    if (email?.hasError('required')) return 'Email requis';
    if (email?.hasError('email')) return 'Email invalide';
    return '';
  }
}
