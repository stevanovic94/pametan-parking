export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'OPERATOR' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}