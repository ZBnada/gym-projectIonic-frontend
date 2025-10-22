import { Component, OnInit, signal, inject } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  personOutline,
  peopleOutline,
  home,
  people,
  person,
  card, 
  cardOutline,
  barbellOutline,
  barbell,
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/member/auth.service';
import { Role } from 'src/app/models/user.model';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [IonIcon, IonTabButton, IonTabBar, IonTabs, IonLabel],
})
export class TabsPage implements OnInit {
  currentTab = signal<string>('');
  private authService = inject(AuthService);
  
  // Solution alternative - utiliser directement le localStorage
  get isAdmin(): boolean {
    const token = localStorage.getItem('token');
    console.log('🔍 Checking isAdmin - Token exists:', !!token);
    
    if (!token) {
      console.log('❌ No token found');
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role;
      console.log('🔍 Token payload role:', role);
      console.log('🔍 Role.ADMIN:', Role.ADMIN);
      console.log('🔍 Comparison:', role === Role.ADMIN);
      return role === Role.ADMIN;
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return false;
    }
  }

  get isClient(): boolean {
    const token = localStorage.getItem('token');
    console.log('🔍 Checking isClient - Token exists:', !!token);
    
    if (!token) {
      console.log('❌ No token found');
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role;
      console.log('🔍 Token payload role:', role);
      console.log('🔍 Role.CLIENT:', Role.CLIENT);
      console.log('🔍 Comparison:', role === Role.CLIENT);
      return role === Role.CLIENT;
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return false;
    }
  }

  constructor() {
    addIcons({
      home,
      homeOutline,
      peopleOutline,
      personOutline,
      people,
      person,
      card,
      cardOutline,
      barbellOutline,
      barbell,
    });
  }

  ngOnInit() {
    console.log('🐛 ===== TABS INIT =====');
    
    // Vérifier le token directement
    const token = localStorage.getItem('token');
    console.log('🔍 Token in localStorage:', token);
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 Token payload:', payload);
        console.log('🔍 Role from token:', payload.role);
      } catch (error) {
        console.error('❌ Error parsing token:', error);
      }
    }
    
    console.log('🔍 isAdmin result:', this.isAdmin);
    console.log('🔍 isClient result:', this.isClient);
    
    // Définir l'onglet par défaut selon le rôle
    if (this.isAdmin) {
      console.log('🎯 Setting default tab to admin-dashboard');
      this.currentTab.set('admin-dashboard');
    } else if (this.isClient) {
      console.log('🎯 Setting default tab to home-membre');
      this.currentTab.set('home-membre');
    } else {
      console.log('⚠️  No role detected, setting default tab to profile');
      this.currentTab.set('profile');
    }
    
    console.log('🐛 ===== END TABS INIT =====');
  }

  getCurrentTab(event: { tab: string }) {
    console.log('Tab changed to:', event.tab);
    this.currentTab.set(event.tab);
  }
}