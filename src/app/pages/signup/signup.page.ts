import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { 
  IonHeader, IonContent, IonList, 
  IonItem, IonLabel, IonInput, IonButton, IonIcon, 
  IonCheckbox, IonSelect, 
  IonSelectOption, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'; // ← AJOUTER CET IMPORT
import { 
  camera, 
  eye, 
  eyeOff, 
  close,
  closeOutline,
  closeCircle,
  closeSharp
} from 'ionicons/icons'; // ← AJOUTER CET IMPORT

import { OfferService } from 'src/app/services/offer.service';
import { Role } from 'src/app/models/user.model';
import { Offer } from 'src/app/models/offer.model';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/member/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader, IonContent, IonList,
    IonItem, IonLabel, IonInput, IonButton, IonIcon,
    IonCheckbox,IonSelect,
    IonSelectOption, IonSpinner
  ]
})
export class SignupPage implements OnInit {
  signupForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  selectedFile: File | null = null;
  photoPreview: string | ArrayBuffer | null = null;
  offers: Offer[] = [];
  loadingOffers = false;
  isSubmitting = false;
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private offerService: OfferService
  ) {
    addIcons({
      camera,
      eye,
      eyeOff,
      close,
      closeOutline,
      closeCircle,
      closeSharp
    });
    
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
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

  async onSubmit() {
    console.log('🟡 SIGNUP FORM SUBMITTED');
    
    // Marquer tous les champs comme touchés
    this.markFormGroupTouched();

    if (this.signupForm.invalid) {
      console.log('🔴 FORM INVALID');
      this.showAlert('Error', 'Please fix all errors in the form');
      return;
    }

    if (!this.signupForm.get('acceptTerms')?.value) {
      console.log('🔴 TERMS NOT ACCEPTED');
      this.showAlert('Error', 'You must accept the terms and conditions');
      return;
    }

    console.log('🟢 ALL VALIDATIONS PASSED');
    await this.submitSignup();
  }

  private async submitSignup() {
    this.isSubmitting = true;

    const loading = await this.loadingCtrl.create({
      message: 'Creating your account...',
      spinner: 'circles'
    });
    
    await loading.present();

    try {
      const formData = new FormData();
      const formValue = this.signupForm.value;

      // Ajouter les champs au FormData
      formData.append('firstName', formValue.firstName.trim());
      formData.append('lastName', formValue.lastName.trim());
      formData.append('email', formValue.email.trim());
      formData.append('pwd', formValue.password);
      formData.append('phone', formValue.phone.toString());
      formData.append('role', Role.CLIENT);
      formData.append('offerId', formValue.offerId.toString());

      // Ajouter la photo si elle existe
      if (this.selectedFile) {
        formData.append('photo', this.selectedFile, this.selectedFile.name);
      }

      console.log('🟡 Sending signup request...');

      const signupSub = this.authService.signup(formData).subscribe({
        next: async (response) => {
          console.log('🟢 SIGNUP SUCCESS:', response);
          await loading.dismiss();
          this.isSubmitting = false;
          
          this.showAlert('Success', 'Your account has been created successfully!');
          this.router.navigate(['/login']);
        },
        error: async (error) => {
          console.log('🔴 SIGNUP ERROR:', error);
          await loading.dismiss();
          this.isSubmitting = false;
          
          let message = 'An error occurred during account creation.';
          
          if (error.status === 400) {
            message = error.error?.message || 'Invalid data provided.';
          } else if (error.status === 409) {
            message = 'An account with this email already exists.';
          } else if (error.status === 0) {
            message = 'Unable to connect to server. Please check your connection.';
          }
          
          this.showAlert('Error', message);
        }
      });

      this.subscriptions.add(signupSub);

    } catch (error) {
      await loading.dismiss();
      this.isSubmitting = false;
      this.showAlert('Error', 'An unexpected error occurred');
    }
  }

  // Les autres méthodes restent identiques...
  loadOffers() {
    this.loadingOffers = true;
    
    const offersSub = this.offerService.getAllOffers().subscribe({
      next: (offers) => {
        this.offers = offers;
        this.loadingOffers = false;
        
        if (this.offers.length > 0) {
          this.signupForm.patchValue({ offerId: this.offers[0].id });
        }
      },
      error: (error) => {
        console.error('Error loading offers:', error);
        this.loadingOffers = false;
        this.offers = this.getDefaultOffers();
      }
    });

    this.subscriptions.add(offersSub);
  }

  private getDefaultOffers(): Offer[] {
    return [
      { id: 1, titre: 'Basic Offer', description: 'Basic gym access', dureeMois: 1, prix: 50 },
      { id: 2, titre: 'Premium Offer', description: 'Premium access with coach', dureeMois: 3, prix: 80 },
      { id: 3, titre: 'VIP Offer', description: 'VIP unlimited access', dureeMois: 6, prix: 120 }
    ];
  }

  getOfferDisplay(offer: Offer): string {
    return `${offer.titre} - ${offer.dureeMois} months - $${offer.prix}`;
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.showAlert('Error', 'Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.showAlert('Error', 'Image must be less than 5MB');
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.selectedFile = null;
    this.photoPreview = null;
  }

  private markFormGroupTouched() {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
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

  // Getters
  get firstName() { return this.signupForm.get('firstName'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get email() { return this.signupForm.get('email'); }
  get phone() { return this.signupForm.get('phone'); }
  get password() { return this.signupForm.get('password'); }
  get confirmPassword() { return this.signupForm.get('confirmPassword'); }
  get offerId() { return this.signupForm.get('offerId'); }
  get acceptTerms() { return this.signupForm.get('acceptTerms'); }
}
