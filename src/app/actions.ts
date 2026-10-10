"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { insertContact, insertNote, updateContactById } from "@/lib/contacts";
import {
  CONTACT_FIELDS,
  contactInputSchema,
  firstFieldErrors,
  noteInputSchema,
  readFormText,
  type ContactField,
  type ContactFormValues,
} from "@/lib/validation";

export type ContactFormState = {
  values: ContactFormValues;
  errors: Partial<Record<ContactField, string>>;
  formError?: string;
};

export type NoteFormState = {
  // Keeps the typed text when saving fails, so nothing is lost.
  body: string;
  error?: string;
  // Increments on every saved note; the form uses it to clear itself.
  savedCount: number;
};

const SAVE_FAILED = "Не удалось сохранить. Проверьте, что база данных запущена, и попробуйте ещё раз.";
const CONTACT_MISSING = "Контакт не найден — возможно, его уже нет в базе.";

function readContactForm(formData: FormData): ContactFormValues {
  return Object.fromEntries(
    CONTACT_FIELDS.map((field) => [field, readFormText(formData, field)]),
  ) as ContactFormValues;
}

// Server Actions are public endpoints, so bound ids are re-checked here.
function isValidId(id: unknown): id is number {
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0;
}

export async function createContact(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values = readContactForm(formData);
  const parsed = contactInputSchema.safeParse(values);
  if (!parsed.success) {
    return { values, errors: firstFieldErrors(parsed.error) };
  }

  let id: number;
  try {
    id = await insertContact(parsed.data);
  } catch (error) {
    console.error("Failed to create contact", error);
    return { values, errors: {}, formError: SAVE_FAILED };
  }

  revalidatePath("/");
  redirect(`/?added=${id}`);
}

export async function updateContact(
  contactId: number,
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values = readContactForm(formData);
  if (!isValidId(contactId)) {
    return { values, errors: {}, formError: CONTACT_MISSING };
  }

  const parsed = contactInputSchema.safeParse(values);
  if (!parsed.success) {
    return { values, errors: firstFieldErrors(parsed.error) };
  }

  let found: boolean;
  try {
    found = await updateContactById(contactId, parsed.data);
  } catch (error) {
    console.error("Failed to update contact", { contactId, error });
    return { values, errors: {}, formError: SAVE_FAILED };
  }

  if (!found) {
    return { values, errors: {}, formError: CONTACT_MISSING };
  }

  revalidatePath("/");
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function addNote(
  contactId: number,
  previous: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const body = readFormText(formData, "body");
  if (!isValidId(contactId)) {
    return { ...previous, body, error: CONTACT_MISSING };
  }

  const parsed = noteInputSchema.safeParse({ body });
  if (!parsed.success) {
    return { ...previous, body, error: firstFieldErrors(parsed.error).body };
  }

  let found: boolean;
  try {
    found = await insertNote(contactId, parsed.data.body);
  } catch (error) {
    console.error("Failed to add note", { contactId, error });
    return { ...previous, body, error: SAVE_FAILED };
  }

  if (!found) {
    return { ...previous, body, error: CONTACT_MISSING };
  }

  revalidatePath("/");
  revalidatePath(`/contacts/${contactId}`);
  return { body: "", savedCount: previous.savedCount + 1 };
}
