import { z } from "zod";

// User-facing messages are in Russian: they are shown in the UI as is.

const PHONE_ALLOWED_CHARS = /^\+?[\d\s()-]+$/;
const MIN_PHONE_DIGITS = 5;

/** Trims the value and stores an empty field as null. */
function optionalText(maxLength: number, tooLongMessage: string) {
  return z
    .string()
    .trim()
    .max(maxLength, { error: tooLongMessage })
    .transform((value) => (value === "" ? null : value));
}

export const contactInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Укажите имя" })
    .max(200, { error: "Имя слишком длинное: максимум 200 символов" }),
  about: optionalText(300, "Слишком длинно: максимум 300 символов"),
  howWeMet: optionalText(2000, "Слишком длинно: максимум 2000 символов"),
  phone: optionalText(50, "Слишком длинный номер").refine(
    (value) =>
      value === null ||
      (PHONE_ALLOWED_CHARS.test(value) &&
        value.replace(/\D/g, "").length >= MIN_PHONE_DIGITS),
    { error: "Номер может содержать цифры, пробелы, +, скобки и дефис" },
  ),
  email: optionalText(254, "Слишком длинный адрес").refine(
    (value) => value === null || z.email().safeParse(value).success,
    { error: "Похоже, в адресе почты опечатка" },
  ),
});

export type ContactInput = z.output<typeof contactInputSchema>;

export const CONTACT_FIELDS = [
  "name",
  "about",
  "howWeMet",
  "phone",
  "email",
] as const satisfies readonly (keyof ContactInput)[];

export type ContactField = (typeof CONTACT_FIELDS)[number];

export type ContactFormValues = Record<ContactField, string>;

export const EMPTY_CONTACT_FORM: ContactFormValues = {
  name: "",
  about: "",
  howWeMet: "",
  phone: "",
  email: "",
};

/** Prefills the edit form with stored values; empty fields become "". */
export function toContactFormValues(
  contact: Record<ContactField, string | null>,
): ContactFormValues {
  return Object.fromEntries(
    CONTACT_FIELDS.map((field) => [field, contact[field] ?? ""]),
  ) as ContactFormValues;
}

export const noteInputSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, { error: "Заметка пустая — напишите хоть пару слов" })
    .max(5000, { error: "Слишком длинная заметка: максимум 5000 символов" }),
});

/** Reads a text field from a submitted form; missing fields become "". */
export function readFormText(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

/** Picks the first message for each field from a failed validation. */
export function firstFieldErrors<T>(
  error: z.ZodError<T>,
): Partial<Record<string, string>> {
  const { fieldErrors } = z.flattenError(error);
  const result: Partial<Record<string, string>> = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    const first = (messages as string[] | undefined)?.[0];
    if (first) {
      result[field] = first;
    }
  }
  return result;
}
