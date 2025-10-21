import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { 
  IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent, 
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption 
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/member/auth.service';
import { User } from 'src/app/models/user.model';
import { arrowBackOutline, saveOutline, personCircleOutline, cameraOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  templateUrl: './edit-user.page.html',
  styleUrls: ['./edit-user.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption
  ]
})
export class EditUserPage implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private authService = inject(AuthService);
  private alertCtrl = inject(AlertController);

  userForm!: FormGroup;
  userId!: number;
  selectedFile: File | null = null;
  backendUrl = 'http://localhost:8091/uploads/';
  currentUser!: User;

  

  constructor() {
    addIcons({ arrowBackOutline, saveOutline, personCircleOutline, cameraOutline });
  }

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadUser();
  }

  initForm() {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['', Validators.required]
    });
  }

  loadUser() {
    this.authService.getAllUsers().subscribe(users => {
      const user = users.find(u => u.id === this.userId);
      if (user) {
        this.currentUser = user;
        this.userForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role
        });
      }
    });
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  getUserPhoto() {
    return this.currentUser?.photo
      ? this.backendUrl + encodeURIComponent(this.currentUser.photo)
      : 'assets/images/default-avatar.png';
  }

  async submit() {
    if (this.userForm.invalid) {
      this.showAlert('Erreur', 'Veuillez remplir tous les champs requis.');
      return;
    }

    const formData = new FormData();
    Object.entries(this.userForm.value).forEach(([k, v]) => formData.append(k, v as string));
    if (this.selectedFile) formData.append('photo', this.selectedFile);

    this.authService.editUser(this.userId, formData).subscribe({
      next: async () => {
        await this.showAlert('Succès', 'Utilisateur mis à jour avec succès.');
        this.router.navigate(['/tabs/users']);
      },
      error: async () => {
        await this.showAlert('Erreur', 'Échec de la mise à jour.');
      }
    });
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
