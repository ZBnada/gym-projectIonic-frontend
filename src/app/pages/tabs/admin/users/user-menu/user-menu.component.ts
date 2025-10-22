import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonList, 
  IonItem, 
  IonLabel, 
  IonIcon,
  PopoverController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  speedometerOutline, 
  personOutline, 
  logOutOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, IonList, IonItem, IonLabel, IonIcon]
})
export class UserMenuComponent {

  constructor(private popoverController: PopoverController) {
    addIcons({ 
      speedometerOutline, 
      personOutline, 
      logOutOutline 
    });
  }

  // Actions du menu
  navigateTo(action: string) {
    this.popoverController.dismiss({ action });
  }

  closeMenu() {
    this.popoverController.dismiss();
  }
}