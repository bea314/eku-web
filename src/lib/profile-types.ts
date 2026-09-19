/** Crop Nest PR #3 profile / waitlist / wallet types. */

export interface AuthMeCounts {
  hosted?: number | null;
  attended?: number | null;
  /** Aliases some Nest builds may send */
  hosting?: number | null;
  events?: number | null;
}

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
  /** Nest canónico — prefer over eventCount */
  counts?: AuthMeCounts | null;
  /** Count when Nest exposes graph later */
  mutualCount?: number | null;
  mutuals?: unknown[] | null;
  friendCount?: number | null;
  /** Legacy — prefer counts.hosted */
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
  cover_image_url?: string | null;
  image_url?: string | null;
  startDate?: string;
  startsAt?: string;
  start_date?: string;
  endDate?: string;
  endsAt?: string;
  end_date?: string;
  placeText?: string;
  place?: string;
}

/** Nest canónico for GET /profiles/me/hosted|attended — `{ events, nextCursor }` */
export interface ProfileEventsPage {
  events?: ProfileEventRef[] | null;
  nextCursor?: string | null;
  /** Legacy / mis-wrapped shapes */
  items?: ProfileEventRef[] | { events?: ProfileEventRef[] | null } | null;
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
