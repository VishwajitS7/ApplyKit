import { UserProfile } from '../types/profile';

export type ApplicationStatus = 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected';

export interface InterviewRound {
  id: string;
  title: string; // e.g. "Recruiter Screen", "System Design", "Hiring Manager"
  date: string;  // ISO string
  notes?: string;
  completed: boolean;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  url: string;
  status: ApplicationStatus;
  appliedDate: string; // ISO date string
  salary?: string;
  location?: string;   // e.g. "Remote", "San Francisco, CA"
  notes?: string;
  matchedSkills?: string[];
  tailoredSummary?: string;
  interviewRounds?: InterviewRound[];
  updatedAt: string;
  createdAt: string;
}

export type CloudSyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export type CloudProviderType = 'local_gateway' | 'firebase' | 'custom_api';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  providerId: 'google.com' | 'demo' | 'local';
}

export interface CloudConfig {
  provider: CloudProviderType;
  autoSync: boolean;
  endpointUrl?: string;
  apiKey?: string;
  projectId?: string;
  lastSyncedAt?: string;
  firebaseConfig?: FirebaseConfig;
}

export interface TrackerMetrics {
  totalApplications: number;
  appliedCount: number;
  interviewingCount: number;
  offerCount: number;
  rejectedCount: number;
  wishlistCount: number;
  responseRatePercent: number; // (interviewing + offer) / (applied + interviewing + offer + rejected)
  topSkillsInDemand: Array<{ skill: string; count: number }>;
}

export interface CloudSyncPayload {
  version: 1;
  lastUpdated: string;
  applications: JobApplication[];
  profile?: UserProfile;
}
