export interface JwtPayload {
  sub: string;
}

export enum JwtTypes {
  ACC = 'access',
  REF = 'refresh',
  VER = 'verification',
}
