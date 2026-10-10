import { CircleCheck } from "lucide-react";
import Link from "next/link";

import { ContactRows } from "@/components/contact-rows";
import { ScrollIntoView } from "@/components/scroll-into-view";
import { Skeleton } from "@/components/ui/skeleton";
import { countContacts, listContacts } from "@/lib/contacts";
import { firstParam, formatContactCount, parseId } from "@/lib/format";

export async function ContactList({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const params = await searchParams;
  const query = firstParam(params.q).trim();
  const addedId = parseId(firstParam(params.added));

  const [contacts, total] = await Promise.all([
    listContacts(query),
    query ? countContacts() : null,
  ]);
  const totalCount = total ?? contacts.length;
  const added = addedId
    ? contacts.find((contact) => contact.id === addedId)
    : undefined;

  return (
    <section className="mt-4" aria-label="Список контактов">
      {added && (
        <div
          role="status"
          className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          <CircleCheck className="size-4 shrink-0" aria-hidden />
          <span>
            Контакт <strong>{added.name}</strong> добавлен в список
          </span>
          <Link
            href={`/contacts/${added.id}`}
            className="font-medium underline underline-offset-4"
          >
            Открыть карточку
          </Link>
        </div>
      )}

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {query
          ? `Найдено: ${contacts.length} из ${totalCount}`
          : `Всего: ${formatContactCount(totalCount)}`}
      </p>

      {contacts.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <div className="mt-2 overflow-hidden rounded-xl border bg-background">
          <div
            className="contact-row-grid hidden border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground sm:grid"
            aria-hidden
          >
            <span>Имя</span>
            <span>Телефон</span>
            <span>Почта</span>
          </div>
          <ContactRows contacts={contacts} highlightedId={added?.id ?? null} />
        </div>
      )}

      {added && <ScrollIntoView elementId={`contact-${added.id}`} />}
    </section>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="mt-2 rounded-xl border border-dashed bg-background px-6 py-12 text-center">
      {query ? (
        <>
          <p className="font-medium">Никого не нашлось по запросу «{query}»</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Поиск идёт по имени. Проверьте написание или{" "}
            <Link href="/" className="underline underline-offset-4">
              покажите всех
            </Link>
            .
          </p>
        </>
      ) : (
        <>
          <p className="font-medium">Пока нет ни одного контакта</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Нажмите «Добавить контакт», чтобы записать первого человека.
          </p>
        </>
      )}
    </div>
  );
}

export function ContactListSkeleton() {
  return (
    <div className="mt-4" aria-busy aria-label="Загружаю контакты">
      <Skeleton className="h-4 w-32" />
      <div className="mt-2 space-y-px overflow-hidden rounded-xl border bg-background">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="px-4 py-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="mt-2 h-3 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
