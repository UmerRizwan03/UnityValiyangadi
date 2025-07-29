

export interface Magazine {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  publishDate: string; // YYYY-MM-DD
  pages: number;
  pdfUrl: string;
}

export interface Member {
  id: string;
  name: string;
  photoUrl: string;
  gender: 'Male' | 'Female' | 'Other';
  parents: string[];
  spouseName?: string | null;
  otherParentName?: string | null;
  bloodType?: string | null;
  dateOfBirth: string | null;
  dateOfDeath?: string | null;
  mobile?: string | null;
  email?: string | null;
  birthPlace?: string | null;
  occupation?: string | null;
  relationship: string;
}

// The form data from SmartForm won't have an ID, so we use Omit
export type NewMemberData = Omit<Member, 'id' | 'photoUrl'> & { photoUrl?: string };

export type GetMembersResponse = { members: Member[], error: string | null };

export interface User {
  uid: string;
  role: 'admin' | 'member';
  username: string;
  email: string;
  phoneNumber: string;
}

export interface ChangeRequest {
  id: string;
  type: 'add' | 'edit' | 'delete';
  status: 'pending' | 'approved' | 'rejected';
  requestedByUid: string;
  requestedByName: string; // This might be the username now
  requestedAt: any; // Firestore Timestamp, will be stringified for client
  memberId?: string; // for 'edit' and 'delete'
  memberName?: string; // for display in dashboard
  data?: Partial<NewMemberData>; // for 'add' and 'edit'
}
