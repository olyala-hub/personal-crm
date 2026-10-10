"use client";

import { CircleCheck } from "lucide-react";
import { useActionState } from "react";

import type { NoteFormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const INITIAL_STATE: NoteFormState = { body: "", savedCount: 0 };

export function NoteForm({
  action,
}: {
  action: (state: NoteFormState, formData: FormData) => Promise<NoteFormState>;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const justSaved = state.savedCount > 0 && !state.error && !isPending;

  return (
    <form action={formAction} className="space-y-2">
      <Label htmlFor="note-body" className="sr-only">
        Новая заметка
      </Label>
      <Textarea
        // Remount after each save so the field is empty for the next note.
        key={state.savedCount}
        id="note-body"
        name="body"
        defaultValue={state.body}
        rows={3}
        placeholder="О чём поговорили, о чём договорились…"
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? "note-error" : undefined}
        className="bg-background"
      />
      {state.error && (
        <p id="note-error" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Сохраняю…" : "Добавить заметку"}
        </Button>
        {justSaved && (
          <span
            role="status"
            className="flex items-center gap-1.5 text-sm text-emerald-700"
          >
            <CircleCheck className="size-4" aria-hidden />
            Заметка сохранена
          </span>
        )}
      </div>
    </form>
  );
}
