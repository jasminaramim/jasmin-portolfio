export interface Project {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  liveLink: string;
  githubLink?: string;
  assignTo?: string;
  type?: string;
  status?: string;
  orderId?: string;
  clientName?: string;
  profileName?: string;
  achievementValue?: number;
  totalProjectValue?: number;
  developerName?: string;
  docLink?: string;
  hasCaseStudy?: boolean;
}

export interface Service {
  _id?: string;
  title: string;
  desc: string;
  icon: string;
}

export interface Skill {
  _id?: string;
  name: string;
  level: number;
  category: string;
  logoLink?: string;
}

export interface SkillCategory {
  title: string;
  skills: Skill[];
}

export interface Review {
  _id?: string;
  clientName: string;
  description: string;
  rating: number; // 1-5
}

export interface AdminProfile {
  _id?: string;
  image: string;
  bio: string;
  socialLinks: {
    linkedin?: string;
    github?: string;
    facebook?: string;
    whatsapp?: string;
    messenger?: string;
  };
}

export interface Stat {
  label: string;
  value: string;
}