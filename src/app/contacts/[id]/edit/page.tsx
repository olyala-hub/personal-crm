import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { updateContact } from "@/app/actions";
import { BackLink } from "@/components/back-link";
import { ContactForm } from "@/components/contact-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getContact } from "@/lib/contacts";
import { parseId } from "@/lib/format";
import { toContactFormValues } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Изменить контакт",
};

export default function EditContactPage({
  params,
}: PageProps<"/contacts/[id]/edit">) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Suspense fallback={<EditFormSkeleton />}>
        <EditContact params={params} />
      </Suspense>
    </main>
  );
}

async function EditContact({
  params,
}: Pick<PageProps<"/contacts/[id]/edit">, "params">) {
  const id = parseId((await params).id);
  if (!id) {
    notFound();
  }

  const contact = await getContact(id);
  if (!contact) {
    notFound();
  }

  return (
    <>
      <BackLink href={`/contacts/${contact.id}`}>К карточке</BackLink>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-semibold">Изменить контакт</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm
            action={updateContact.bind(null, contact.id)}
            initialValues={toContactFormValues(contact)}
            submitLabel="Сохранить"
            pendingLabel="Сохраняю…"
            cancelHref={`/contacts/${contact.id}`}
          />
        </CardContent>
      </Card>
    </>
  );
}

function EditFormSkeleton() {
  return (
    <div className="rounded-xl border bg-background p-6" aria-busy aria-label="Загружаю контакт">
      <Skeleton className="h-6 w-1/3" />
      <div className="mt-6 space-y-5">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}
