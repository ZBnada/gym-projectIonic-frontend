import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { 
  IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, 
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
IonChip
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  barbell, playCircle, timeOutline, flameOutline,
  peopleOutline, starOutline, arrowForwardOutline,
  trophyOutline, fitnessOutline, checkmarkCircleOutline,
  close
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
     IonChip
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage {

  isVideoPlaying = false;
  youtubeUrl: SafeResourceUrl;

  // Cours populaires avec images locales
  popularClasses = [
    {
      id: 1,
      name: 'Cardio Intensive',
      category: 'Cardio',
      duration: '45 min',
      calories: '600 kcal',
      level: 'Intermédiaire',
      image: 'assets/images/cardio-class.jpg',
      coach: 'Sarah Martinez',
      rating: 4.8,
      participants: 12
    },
    {
      id: 2,
      name: 'Yoga Débutant',
      category: 'Yoga',
      duration: '60 min',
      calories: '300 kcal',
      level: 'Débutant',
      image: 'assets/images/yoga-class.jpg',
      coach: 'Marie Laurent',
      rating: 4.9,
      participants: 8
    },
    {
      id: 3,
      name: 'Musculation Pro',
      category: 'Force',
      duration: '75 min',
      calories: '500 kcal',
      level: 'Avancé',
      image: 'assets/images/strength-class.jpg',
      coach: 'David Chen',
      rating: 4.7,
      participants: 6
    },
    {
      id: 4,
      name: 'CrossFit Team',
      category: 'CrossFit',
      duration: '55 min',
      calories: '700 kcal',
      level: 'Intermédiaire',
      image: 'assets/images/crossfit-class.jpg',
      coach: 'Mike Johnson',
      rating: 4.6,
      participants: 15
    }
  ];

  // Équipements de la salle avec images locales
  facilities = [
    {
      name: 'Zone Cardio',
      description: 'Matériel dernier cri pour vos entraînements cardio',
      image: 'assets/images/cardio-zone.jpg',
      features: ['Tapis de course premium', 'Vélos elliptiques', 'Rameurs hydrauliques']
    },
    {
      name: 'Espace Musculation',
      description: 'Zone complète de musculation et force',
      image: 'assets/images/weight-zone.jpg',
      features: ['Haltères 1-50kg', 'Machines guidées', 'Bancs professionnels']
    },
    {
      name: 'Studio de Cours',
      description: 'Espace dédié aux cours collectifs',
      image: 'assets/images/studio-class.jpg',
      features: ['Yoga & Pilates', 'Cours collectifs', 'Espace détente']
    }
  ];

  // Offres spéciales
  membershipPlans = [
    {
      name: 'Découverte',
      price: '29',
      period: 'mois',
      features: [
        'Accès illimité 7j/7',
        'Tous les cours collectifs',
        'Espace cardio complet',
        '1 séance coaching offerte'
      ],
      popular: false
    },
    {
      name: 'Premium',
      price: '59',
      period: 'mois',
      features: [
        'Tous les avantages Découverte',
        'Accès 24/7',
        'Coaching personnel mensuel',
        'Consultation nutritionniste',
        'Massages relaxants inclus'
      ],
      popular: true
    },
    {
      name: 'Famille',
      price: '99',
      period: 'mois',
      features: [
        '4 personnes incluses',
        'Cours enfants spécialisés',
        'Parking privé gratuit',
        'Espace détente familial'
      ],
      popular: false
    }
  ];

  // Statistiques de la salle
  gymStats = [
    { number: '500+', label: 'Membres Actifs' },
    { number: '20+', label: 'Coach Experts' },
    { number: '50+', label: 'Cours par Semaine' },
    { number: '1000m²', label: 'Espace d\'Entraînement' }
  ];

  // Témoignages
  testimonials = [
    {
      name: 'Sophie Martin',
      text: 'Incroyable salle ! Les coachs sont extrêmement professionnels et l\'ambiance est super motivante. J\'ai atteint mes objectifs en 6 mois seulement.',
      role: 'Membre depuis 1 an',
      avatar: 'assets/images/avatar1.jpg'
    },
    {
      name: 'Thomas Bernard',
      text: 'J\'ai perdu 15kg en 6 mois grâce au programme personnalisé. L\'équipement est moderne et toujours disponible.',
      role: 'Membre depuis 8 mois',
      avatar: 'assets/images/avatar2.jpg'
    },
    {
      name: 'Laura Petit',
      text: 'L\'équipement est moderne et toujours bien entretenu. Les cours collectifs sont variés et les coachs très compétents. Je recommande !',
      role: 'Membre depuis 2 ans',
      avatar: 'assets/images/avatar3.jpg'
    }
  ];

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    addIcons({ 
      barbell, playCircle, timeOutline, flameOutline,
      peopleOutline, starOutline, arrowForwardOutline,
      trophyOutline, fitnessOutline, checkmarkCircleOutline,
      close
    });

    // Configuration de l'URL YouTube pour lecture automatique
    const youtubeId = 'djp5ZQQ7WXA';
    const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${youtubeId}&modestbranding=1`;
    this.youtubeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  onVideoLoad() {
    console.log('Vidéo YouTube chargée et en lecture automatique');
  }

  playVideo() {
    this.isVideoPlaying = true;
  }

  closeVideo() {
    this.isVideoPlaying = false;
    // Recréer l'URL pour réinitialiser la vidéo
    const youtubeId = 'djp5ZQQ7WXA';
    const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=1&showinfo=0&rel=0`;
    this.youtubeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/signup']);
  }

  navigateToClasses() {
    this.router.navigate(['/classes']);
  }

  navigateToMembership() {
    this.router.navigate(['/membership']);
  }
}