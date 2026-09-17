/** Crop Nest PR #3 profile / waitlist / wallet types. */

export interface AuthMeUser {
  id?: string;
  email?: string;
  displayName?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  imageUrl?: string | null;
  /** Count when Nest exposes graph later */
  mutualCount?: number | null;
  mutuals?: unknown[] | null;
  friendCount?: number | null;
  eventCount?: number | null;
  socialLinks?: Array<{ label?: string; name?: string; href?: string; url?: string }> | null;
  social?: Record<string, string | null | undefined> | null;
  instagram?: string | null;
  twitter?: string | null;
  tiktok?: string | null;
  website?: string | null;
}

export type ProfileScope = 'upcoming' | 'past' | 'all';

export interface ProfileEventRef {
  id: string;
  name?: string;
  title?: string;
  coverImageUrl?: string | null;
  image_url?: string | null;
  startDate?: string;
  startsAt?: string;
  endDate?: string;
  endsAt?: string;
  placeText?: string;
  place?: string;
}

export interface WaitlistJoinRequest {
  email?: string;
  guestSessionId?: string;
}

export interface WaitlistJoinResult {
  id?: string;
  eventId?: string;
  status?: string;
  position?: number;
}
