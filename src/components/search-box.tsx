"use client";

import { LoaderCircle, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useTransition } from "react";

import { Input } from "@/components/ui/input";

const SEARCH_DELAY_MS = 250;

const iconClass =
  "pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground";

// Receives the query from the server instead of reading useSearchParams(),
// so the box is server-rendered and usable before the long list hydrates.
// The input is uncontrolled: text typed before hydration stays in the field.
export function SearchBox({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function search(text: string) {
    clearTimeout(timer.current);
    const query = text.trim();
    const href = query ? `/?q=${encodeURIComponent(query)}` : "/";
    startTransition(() => router.replace(href, { scroll: false }));
  }

  function scheduleSearch(text: string) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(text), SEARCH_DELAY_MS);
  }

  function clear() {
    const input = inputRef.current;
    if (input) {
      input.value = "";
      input.focus();
    }
    search("");
  }

  // onChange does not fire for text typed before hydration, so pick it up here.
  const searchTextTypedBeforeHydration = useEffectEvent(() => {
    const typed = inputRef.current?.value ?? "";
    if (typed.trim() !== initialQuery.trim()) {
      scheduleSearch(typed);
    }
  });

  useEffect(() => {
    searchTextTypedBeforeHydration();
    // A pending search must not navigate back here after the user has left.
    const pending = timer;
    return () => clearTimeout(pending.current);
  }, []);

  return (
    <form
      role="search"
      action="/"
      className="relative"
      onSubmit={(event) => {
        event.preventDefault();
        search(inputRef.current?.value ?? "");
      }}
    >
      <Search className={`${iconClass} left-3`} aria-hidden />
      <Input
        ref={inputRef}
        name="q"
        defaultValue={initialQuery}
        onChange={(event) => scheduleSearch(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && event.currentTarget.value) {
            event.preventDefault();
            clear();
          }
        }}
        placeholder="Найти по имени"
        aria-label="Поиск по имени"
        autoComplete="off"
        spellCheck={false}
        className="peer h-10 bg-background pr-10 pl-9 md:text-base"
      />
      {isPending ? (
        <LoaderCircle
          className={`${iconClass} right-3 animate-spin`}
          aria-label="Ищу…"
        />
      ) : (
        // Hidden by CSS while the field is empty, so it works before hydration too.
        <button
          type="button"
          onClick={clear}
          aria-label="Очистить поиск"
          className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground peer-placeholder-shown:hidden hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </form>
  );
}

/** Shown in place of the search box until the URL query is available. */
export function SearchBoxFallback() {
  return (
    <div className="relative">
      <Search className={`${iconClass} left-3`} aria-hidden />
      <Input
        disabled
        placeholder="Найти по имени"
        aria-label="Поиск по имени"
        className="h-10 bg-background pl-9 md:text-base"
      />
    </div>
  );
}
