export type Role = 'guy' | 'girl' | 'shadchan' | 'other';
export type BodyType = 'regular' | 'overweight' | '';
export type HowWellKnown = 'personal' | 'recommended' | 'details';
export type Mode = 'single' | 'shadchan';

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

/* Who told me about this record — a contact/shadchan for a guy or girl, or the shadchan who
   referred another shadchan. One field covers both, so the referral tree is just "group by
   cameFrom.personId". */
export interface CameFrom {
  personId?: string;
  name?: string; /* free text when not linked to an existing person */
  phone?: string;
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

  cameFrom?: CameFrom;
  linkedShadchanId?: string;
  howWellKnown?: HowWellKnown;
  suggestedToMe?: boolean;

  photoFileId?: string;
  audioFileId?: string;
  attachmentFileId?: string;
  attachmentName?: string;
  attachmentType?: string;

  nextStepDue?: number; /* Call due — on anyone, not only shadchanim */

  folderIds: string[]; /* custom folders this person was explicitly added to */

  activities: Activity[];
  createdAt?: number;
  deletedAt?: number;
}

/* Custom, owner-made folders. Built-in top folders (Guys/Girls/Shadchanim/Ideas for
   me/Other people) are virtual — computed from role/suggestedToMe, never stored rows — so they
   can never be deleted or emptied by mistake. parentId is either another folder's id or one of
   the virtual root keys below. */
export type RootFolderKey = 'root:guys' | 'root:girls' | 'root:shadchanim' | 'root:ideas' | 'root:others';

export interface Folder {
  id: string;
  name: string;
  parentId: string; /* a Folder id, or a RootFolderKey */
  createdAt: number;
}

export interface Memo {
  id: string;
  text: string;
  createdAt: number;
  linkedPersonId?: string;
}

/* Raw captured text/shares, kept exactly as they came until filed into a Person. */
export interface InboxItem {
  id: string;
  text: string;
  createdAt: number;
}

export interface FileRecord {
  id: string;
  personId: string;
  kind: 'photo' | 'audio' | 'attachment';
  blob: Blob;
  name?: string;
  type?: string;
}

export interface Settings {
  key: 'app';
  mode: Mode;
  iAm: 'guy' | 'girl';
  waitDays: number;
  lastBackupAt?: number;
}
