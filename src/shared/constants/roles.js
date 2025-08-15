/**
 * Centralized role constants and hierarchy for RBAC
 * @module roles
 */

/**
 * User roles
 * @type {Object.<string, string>}
 */
export const ROLES = Object.freeze({
  GLOBAL_SUPER_ADMIN: "global_super_admin",
  SCHOOL_SUPER_ADMIN: "school_super_admin",
  SCHOOL_ADMIN: "school_admin",
  STAFF: "staff",
  PARENT: "parent",
  STUDENT: "student",
});

/**
 * Role hierarchy for inheritance
 * @type {Object.<string, string[]>}
 */
export const ROLE_HIERARCHY = Object.freeze({
  [ROLES.GLOBAL_SUPER_ADMIN]: [
    ROLES.SCHOOL_SUPER_ADMIN,
    ROLES.SCHOOL_ADMIN,
    ROLES.STAFF,
    ROLES.PARENT,
    ROLES.STUDENT,
  ],
  [ROLES.SCHOOL_SUPER_ADMIN]: [
    ROLES.SCHOOL_ADMIN,
    ROLES.STAFF,
    ROLES.PARENT,
    ROLES.STUDENT,
  ],
  [ROLES.SCHOOL_ADMIN]: [ROLES.STAFF, ROLES.PARENT, ROLES.STUDENT],
  [ROLES.STAFF]: [],
  [ROLES.PARENT]: [],
  [ROLES.STUDENT]: [],
});

/**
 * Tenant-scoped roles requiring schoolId
 * @type {string[]}
 */
export const TENANT_SCOPED_ROLES = [
  ROLES.SCHOOL_SUPER_ADMIN,
  ROLES.SCHOOL_ADMIN,
  ROLES.STAFF,
  ROLES.PARENT,
  ROLES.STUDENT,
];

/**
 * HTTP status codes
 * @type {Object.<string, number>}
 */
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
});

// TODO: Add permissions mapping for fine-grained access control
