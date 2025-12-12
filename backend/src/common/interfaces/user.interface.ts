export const UserRole = {
  ADMIN: 'admin' as const,
  USER: 'user' as const,
  SELLER: 'seller' as const,
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export type UserPayload = {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
};
