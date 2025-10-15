import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Role } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/member/auth.service';
import { 
  IonHeader, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonCheckbox 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonCheckbox
  ]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private authService: AuthService 
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit() {}

  async login() {
    if (this.loginForm.invalid) {
      this.showAlert('Erreur', 'Veuillez remplir tous les champs correctement');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Connexion en cours...',
      spinner: 'circles'
    });
    await loading.present();

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: async (res) => {
        await loading.dismiss();

        if (res && res.token) {
          localStorage.setItem('token', res.token);

          const payload = JSON.parse(atob(res.token.split('.')[1]));
          const role: Role = payload.role;

          // 🔹 Navigation selon le rôle
          if (role === Role.ADMIN) {
            this.router.navigate(['/tabs/admin-dashboard']); // admin
          } else {
            this.router.navigate(['/tabs/home-membre']); // client
          }
        } else {
          this.showAlert('Erreur', 'Réponse du serveur invalide.');
        }
      },
      error: async (err) => {
        await loading.dismiss();

        let message = 'Une erreur est survenue.';
        if (err.status === 401) {
          message = 'Email ou mot de passe incorrect ❌';
        } else if (err.status === 0) {
          message = 'Serveur injoignable. Vérifie ta connexion.';
        }

        this.showAlert('Erreur', message);
      }
    });
  }

  async forgotPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Mot de passe oublié',
      message: 'Entrez votre email pour réinitialiser votre mot de passe',
      inputs: [{ name: 'email', type: 'email', placeholder: 'Votre email' }],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Envoyer',
          handler: (data) => {
            if (data.email) {
              this.showAlert('Email envoyé', 'Un lien de réinitialisation a été envoyé à votre email');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
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
