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
   me/Other people/Intake) are virtual — computed, never stored rows — so they can never be
   deleted or emptied by mistake. Every folder — built-in or custom — lives under one real root,
   'zugbase', so the whole thing is one tree: zugbase > folder > sub-folder > ... */
export const ZUGBASE_ROOT = 'zugbase';
export type RootFolderKey = 'root:guys' | 'root:girls' | 'root:shadchanim' | 'root:ideas' | 'root:others' | 'root:intake';

export interface Folder {
  id: string;
  name: string;
  parentId: string; /* a Folder id, a RootFolderKey, or ZUGBASE_ROOT */
  createdAt: number;
}

/* A folder can hold more than people — a note, a photo, a recording — filed straight into it,
   the way a real filing cabinet would. */
export type FolderNoteKind = 'note' | 'photo' | 'audio' | 'file';

export interface FolderNote {
  id: string;
  folderId: string; /* a Folder id, a RootFolderKey, or ZUGBASE_ROOT */
  kind: FolderNoteKind;
  text?: string;
  fileId?: string;
  name?: string;
  createdAt: number;
}

export interface Memo {
  id: string;
  text: string;
  createdAt: number;
  linkedPersonId?: string;
}

/* Raw captured text/shares, kept exactly as they came until filed into a Person. A photo can
   be attached before filing (e.g. a screenshot that came with the text) and carries over to
   the Person it becomes. */
export interface InboxItem {
  id: string;
  text: string;
  photoFileId?: string;
  createdAt: number;
}

export interface FileRecord {
  id: string;
  personId?: string; /* set when the file belongs to a Person; unset for a folder note's file */
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
