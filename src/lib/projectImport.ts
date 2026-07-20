export type ProjectImportDraft = {
  url: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  links: { url: string; label: string }[];
  source: {
    scraped: boolean;
    aiPolished: boolean;
    hasScreenshot: boolean;
  };
};
