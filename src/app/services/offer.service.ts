import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Offer, CreateOffer, UpdateOffer } from 'src/app/models/offer.model';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8091/api/offers';

  // Headers pour les requêtes JSON
  private jsonHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Récupérer toutes les offres
   */
  getAllOffers(): Observable<Offer[]> {
    console.log('🟡 Fetching all offers from:', `${this.apiUrl}/all`);
    return this.http.get<Offer[]>(`${this.apiUrl}/all`);
  }

  /**
   * Récupérer une offre par son ID
   */
  getOfferById(id: number): Observable<Offer> {
    console.log('🟡 Fetching offer by ID:', id);
    return this.http.get<Offer>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer une nouvelle offre
   */
  createOffer(offer: CreateOffer): Observable<Offer> {
    console.log('🟡 Creating new offer:', offer);
    return this.http.post<Offer>(`${this.apiUrl}/add`, offer, {
      headers: this.jsonHeaders
    });
  }

  /**
   * Mettre à jour une offre existante
   */
  updateOffer(id: number, offer: UpdateOffer): Observable<Offer> {
    console.log('🟡 Updating offer:', id, offer);
    return this.http.put<Offer>(`${this.apiUrl}/${id}`, offer, {
      headers: this.jsonHeaders
    });
  }

  /**
   * Supprimer une offre
   */
  deleteOffer(id: number): Observable<void> {
    console.log('🟡 Deleting offer:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les offres actives (optionnel - si vous avez une logique métier)
   */
  getActiveOffers(): Observable<Offer[]> {
    console.log('🟡 Fetching active offers');
    return this.http.get<Offer[]>(`${this.apiUrl}/all`);
    // Si vous avez un endpoint spécifique pour les offres actives :
    // return this.http.get<Offer[]>(`${this.apiUrl}/active`);
  }

  /**
   * Récupérer les offres par durée (optionnel)
   */
  getOffersByDuration(dureeMois: number): Observable<Offer[]> {
    console.log('🟡 Fetching offers by duration:', dureeMois);
    return this.http.get<Offer[]>(`${this.apiUrl}/all`).pipe(
      // Filtrage côté client - ou vous pouvez créer un endpoint backend
      // map(offers => offers.filter(offer => offer.dureeMois === dureeMois))
    );
  }
}