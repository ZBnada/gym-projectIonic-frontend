export interface Offer {
    id?: number;
    titre: string;
    description: string;
    dureeMois: number;
    prix: number; // Utilisation de number au lieu de BigDecimal pour Angular
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // Interface pour la création d'une offre (sans id)
  export interface CreateOffer {
    titre: string;
    description: string;
    dureeMois: number;
    prix: number;
  }
  
  // Interface pour la mise à jour d'une offre
  export interface UpdateOffer {
    titre?: string;
    description?: string;
    dureeMois?: number;
    prix?: number;
  }