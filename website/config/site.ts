export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "VisionAI",
  description: "CCTV analyser for your factory",
  navItems: [
    {
      label: "Feed",
      href: "/feed",
    },
    {
      label: "Violations",
      href: "/alerts",
    },
    {
      label: "Configs",
      href: "/configs",
    },
  ],
  links: {
    github: "https://github.com/Aashima77/Binary_Brains",
  },
};
