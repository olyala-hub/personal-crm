const dateTimeFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(date: Date): string {
  return dateTimeFormat.format(date);
}

const pluralRules = new Intl.PluralRules("ru-RU");

/**
 * Picks the Russian word form for a count, e.g.
 * pluralize(5, { one: "контакт", few: "контакта", many: "контактов" }).
 */
export function pluralize(
  count: number,
  forms: { one: string; few: string; many: string },
): string {
  const category = pluralRules.select(count);
  if (category === "one") return forms.one;
  if (category === "few") return forms.few;
  return forms.many;
}

export function formatContactCount(count: number): string {
  return `${count} ${pluralize(count, { one: "контакт", few: "контакта", many: "контактов" })}`;
}

/** Parses a route param like "42" into a positive integer id. */
export function parseId(raw: string | string[] | undefined): number | null {
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) {
    return null;
  }
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}
