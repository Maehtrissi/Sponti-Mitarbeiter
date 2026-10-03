type EmployeeUser = {
  app_metadata?: Record<string, unknown>;
  is_anonymous?: boolean;
};

// Only administrator-controlled app_metadata grants employee access.
export function hasEmployeeAccess(user: EmployeeUser | null): boolean {
  return !!user && user.is_anonymous !== true && user.app_metadata?.sponti_employee === true;
}
