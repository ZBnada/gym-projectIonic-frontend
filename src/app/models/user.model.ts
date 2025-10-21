export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT'
}

export interface User {
  id: number; // Changé de id? à id (obligatoire)
  firstName: string;
  lastName: string;
  email: string;
  pwd?: string;
  phone?: number;
  role: Role;
  photo?: string;
  membershipType?: string;
  membershipStatus?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  startDate?: Date;
  endDate?: Date;
  offerId?: number;
  createdAt?: Date;
}