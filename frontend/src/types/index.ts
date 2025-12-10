export interface JobOffer {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
}

export interface AuthCredentials {
  email: string;
  password: string;
}