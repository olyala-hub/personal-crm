"use client";

import Link from "next/link";

import type { ContactListItem } from "@/lib/contacts";
import { cn } from "@/lib/utils";

/**
 * Rendered as a Client Component on purpose: the server then sends only the
 * contact data instead of a serialized element tree for every row, which
 * roughly halves the page size for a list of 1000+ contacts.
 */
export function ContactRows({
  contacts,
  highlightedId,
}: {
  contacts: ContactListItem[];
  highlightedId: number | null;
}) {
  return (
    <ul className="divide-y">
      {contacts.map((contact) => {
        const highlighted = contact.id === highlightedId;
        return (
          <li
            key={contact.id}
            id={highlighted ? `contact-${contact.id}` : undefined}
          >
            <Link
              href={`/contacts/${contact.id}`}
              className={cn(
                "contact-row-grid contact-row",
                highlighted && "contact-row-added",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {contact.name}
                </span>
                {contact.about && (
                  <span className="block truncate text-sm text-muted-foreground">
                    {contact.about}
                  </span>
                )}
              </span>
              <span className="truncate text-sm">{contact.phone}</span>
              <span className="truncate text-sm text-muted-foreground">
                {contact.email}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
