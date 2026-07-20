export type ProfileImportDraft = {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience: {
    years: string;
    description: string;
  };
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  socialLinks: {
    platform: string;
    url: string;
  }[];
  source: {
    parsed: boolean;
    aiPolished: boolean;
    filename: string;
  };
};
