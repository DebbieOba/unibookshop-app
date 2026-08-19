// Matric number format shared by SignUpScreen's zod schema — mirrored
// server-side on RegisterDto.matricNumber via the same pattern (backend
// doesn't import this file, but the regex must stay identical).
export const MATRIC_NUMBER_REGEX = /^[A-Za-z]{2,5}\/\d{2}\/\d{3,5}$/;
