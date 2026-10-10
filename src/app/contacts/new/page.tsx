import type { Metadata } from "next";

import { createContact } from "@/app/actions";
import { BackLink } from "@/components/back-link";
import { ContactForm } from "@/components/contact-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EMPTY_CONTACT_FORM } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Новый контакт",
};

export default function NewContactPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <BackLink href="/">Все контакты</BackLink>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-semibold">Новый контакт</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm
            action={createContact}
            initialValues={EMPTY_CONTACT_FORM}
            submitLabel="Добавить контакт"
            pendingLabel="Добавляю…"
            cancelHref="/"
            autoFocusName
          />
        </CardContent>
      </Card>
    </main>
  );
}
