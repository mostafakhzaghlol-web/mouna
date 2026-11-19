/** Mouna brand tokens. Source of truth: brand identity board (first direction, Nov 2026). */
export const colors = {
  pine: "#0F5C52", // primary: actions, navigation
  saffron: "#E9A23B", // accent: fills and status only, never text
  ink: "#12211E", // text
  mist: "#C4DAD2", // borders, quiet surfaces
  paper: "#F6F8F5", // background
} as const;

export const fonts = {
  heading: "Space Grotesk",
  body: "Inter",
  arabic: "IBM Plex Sans Arabic",
} as const;

export const brandName = { en: "Mouna", ar: "مونة" } as const;
export const tagline = { en: "Always stocked", ar: "مونة مكتبك، دايماً جاهزة" } as const;
