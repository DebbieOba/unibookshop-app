export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  phone?: string | null;
  interests: string[];
  notificationPreferences: { push?: boolean; email?: boolean };
  user?: {
    email?: string;
    matricNumber?: string | null;
    departmentId?: string | null;
    department?: { id: string; name: string } | null;
    levelId?: string | null;
    level?: { id: string; name: string } | null;
  } | null;
}

export interface Address {
  id: string;
  label?: string | null;
  street: string;
  city: string;
  state: string;
  isDefault: boolean;
}
