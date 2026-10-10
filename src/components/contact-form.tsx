"use client";

import Link from "next/link";
import { useActionState, type ComponentProps } from "react";

import type { ContactFormState } from "@/app/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContactField, ContactFormValues } from "@/lib/validation";

type ContactFormProps = {
  action: (
    state: ContactFormState,
    formData: FormData,
  ) => Promise<ContactFormState>;
  initialValues: ContactFormValues;
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
  autoFocusName?: boolean;
};

export function ContactForm({
  action,
  initialValues,
  submitLabel,
  pendingLabel,
  cancelHref,
  autoFocusName = false,
}: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    values: initialValues,
    errors: {},
  });

  // Built per render so inputs keep the submitted text after a failed save.
  function fieldProps(field: ContactField) {
    const error = state.errors[field];
    return {
      id: field,
      name: field,
      defaultValue: state.values[field],
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${field}-error` : undefined,
    } satisfies ComponentProps<"input">;
  }

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.formError && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.formError}
        </p>
      )}

      <Field label="Имя" required error={state.errors.name} field="name">
        <Input
          {...fieldProps("name")}
          autoFocus={autoFocusName}
          autoComplete="off"
          placeholder="Например: Анна Смирнова"
          className="h-9"
        />
      </Field>

      <Field
        label="Кто это"
        error={state.errors.about}
        field="about"
        hint="Коротко: кем человек вам приходится"
      >
        <Input
          {...fieldProps("about")}
          autoComplete="off"
          placeholder="Например: бывшая коллега, сосед, тренер по теннису"
          className="h-9"
        />
      </Field>

      <Field label="Откуда знакомы" error={state.errors.howWeMet} field="howWeMet">
        <Textarea
          {...fieldProps("howWeMet")}
          rows={3}
          placeholder="Например: познакомились на конференции в Казани в 2023 году"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Телефон" error={state.errors.phone} field="phone">
          <Input
            {...fieldProps("phone")}
            type="tel"
            autoComplete="off"
            placeholder="+7 900 123-45-67"
            className="h-9"
          />
        </Field>

        <Field label="Почта" error={state.errors.email} field="email">
          <Input
            {...fieldProps("email")}
            type="email"
            autoComplete="off"
            placeholder="name@example.com"
            className="h-9"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? pendingLabel : submitLabel}
        </Button>
        <Link
          href={cancelHref}
          className={buttonVariants({ variant: "ghost", size: "lg" })}
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  field,
  error,
  hint,
  required = false,
  children,
}: {
  label: string;
  field: ContactField;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field}>
        {label}
        {required && (
          <span className="text-destructive" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
      {error ? (
        <p id={`${field}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
