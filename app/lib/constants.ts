/**
 * Application constants for PriorityMatrix
 * Centralizes magic strings and configuration values
 */

// ============================================
// Storage Keys
// ============================================

/** Key for storing auth session in localStorage */
export const STORAGE_KEY_AUTH = "prioritymatrix-auth";

/** Key for storing theme preference in localStorage */
export const STORAGE_KEY_THEME = "theme";

/** Key for storing GitHub Pages redirect path in sessionStorage */
export const STORAGE_KEY_GH_PAGES_REDIRECT = "gh-pages-redirect";

/** Key for storing post-auth redirect path in sessionStorage */
export const STORAGE_KEY_POST_AUTH_REDIRECT = "post-auth-redirect";

/** Key for storing capacity error message in sessionStorage */
export const STORAGE_KEY_CAPACITY_ERROR = "capacity-error";

// ============================================
// Supabase Error Codes (from RLS policies)
// ============================================

/** User capacity reached (100 users) */
export const ERROR_CODE_CAPACITY = "PMCAP";

/** Task maximum reached (30 active tasks per user) */
export const ERROR_CODE_TASK_MAX = "PMTMA";

/** Task rate limit exceeded (1 task per second) */
export const ERROR_CODE_RATE_LIMIT = "PMTRL";

/** User ID required but null */
export const ERROR_CODE_NULL_USER = "PMNUL";

// ============================================
// Error Messages (User-Friendly)
// ============================================

export const ERROR_MESSAGES = {
  [ERROR_CODE_CAPACITY]:
    "PriorityMatrix has reached its user capacity. Please try again later or contact support.",
  [ERROR_CODE_TASK_MAX]:
    "You already have 30 active tasks. Complete or delete one before adding another.",
  [ERROR_CODE_RATE_LIMIT]:
    "Easy there! You can only add one task per second. Please try again.",
  [ERROR_CODE_NULL_USER]:
    "Authentication required. Please sign in to continue.",
  default: "An unexpected error occurred. Please try again.",
} as const;

/**
 * Get a user-friendly error message from a Supabase error
 * @param error - The error message or object from Supabase
 * @returns A user-friendly error message
 */
export function getErrorMessage(error: string | { message?: string }): string {
  const errorString = typeof error === "string" ? error : error?.message ?? "";

  // Check for known error codes
  if (errorString.includes(ERROR_CODE_RATE_LIMIT)) {
    return ERROR_MESSAGES[ERROR_CODE_RATE_LIMIT];
  }
  if (errorString.includes(ERROR_CODE_TASK_MAX)) {
    return ERROR_MESSAGES[ERROR_CODE_TASK_MAX];
  }
  if (errorString.includes(ERROR_CODE_CAPACITY)) {
    return ERROR_MESSAGES[ERROR_CODE_CAPACITY];
  }
  if (errorString.includes(ERROR_CODE_NULL_USER)) {
    return ERROR_MESSAGES[ERROR_CODE_NULL_USER];
  }

  // Return the original error if no match, or default message
  return errorString || ERROR_MESSAGES.default;
}

// ============================================
// Application Limits
// ============================================

/** Maximum number of user accounts allowed */
export const LIMIT_MAX_USERS = 100;

/** Maximum number of active (non-completed) tasks per user */
export const LIMIT_MAX_ACTIVE_TASKS = 30;

/** Minimum interval between task insertions (in ms) */
export const LIMIT_TASK_INSERT_INTERVAL_MS = 1000;

// ============================================
// Task Status Values
// ============================================

export const TASK_STATUS = {
  TODO: "todo",
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

// ============================================
// Routes
// ============================================

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  AUTH_CALLBACK: "/auth/callback",
  CAPACITY: "/capacity",
  ADD_TODO: "/add-todo",
  ADD_TODO_POSITION: "/add-todo/position",
  TODOS: "/todos",
} as const;

// ============================================
// Supabase Tables
// ============================================

export const TABLES = {
  TODOS: "todos",
  USER_PROFILES: "user_profiles",
} as const;

// ============================================
// Supabase RPC Functions
// ============================================

export const RPC_FUNCTIONS = {
  CHECK_USER_CAPACITY: "check_user_capacity",
  ENSURE_USER_SLOT: "ensure_user_slot",
} as const;
