import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Такой страницы нет</h1>
      <p className="mt-2 text-muted-foreground">
        Возможно, контакт был удалён или ссылка набрана с ошибкой.
      </p>
      <Link href="/" className={`${buttonVariants({ size: "lg" })} mt-6`}>
        К списку контактов
      </Link>
    </main>
  );
}
