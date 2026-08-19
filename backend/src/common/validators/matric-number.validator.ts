// Shared between register.dto.ts and update-profile.dto.ts so the format
// rule can't drift between signup and later profile edits. Mirrored again on
// the mobile side at mobile/src/lib/validation.ts's MATRIC_NUMBER_REGEX —
// keep all three in sync.
export const MATRIC_NUMBER_REGEX = /^[A-Za-z]{2,5}\/\d{2}\/\d{3,5}$/;
export const MATRIC_NUMBER_MESSAGE = 'Matric number must be in the format EEE/34/1234';
