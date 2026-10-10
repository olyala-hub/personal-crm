import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { ContactList, ContactListSkeleton } from "@/components/contact-list";
import { SearchBox, SearchBoxFallback } from "@/components/search-box";
import { buttonVariants } from "@/components/ui/button";
import { firstParam } from "@/lib/format";

export default function ContactsPage({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Контакты</h1>
        <Link href="/contacts/new" className={buttonVariants({ size: "lg" })}>
          <Plus aria-hidden />
          Добавить контакт
        </Link>
      </div>

      <div className="mt-4">
        <Suspense fallback={<SearchBoxFallback />}>
          <SearchBoxForUrl searchParams={searchParams} />
        </Suspense>
      </div>

      <Suspense fallback={<ContactListSkeleton />}>
        <ContactList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function SearchBoxForUrl({
  searchParams,
}: Pick<PageProps<"/">, "searchParams">) {
  const query = firstParam((await searchParams).q);
  return <SearchBox initialQuery={query} />;
}
