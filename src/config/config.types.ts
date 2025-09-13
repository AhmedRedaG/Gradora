export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  serverEmail: string;
  serverEmailPass: string;
}

export interface OtpConfig {
  min: number;
  max: number;
  expiresInMS: number;
  maxAttempts: number;
  coolDown: number;
  maxCoolDown: number;
}

export interface VerificationConfig {
  maxAttempts: number;
  coolDown: number;
  maxCoolDown: number;
}

export interface AuthAttemptConfig {
  maxAttempts: number;
  maxErrorMessage: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: number;
}
