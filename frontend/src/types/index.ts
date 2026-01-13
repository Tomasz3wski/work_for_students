export interface BackendRequirement {
  id: number;
  name: string;
}

export interface JobOffer {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  globalRequirements: BackendRequirement[];
  customRequirements: string[];
  benefits?: string;
  contractType?: string;
  remoteWork?: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}