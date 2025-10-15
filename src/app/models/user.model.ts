export enum Role {
    ADMIN = 'ADMIN',
    CLIENT = 'CLIENT'
  }
  
  export interface User {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    pwd?: string; // facultatif pour éviter de le manipuler côté front
    phone: number;
    role: Role;
    photo?: string;
    membershipType?: string;
    membershipStatus?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    startDate?: Date;
    endDate?: Date;
    offerId?: number;
  }
  