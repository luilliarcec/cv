import { z } from "zod";
import { LANGS } from "./locales.ts";

const text = z.string().trim().min(1);
const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "ids are lowercase words joined by hyphens");

// "2026" or "2026-02". YAML reads a bare year as a number, so it is coerced to a string first.
export const YearMonth = z.coerce.string().regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, "dates are YYYY or YYYY-MM");
const End = z.union([z.literal("present"), YearMonth]);

const Highlights = z.array(text).min(1);

export const Project = z.strictObject({
  id,
  name: text,
  description: text.optional(),
  role: text.optional(),
  start: YearMonth.optional(),
  end: End.optional(),
  highlights: Highlights,
});

export const Experience = z
  .strictObject({
    id,
    company: text,
    location: text,
    role: text,
    start: YearMonth,
    end: End,
    summary: text.optional(),
    highlights: Highlights.optional(),
    projects: z.array(Project).min(1).optional(),
  })
  .refine((entry) => entry.highlights || entry.projects, "an experience entry needs highlights, projects or both");

export const Education = z.strictObject({
  id,
  institution: text,
  location: text,
  degree: text,
  start: YearMonth.optional(),
  end: End,
});

export const Skill = z.strictObject({
  id,
  name: text,
  items: z.array(text).min(1),
});

// Everything that is written in one language: data/cv.<lang>.yaml.
export const Edition = z.strictObject({
  lang: z.enum(LANGS),
  labels: z.strictObject({
    profile: text,
    experience: text,
    projects: text,
    education: text,
    skills: text,
    present: text,
  }),
  headline: z.array(text).min(1),
  profile: text,
  experience: z.array(Experience).min(1),
  projects: z.array(Project),
  education: z.array(Education),
  skills: z.array(Skill),
});

// Everything that is the same in every language: data/contact.yaml.
export const Contact = z.strictObject({
  name: text,
  location: text,
  email: z.email(),
  phone: text,
  links: z.array(z.strictObject({ label: text, url: z.url() })),
});

export type Edition = z.infer<typeof Edition>;
export type Contact = z.infer<typeof Contact>;
export type Project = z.infer<typeof Project>;
