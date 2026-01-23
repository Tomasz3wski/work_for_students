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
  benefits?: string;
  contractType: string;
  remoteWork: boolean;
  globalRequirements?: { id: number; name: string }[];
  customRequirements?: string[];
  // NOWE POLA
  workHoursStart?: string;
  workHoursEnd?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}