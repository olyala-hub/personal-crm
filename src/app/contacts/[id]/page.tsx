import { Mail, Pencil, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { addNote } from "@/app/actions";
import { BackLink } from "@/components/back-link";
import { NoteForm } from "@/components/note-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getContact, getContactNotes } from "@/lib/contacts";
import { formatDateTime, parseId, pluralize } from "@/lib/format";

export const metadata: Metadata = {
  title: "Карточка контакта",
};

export default function ContactPage({ params }: PageProps<"/contacts/[id]">) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <BackLink href="/">Все контакты</BackLink>
      <Suspense fallback={<ContactCardSkeleton />}>
        <ContactDetails params={params} />
      </Suspense>
    </main>
  );
}

async function ContactDetails({
  params,
}: Pick<PageProps<"/contacts/[id]">, "params">) {
  const id = parseId((await params).id);
  if (!id) {
    notFound();
  }

  const [contact, notes] = await Promise.all([
    getContact(id),
    getContactNotes(id),
  ]);
  if (!contact) {
    notFound();
  }

  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-semibold tracking-tight break-words">
              {contact.name}
            </h1>
          </CardTitle>
          {contact.about && (
            <CardDescription className="text-base">
              {contact.about}
            </CardDescription>
          )}
          <CardAction>
            <Link
              href={`/contacts/${contact.id}/edit`}
              className={buttonVariants({ variant: "outline" })}
            >
              <Pencil aria-hidden />
              Изменить
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Телефон">
              {contact.phone && (
                <a
                  href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                  className="inline-flex items-center gap-1.5 hover:underline"
                >
                  <Phone className="size-4 text-muted-foreground" aria-hidden />
                  {contact.phone}
                </a>
              )}
            </DetailItem>
            <DetailItem label="Почта">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-1.5 break-all hover:underline"
                >
                  <Mail className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  {contact.email}
                </a>
              )}
            </DetailItem>
            <DetailItem label="Откуда знакомы" wide>
              {contact.howWeMet && (
                <p className="whitespace-pre-wrap break-words">
                  {contact.howWeMet}
                </p>
              )}
            </DetailItem>
          </dl>
        </CardContent>
      </Card>

      <section className="mt-8" aria-labelledby="notes-heading">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="notes-heading" className="text-lg font-semibold">
            Заметки
          </h2>
          {notes.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {notes.length}{" "}
              {pluralize(notes.length, {
                one: "заметка",
                few: "заметки",
                many: "заметок",
              })}
            </span>
          )}
        </div>

        <div className="mt-3">
          <NoteForm action={addNote.bind(null, contact.id)} />
        </div>

        <Separator className="my-6" />

        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Заметок пока нет. Запишите, о чём поговорили, — и контекст не
            потеряется.
          </p>
        ) : (
          <ol className="space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-xl border bg-background px-4 py-3"
              >
                <time
                  dateTime={note.createdAt.toISOString()}
                  className="text-xs text-muted-foreground"
                >
                  {formatDateTime(note.createdAt)}
                </time>
                <p className="mt-1 whitespace-pre-wrap break-words">
                  {note.body}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

function DetailItem({
  label,
  wide = false,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1">
        {children || <span className="text-muted-foreground">Не указано</span>}
      </dd>
    </div>
  );
}

function ContactCardSkeleton() {
  return (
    <div className="mt-4 space-y-4" aria-busy aria-label="Загружаю карточку">
      <div className="rounded-xl border bg-background p-6">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="mt-3 h-4 w-1/3" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
