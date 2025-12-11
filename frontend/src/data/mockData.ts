import type { JobOffer } from "../types";

export const MOCK_OFFERS: JobOffer[] = [
  { 
    id: 1, 
    title: "Senior React Developer", 
    company: "TechSolutions", 
    location: "Warszawa (Remote)", 
    salary: "20k - 28k PLN netto",
    description: "Szukamy doświadczonego programisty React, który pomoże nam budować skalowalne aplikacje fintech. Będziesz odpowiedzialny za architekturę frontendu.",
    requirements: ["5+ lat doświadczenia w JS/TS", "Znajomość React i Redux", "Angielski B2+"]
  },
  { 
    id: 2, 
    title: "Mid Java Developer", 
    company: "BankSoft", 
    location: "Kraków", 
    salary: "15k - 20k PLN brutto",
    description: "Dołącz do zespołu rozwijającego systemy bankowości elektronicznej. Praca w metodologii Scrum.",
    requirements: ["Java 17", "Spring Boot", "Hibernate", "SQL"]
  },
  { 
    id: 3, 
    title: "UX/UI Designer", 
    company: "CreativeStudio", 
    location: "Gdańsk", 
    salary: "10k - 14k PLN netto",
    description: "Projektowanie interfejsów dla klientów z branży e-commerce. Praca z Figmą i pakietem Adobe.",
    requirements: ["Portfolio", "Figma", "Doświadczenie w badaniach z użytkownikami"]
  },
  {
    id: 4, 
    title: "DevOps Engineer", 
    company: "CloudMasters", 
    location: "Wrocław", 
    salary: "22k - 30k PLN netto",
    description: "Tworzenie i utrzymanie infrastruktury w chmurze AWS. Automatyzacja procesów CI/CD.",
    requirements: ["AWS", "Docker & Kubernetes", "Terraform", "Python/Bash"]
  }
];