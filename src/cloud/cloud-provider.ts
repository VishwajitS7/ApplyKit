import { JobApplication, CloudConfig, CloudSyncStatus } from './sync-types';
import { UserProfile } from '../types/profile';

export interface ICloudProvider {
  readonly id: string;
  readonly name: string;

  init(config: CloudConfig): Promise<void>;
  getStatus(): CloudSyncStatus;
  
  // Applications
  fetchApplications(): Promise<JobApplication[]>;
  saveApplication(app: JobApplication): Promise<JobApplication>;
  deleteApplication(id: string): Promise<boolean>;
  
  // Profile sync
  fetchProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<boolean>;

  // Bulk sync / export
  pushAll(applications: JobApplication[], profile?: UserProfile): Promise<boolean>;
}
