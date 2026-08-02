import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: string;
  scope?: string;
  tenantId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
