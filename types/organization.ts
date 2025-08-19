export interface Organization {
  id: number;
  name: string;
  role: UserOrganizationRoleType;
}

export enum UserOrganizationRoleType {
  Member = 1,
  Admin = 2,
}
