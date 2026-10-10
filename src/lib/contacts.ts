import "server-only";

import { and, asc, count, desc, eq, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { contacts, notes } from "@/db/schema";

import type { ContactInput } from "./validation";

export type ContactListItem = Pick<
  typeof contacts.$inferSelect,
  "id" | "name" | "about" | "phone" | "email"
>;

/** Lowercases and folds "ё" into "е" so "Семён" and "Семен" match. */
function normalizeForSearch(value: string): string {
  return value.toLocaleLowerCase("ru-RU").replaceAll("ё", "е");
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * Every word of the query must appear somewhere in the name,
 * so "Иван Петров" also finds "Петров Иван Сергеевич".
 */
function nameMatches(query: string): SQL | undefined {
  const words = normalizeForSearch(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return undefined;
  }

  const normalizedName = sql`replace(lower(${contacts.name}), 'ё', 'е')`;
  return and(
    ...words.map(
      (word) => sql`${normalizedName} like ${`%${escapeLikePattern(word)}%`}`,
    ),
  );
}

export async function listContacts(query = ""): Promise<ContactListItem[]> {
  return db
    .select({
      id: contacts.id,
      name: contacts.name,
      about: contacts.about,
      phone: contacts.phone,
      email: contacts.email,
    })
    .from(contacts)
    .where(nameMatches(query))
    .orderBy(asc(contacts.name), asc(contacts.id));
}

export async function countContacts(): Promise<number> {
  const [row] = await db.select({ value: count() }).from(contacts);
  return row?.value ?? 0;
}

export async function getContact(id: number) {
  const [contact] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, id));

  return contact ?? null;
}

export async function getContactNotes(contactId: number) {
  return db
    .select({
      id: notes.id,
      body: notes.body,
      createdAt: notes.createdAt,
    })
    .from(notes)
    .where(eq(notes.contactId, contactId))
    .orderBy(desc(notes.createdAt), desc(notes.id));
}

export async function insertContact(input: ContactInput): Promise<number> {
  const [created] = await db
    .insert(contacts)
    .values(input)
    .returning({ id: contacts.id });

  return created.id;
}

/** Returns false when the contact does not exist. */
export async function updateContactById(
  id: number,
  input: ContactInput,
): Promise<boolean> {
  const updated = await db
    .update(contacts)
    .set(input)
    .where(eq(contacts.id, id))
    .returning({ id: contacts.id });

  return updated.length > 0;
}

/** Returns false when the contact does not exist. */
export async function insertNote(
  contactId: number,
  body: string,
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const touched = await tx
      .update(contacts)
      .set({ updatedAt: new Date() })
      .where(eq(contacts.id, contactId))
      .returning({ id: contacts.id });

    if (touched.length === 0) {
      return false;
    }

    await tx.insert(notes).values({ contactId, body });
    return true;
  });
}
