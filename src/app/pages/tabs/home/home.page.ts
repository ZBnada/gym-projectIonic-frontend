import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { menuOutline, notificationsOutline, fitnessOutline, barbellOutline, peopleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol
  ]
})
export class HomePage {
  constructor() {
    // Charger les icônes Ionicons
    addIcons({ menuOutline, notificationsOutline, fitnessOutline, barbellOutline, peopleOutline });
  }
}
