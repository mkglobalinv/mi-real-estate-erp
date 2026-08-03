export enum Role {
  ADMIN_ENGINEER = 'ADMIN_ENGINEER',
  CHAIRMAN = 'CHAIRMAN',
  DIRECTOR = 'DIRECTOR',
  SECRETARY = 'SECRETARY',
  CUSTOMER_CARE = 'CUSTOMER_CARE',
  CUSTOMER = 'CUSTOMER',
  SOCIAL_MEDIA_DIRECTOR = 'SOCIAL_MEDIA_DIRECTOR'
}

export const MockPermissions = {
  [Role.ADMIN_ENGINEER]: ['all'],
  [Role.CHAIRMAN]: ['read:all', 'approve:all'],
  [Role.DIRECTOR]: ['read:all', 'manage:campaigns'],
  [Role.SECRETARY]: ['manage:leads', 'manage:requests'],
  [Role.CUSTOMER_CARE]: ['manage:leads', 'read:properties'],
  [Role.CUSTOMER]: ['read:public'],
  [Role.SOCIAL_MEDIA_DIRECTOR]: ['manage:campaigns', 'manage:leads']
};

export const hasPermission = (userRole: Role, permission: string) => {
  const perms = MockPermissions[userRole] || [];
  return perms.includes('all') || perms.includes(permission);
};
