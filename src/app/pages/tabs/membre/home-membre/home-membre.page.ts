import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, 
  IonContent, IonAvatar, IonBadge, IonCard, IonCardHeader, IonCardTitle, 
  IonCardSubtitle, IonCardContent, IonGrid, IonRow, IonCol 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  menuOutline, notificationsOutline, barbellOutline, barbell,
  checkmarkCircle, timeOutline, fitnessOutline, flameOutline, 
  trendingUpOutline, calendarOutline, statsChartOutline, 
  peopleOutline, personOutline, locationOutline, checkmarkCircleOutline,
  arrowForwardOutline
} from 'ionicons/icons';
import { User, Role } from 'src/app/models/user.model';
import { register } from 'swiper/element/bundle';
import { AuthService } from 'src/app/services/member/auth.service';
import type { SwiperOptions } from 'swiper/types';


@Component({
  selector: 'app-home-membre',
  templateUrl: './home-membre.page.html',
  styleUrls: ['./home-membre.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle,
    IonContent, IonAvatar, IonBadge, IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonCardContent, IonGrid, IonRow, IonCol
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeMembrePage implements OnInit {

  
  userFirstName: string = '';
  userPhoto: string = '';
  membershipType: string = 'Standard';
  isMembershipActive: boolean = false;

  workoutsThisWeek: number = 3;
  caloriesBurned: number = 1250;
  currentStreak: number = 7;
  unreadNotifications: number = 2;
  nextWorkout: any = null;

  specialOffers: any[] = [
    {
      title: 'Premium Plus',
      subtitle: 'L\'expérience ultime',
      price: '89',
      period: 'mois',
      features: [
        'Accès 24h/24 et 7j/7',
        'Coach personnel dédié',
        'Plan nutritionnel sur mesure',
        'Massages illimités'
      ],
      popular: true
    },
    {
      title: 'Étudiant',
      subtitle: '-50% pour les étudiants',
      price: '29',
      period: 'mois',
      features: [
        'Accès illimité',
        'Cours collectifs inclus',
        'Espace cardio-training',
        'Coaching en groupe'
      ],
      popular: false
    },
    {
      title: 'Famille',
      subtitle: 'Pour vous et vos proches',
      price: '129',
      period: 'mois',
      features: [
        'Jusqu\'à 4 personnes',
        'Cours enfants inclus',
        'Espace détente familial',
        'Parking gratuit'
      ],
      popular: false
    }
  ];

  swiperConfig: SwiperOptions = {
    slidesPerView: 1.1,
    spaceBetween: 16,
    centeredSlides: false,
    loop: false,
    breakpoints: {
      400: { slidesPerView: 1.3, spaceBetween: 16 },
      640: { slidesPerView: 1.8, spaceBetween: 20 },
      768: { slidesPerView: 2.2, spaceBetween: 20 },
      1024: { slidesPerView: 2.5, spaceBetween: 24 }
    }
  };

  private backendUrl = 'http://localhost:8091/uploads/';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ 
      menuOutline, notificationsOutline, barbellOutline, barbell,
      checkmarkCircle, timeOutline, fitnessOutline, flameOutline, 
      trendingUpOutline, calendarOutline, statsChartOutline, 
      peopleOutline, personOutline, locationOutline, checkmarkCircleOutline,
      arrowForwardOutline
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData() {
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser) {
      this.userFirstName = currentUser.firstName;
      this.userPhoto = currentUser.photo
        ? this.backendUrl + encodeURIComponent(currentUser.photo)
        : 'assets/images/default-avatar.png';
      this.membershipType = currentUser.membershipType || 'Standard';
      this.isMembershipActive = currentUser.membershipStatus === 'ACTIVE';
      
      this.loadWorkoutData();
    } else {
      this.router.navigate(['/login']);
    }
  }

  private loadWorkoutData() {
    this.nextWorkout = {
      name: 'Full Body Strength',
      time: '18:00',
      date: 'Aujourd\'hui',
      type: 'Musculation',
      coach: 'Marc Dupont',
      location: 'Salle de musculation'
    };
  }

  openMenu() { console.log('Ouvrir le menu'); }
  openNotifications() { this.router.navigate(['/notifications']); }
  openProfile() { this.router.navigate(['/profile']); }
  navigateTo(destination: string) { this.router.navigate([`/${destination}`]); }

  startWorkout() {
    if (this.nextWorkout) {
      this.router.navigate(['/workout-session'], { state: { workout: this.nextWorkout } });
    }
  }

  exploreOffer(offer: any) {
    this.router.navigate(['/membership'], { state: { selectedOffer: offer } });
  }

  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return `Bonjour, ${this.userFirstName}! 🌞`;
    if (hour < 18) return `Bonjour, ${this.userFirstName}! ☀️`;
    return `Bonsoir, ${this.userFirstName}! 🌙`;
  }

  getMembershipStatusText(): string {
    return this.isMembershipActive ? 'Actif' : 'En attente';
  }

  getMembershipIcon(): string {
    return this.isMembershipActive ? 'checkmark-circle' : 'time';
  }
}
