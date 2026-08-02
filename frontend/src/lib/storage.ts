// Accès centralisé au localStorage : parsing JSON tolérant aux erreurs,
// clés préfixées et résolution du tenant actif.

export const DEFAULT_TENANT_ID = '39b8b0e8-1111-4444-a1a1-9b1979b00001';

/** Clés globales du localStorage. */
export const STORAGE_KEYS = {
  accessToken: 'kpsydesk_access_token',
  activeTenantId: 'kpsydesk_active_tenant_id',
  attendances: 'kpsydesk_attendances',
  classes: 'kpsydesk_classes',
  courses: 'kpsydesk_courses',
  evaluations: 'kpsydesk_evaluations',
  pricingPlans: 'kpsydesk_pricing_plans',
  schoolSettings: 'kpsydesk_school_settings',
  students: 'kpsydesk_students',
  teachers: 'kpsydesk_teachers',
  theme: 'kpsydesk_theme',
  timetable: 'kpsydesk_timetable',
} as const;

/** Préfixes des clés isolées par tenant (à combiner avec tenantScopedKey). */
export const TENANT_KEY_PREFIXES = {
  clockEvents: 'kpsydesk_clock_events',
  expenses: 'kpsydesk_tenant_expenses',
  payments: 'kpsydesk_tenant_payments',
  users: 'kpsydesk_tenant_users',
} as const;

/** Disponibilités déclarées par un enseignant. */
export const availabilitiesKey = (teacherId: string) => `kpsydesk_availabilities_${teacherId}`;

/** Matières activées pour une classe donnée. */
export const classSubjectsKey = (classId: string) => `kpsydesk_class_subjects_${classId}`;

/** Lit une valeur JSON, en retournant le fallback si absente ou illisible. */
export function readStored<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Donnée locale illisible pour "${key}" :`, err);
    return fallback;
  }
}

export function writeStored<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeStored(key: string): void {
  localStorage.removeItem(key);
}

/** Comme readStored, mais persiste la valeur par défaut lors du premier accès. */
export function readStoredOrSeed<T>(key: string, seed: T): T {
  const raw = localStorage.getItem(key);
  if (raw === null) {
    writeStored(key, seed);
    return seed;
  }

  return readStored(key, seed);
}

export function getActiveTenantId(): string {
  return localStorage.getItem(STORAGE_KEYS.activeTenantId) || DEFAULT_TENANT_ID;
}

/** Clé de stockage isolée par tenant (ex: kpsydesk_tenant_payments_<tenantId>). */
export function tenantScopedKey(prefix: string, tenantId: string = getActiveTenantId()): string {
  return `${prefix}_${tenantId}`;
}
