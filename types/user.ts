export enum UserStatus {
  Unconfirmed = 1,
  Confirmed = 2,
  AccessDenied = 3,
  Deleted = 4,
}

export enum UserRole {
  User = 1,
  Admin = 2,
}

export interface ValidateTokenResult {
  jwt: string;
  status: UserStatus;
  role: UserRole;
}
