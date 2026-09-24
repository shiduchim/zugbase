export type Role = 'guy' | 'girl' | 'shadchan';
export type BodyType = 'regular' | 'overweight' | '';

export interface Age {
  value: number;
  asOf: number; /* ms — never invented; counts forward from here */
}

export interface Activity {
  id: string;
  type: 'text' | 'action';
  text: string;
  ts: number;
  to?: string; /* "name • phone" */
}

export interface Person {
  id: string;
  role: Role;
  name: string;
  age?: Age;
  text: string; /* profile text (guy/girl) or notes (shadchan) */

  profilePhone?: string;
  contact1Name?: string;
  contact1Phone?: string;
  contact2Name?: string;
  contact2Phone?: string;
  email?: string;

  lookingFor?: string;
  lookingForMaxAge?: string;

  tags?: string;
  religiousLevel?: string;
  religiousDetails?: string;

  divorced?: boolean;
  withKids?: boolean;
  kosherForKohen?: boolean;
  kohen?: boolean;
  baalTeshuvah?: boolean;
  watchesMovies?: boolean;
  prays3Daily?: boolean;
  smokes?: boolean;
  langEnglish?: boolean;
  langHebrew?: boolean;
  langRussian?: boolean;
  bodyType?: BodyType;

  talkedPhone?: boolean;
  talkedInPerson?: boolean;
  phoneConversationNote?: string;
  inPersonConversationNote?: string;

  waitingForReply?: boolean;
  waitingForReplySince?: number;

  /* shadchan only */
  phone?: string;
  referredById?: string;

  linkedShadchanId?: string;

  nextStepDue?: number; /* Call due — on anyone, not only shadchanim */

  activities: Activity[];
  createdAt?: number;
  deletedAt?: number;
}

export interface Memo {
  id: string;
  text: string;
  createdAt: number;
}
