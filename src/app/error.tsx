"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Не получилось загрузить данные</h1>
      <p className="mt-2 text-muted-foreground">
        Скорее всего, не запущена база данных. Запустите её и попробуйте ещё
        раз.
      </p>
      <Button size="lg" className="mt-6" onClick={() => retry()}>
        Попробовать ещё раз
      </Button>
    </main>
  );
}
