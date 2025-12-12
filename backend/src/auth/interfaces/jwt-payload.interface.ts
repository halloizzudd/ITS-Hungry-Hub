export interface JwtPayload {
  sub: number; // User ID
  email: string;
  role: string;
  verificationStatus?: string | null;
}
