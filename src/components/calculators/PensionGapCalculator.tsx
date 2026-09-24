"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { captureAndPersistTraffic } from "@/lib/leads/traffic";
import {
  RISK_LEVELS,
  RETIREMENT_AGE_BY_GENDER,
  SAVINGS_ASSET_OPTIONS,
  SAVINGS_TYPES_WITH_MANAGER,
  type Gender,
  type RiskId,
} from "@/lib/calculators/pension-gap/constants";
import {
  computePensionGap,
  formatILS,
  formatILSApprox,
  makeHolding,
} from "@/lib/calculators/pension-gap/math";
import type {
  ContributionDestination,
  EntryStage,
  Holding,
  PensionGapInputs,
  PensionGapResult,
} from "@/lib/calculators/pension-gap/types";
import Link from "next/link";
import { SoftSketchGapChart } from "@/components/brand/SoftSketchGapChart";

/* -------------------------------------------------------------------------- */
/* Small UI primitives                                                        */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-text">{label}</span>
      {children}
      {hint ? (
        <span className="mt-1 block text-xs text-text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  type?: string;
  inputMode?: "numeric" | "decimal" | "tel" | "email" | "text";
}) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-[var(--radius-btn)] border bg-surface px-3 py-2.5 text-base text-text outline-none transition-colors placeholder:text-text-muted/60 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        error ? "border-[var(--color-gap)]" : "border-border"
      }`}
    />
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChange={(v) => onChange(v.replace(/[^\d.]/g, ""))}
      placeholder={placeholder}
      error={error}
      inputMode="decimal"
    />
  );
}

function PillButton({
  active,
  onClick,
  children,
  error,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-primary bg-primary text-white"
          : error
            ? "border-[var(--color-gap)] bg-surface text-text"
            : "border-border bg-surface text-text hover:bg-surface-muted"
      }`}
    >
      {children}
    </button>
  );
}

function PillGroup({
  options,
  value,
  onChange,
  error,
}: {
  options: string[];
  value?: string;
  onChange: (label: string) => void;
  error?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <PillButton
          key={opt}
          active={value === opt}
          onClick={() => onChange(opt)}
          error={error && !value}
        >
          {opt}
        </PillButton>
      ))}
    </div>
  );
}

function ToggleCard({
  label,
  subLabel,
  checked,
  onToggle,
  children,
}: {
  label: string;
  subLabel?: string;
  checked: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border bg-surface transition-colors ${
        checked ? "border-primary/40" : "border-border"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start"
      >
        <div>
          <p className="font-semibold text-text">{label}</p>
          {subLabel ? (
            <p className="mt-0.5 text-xs text-text-muted">{subLabel}</p>
          ) : null}
        </div>
        <span
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            checked ? "bg-primary justify-end" : "bg-border justify-start"
          }`}
          aria-hidden
        >
          <span className="mx-0.5 inline-block h-5 w-5 rounded-full bg-white shadow" />
        </span>
      </button>
      {checked && children ? (
        <div className="space-y-3 border-t border-border px-4 py-3">{children}</div>
      ) : null}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  const base =
    "w-full rounded-[var(--radius-btn)] px-5 py-3 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-primary text-white hover:bg-primary-hover shadow-sm"
      : "border border-primary bg-transparent text-primary hover:bg-primary-soft";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles}`}
    >
      {children}
    </button>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-semibold text-primary hover:underline"
    >
      + {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-medium text-text-muted hover:text-[var(--color-gap)]"
    >
      הסרה
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Holding rows                                                               */
/* -------------------------------------------------------------------------- */

function RiskAndExposureFields({
  holding,
  onChange,
  showErrors,
}: {
  holding: Holding;
  onChange: (patch: Partial<Holding>) => void;
  showErrors: boolean;
}) {
  const [manualExposure, setManualExposure] = useState(holding.exposure !== "");
  return (
    <div className="space-y-3">
      <Field label="מסלול השקעה">
        <PillGroup
          options={RISK_LEVELS.map((r) => r.label)}
          value={RISK_LEVELS.find((r) => r.id === holding.risk)?.label}
          onChange={(label) =>
            onChange({
              risk: RISK_LEVELS.find((r) => r.label === label)!.id,
            })
          }
          error={showErrors && holding.risk === ""}
        />
      </Field>
      <button
        type="button"
        className="text-xs font-medium text-primary hover:underline"
        onClick={() => {
          const next = !manualExposure;
          setManualExposure(next);
          if (!next) onChange({ exposure: "" });
        }}
      >
        יודעים את אחוז החשיפה המדויק? להזנה ידנית
      </button>
      {manualExposure ? (
        <Field label="% חשיפה למניות בפועל">
          <NumberInput
            value={holding.exposure}
            onChange={(v) => onChange({ exposure: v })}
            placeholder="לדוגמה: 60"
            error={
              showErrors &&
              holding.exposure !== "" &&
              (Number(holding.exposure) < 0 || Number(holding.exposure) > 100)
            }
          />
        </Field>
      ) : null}
    </div>
  );
}

function FundHoldingRow({
  holding,
  showRemove,
  onChange,
  onRemove,
  showErrors,
}: {
  holding: Holding;
  showRemove: boolean;
  onChange: (patch: Partial<Holding>) => void;
  onRemove: () => void;
  showErrors: boolean;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-[var(--color-bg)]/50 p-3">
      {showRemove ? (
        <div className="flex justify-end">
          <RemoveButton onClick={onRemove} />
        </div>
      ) : null}
      <Field label="סכום הצבירה הנוכחי">
        <NumberInput
          value={holding.amount}
          onChange={(v) => onChange({ amount: v })}
          placeholder="לדוגמה: 450,000"
          error={showErrors && holding.amount === ""}
        />
      </Field>
      <RiskAndExposureFields
        holding={holding}
        onChange={onChange}
        showErrors={showErrors}
      />
    </div>
  );
}

function ExecutiveHoldingRow({
  holding,
  showRemove,
  onChange,
  onRemove,
  showErrors,
}: {
  holding: Holding;
  showRemove: boolean;
  onChange: (patch: Partial<Holding>) => void;
  onRemove: () => void;
  showErrors: boolean;
}) {
  const factorMode = holding.factorMode ?? "known";
  return (
    <div className="space-y-3 rounded-xl border border-border bg-[var(--color-bg)]/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <Field label="סכום הצבירה הנוכחי">
            <NumberInput
              value={holding.amount}
              onChange={(v) => onChange({ amount: v })}
              placeholder="לדוגמה: 400,000"
              error={showErrors && holding.amount === ""}
            />
          </Field>
        </div>
        {showRemove ? <RemoveButton onClick={onRemove} /> : null}
      </div>
      <Field label="מה המקדם שלכם?">
        <PillGroup
          options={["יודע/ת את המקדם", "לא יודע/ת"]}
          value={
            factorMode === "unknown" ? "לא יודע/ת" : "יודע/ת את המקדם"
          }
          onChange={(label) =>
            onChange({
              factorMode: label === "לא יודע/ת" ? "unknown" : "known",
            })
          }
        />
      </Field>
      {factorMode === "unknown" ? (
        <Field label="שנת תחילת עבודה רציפה">
          <NumberInput
            value={holding.startYear ?? ""}
            onChange={(v) => onChange({ startYear: v })}
            placeholder="לדוגמה: 2005"
            error={
              showErrors &&
              (holding.startYear === "" || Number(holding.startYear) <= 0)
            }
          />
        </Field>
      ) : (
        <Field label="המקדם הקבוע בפוליסה">
          <NumberInput
            value={holding.knownFactor ?? ""}
            onChange={(v) => onChange({ knownFactor: v })}
            placeholder="לדוגמה: 190"
            error={
              showErrors &&
              (holding.knownFactor === "" || Number(holding.knownFactor) <= 0)
            }
          />
        </Field>
      )}
      <RiskAndExposureFields
        holding={holding}
        onChange={onChange}
        showErrors={showErrors}
      />
    </div>
  );
}

function SavingsHoldingRow({
  holding,
  showRemove,
  onChange,
  onRemove,
  showErrors,
}: {
  holding: Holding;
  showRemove: boolean;
  onChange: (patch: Partial<Holding>) => void;
  onRemove: () => void;
  showErrors: boolean;
}) {
  const needsManager = (
    SAVINGS_TYPES_WITH_MANAGER as readonly string[]
  ).includes(holding.assetLabel);
  return (
    <div className="space-y-3 rounded-xl border border-border bg-[var(--color-bg)]/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <Field label="סוג המוצר הפיננסי">
            <select
              value={holding.assetLabel}
              onChange={(e) =>
                onChange({ assetLabel: e.target.value, managedBy: "" })
              }
              className={`w-full rounded-[var(--radius-btn)] border bg-surface px-3 py-2.5 text-base text-text ${
                showErrors && holding.assetLabel === ""
                  ? "border-[var(--color-gap)]"
                  : "border-border"
              }`}
            >
              <option value="">בחרו סוג</option>
              {SAVINGS_ASSET_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {showRemove ? <RemoveButton onClick={onRemove} /> : null}
      </div>
      {needsManager ? (
        <Field label="היכן הכסף מנוהל">
          <PillGroup
            options={["בית השקעות או חברת ביטוח", "דרך הבנק"]}
            value={
              holding.managedBy === "bank"
                ? "דרך הבנק"
                : holding.managedBy === "investment_house"
                  ? "בית השקעות או חברת ביטוח"
                  : undefined
            }
            onChange={(label) =>
              onChange({
                managedBy:
                  label === "דרך הבנק" ? "bank" : "investment_house",
              })
            }
            error={showErrors && !holding.managedBy}
          />
        </Field>
      ) : null}
      <Field label="סך ההון ברכיב זה">
        <NumberInput
          value={holding.amount}
          onChange={(v) => onChange({ amount: v })}
          placeholder="לדוגמה: 150,000"
          error={showErrors && holding.amount === ""}
        />
      </Field>
      <RiskAndExposureFields
        holding={holding}
        onChange={onChange}
        showErrors={showErrors}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Results: היום → אפשרי → הפער                                              */
/* -------------------------------------------------------------------------- */

function GapResults({
  monthlyIncome,
  monthlyPossible,
  salary,
  gapAmount,
  earlyRetirementAge,
}: {
  monthlyIncome: number;
  monthlyPossible: number;
  salary: number;
  gapAmount: number;
  earlyRetirementAge: number | null;
}) {
  const salaryGap = Math.max(gapAmount, 0);
  const vsPossible = Math.max(monthlyPossible - monthlyIncome, 0);

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="border-b border-border/70 bg-[var(--color-bg)] px-4 pt-6 sm:px-8 sm:pt-8">
        <SoftSketchGapChart className="mx-auto w-full max-w-lg" />
      </div>

      <div className="space-y-5 p-6 sm:p-8">
        <div className="text-center">
          <p className="text-sm text-text-muted">קצבה חודשית משוערת בפרישה</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-text sm:text-4xl">
            ‎₪{formatILSApprox(monthlyIncome)}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            מול שכר נוכחי של ‎₪{formatILS(salary)}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-[var(--color-bg)]/60 px-4 py-3">
            <p className="text-xs font-medium text-text-muted">היום</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-text">
              ‎₪{formatILSApprox(monthlyIncome)}
            </p>
            <p className="text-xs text-text-muted">מסלול נוכחי משוער</p>
          </div>
          <div className="rounded-xl border border-border bg-[var(--color-bg)]/60 px-4 py-3">
            <p className="text-xs font-medium text-text-muted">אפשרי</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-text">
              ‎₪{formatILSApprox(monthlyPossible)}
            </p>
            <p className="text-xs text-text-muted">תרחיש לפי חשיפה מיטבית לטווח</p>
          </div>
        </div>

        {/* Gap callout — coral ONLY here */}
        <div
          className="flex flex-col items-stretch gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-gap) 30%, transparent)",
            background: "var(--color-gap-soft)",
          }}
        >
          <div>
            <p className="text-sm font-semibold text-text">הפער</p>
            <p className="text-xs text-text-muted">
              {salaryGap > 0
                ? "הפרש מול השכר החודשי הנוכחי"
                : vsPossible > 0
                  ? "פוטנציאל שיפור מול תרחיש אפשרי"
                  : "אין פער משמעותי מול השכר"}
            </p>
          </div>
          <p
            className="text-2xl font-bold tabular-nums sm:text-3xl"
            style={{ color: "var(--color-gap)" }}
          >
            ‎₪{formatILSApprox(salaryGap > 0 ? salaryGap : vsPossible)}
            <span className="ms-1 text-sm font-medium text-text-muted">
              /חודש
            </span>
          </p>
        </div>

        {earlyRetirementAge !== null ? (
          <p className="rounded-xl border border-border bg-[var(--color-bg)]/60 px-4 py-3 text-sm text-text">
            לפי סימולציית חשיפה מיטבית, ייתכן שתוכלו לבחון פרישה מוקדמת בסביבות{" "}
            <strong>גיל {earlyRetirementAge}</strong>. זו הערכה כללית בלבד —
            לא המלצה.
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Lead form — posts to /api/leads                                            */
/* -------------------------------------------------------------------------- */

function isValidIsraeliPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return /^0(5\d|[2-49])\d{7}$/.test(digits);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function LeadForm({
  inputs,
  results,
}: {
  inputs: PensionGapInputs;
  results: PensionGapResult;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [touched, setTouched] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const nameOk = name.trim() !== "";
  const phoneTrim = phone.trim();
  const emailTrim = email.trim();
  const hasContact = phoneTrim !== "" || emailTrim !== "";
  const phoneOk = phoneTrim === "" || isValidIsraeliPhone(phoneTrim);
  const emailOk = emailTrim === "" || isValidEmail(emailTrim);
  const canSubmit = nameOk && hasContact && phoneOk && emailOk && privacy;

  const nameError = touched && !nameOk ? "נא למלא שם" : null;
  const contactError =
    touched && !hasContact ? "צריך למלא טלפון או אימייל" : null;
  const phoneError =
    touched && phoneTrim !== "" && !phoneOk
      ? "מספר הטלפון לא תקין"
      : null;
  const emailError =
    touched && emailTrim !== "" && !emailOk
      ? "כתובת האימייל לא תקינה"
      : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setSubmitError(null);
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    try {
      const traffic = captureAndPersistTraffic();
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calculator_id: "pension-gap",
          name: name.trim(),
          phone: phoneTrim || null,
          email: emailTrim || null,
          privacy_accepted: privacy,
          marketing_opt_in: marketing,
          inputs,
          results,
          ...traffic,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setSubmitError("משהו השתבש בשליחה. נסו שוב בעוד רגע.");
        return;
      }
      setSuccess(true);
    } catch {
      setSubmitError("אין חיבור כרגע. בדקו את הרשת ונסו שוב.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        id="pension-gap-lead"
        className="scroll-mt-24 rounded-[var(--radius-card)] border border-border bg-surface p-6 text-center shadow-[var(--shadow-card)] sm:p-8"
      >
        <p className="text-lg font-semibold text-text">
          קיבלנו. נחזור אליכם בהקדם.
        </p>
      </div>
    );
  }

  return (
    <div
      id="pension-gap-lead"
      className="scroll-mt-24 rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <h3 className="text-xl font-bold text-text">
        זה הפער. עכשיו אפשר לבדוק מה עושים איתו.
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">
        פער לא נסגר מעצמו. השאירו פרטים ונחזור אליכם. בלי התחייבות.
      </p>

      <form className="mt-6 space-y-3" onSubmit={handleSubmit} noValidate>
        <h4 className="text-base font-semibold text-text">בואו נבדוק את התיק</h4>

        <Field label="שם מלא">
          <TextInput
            value={name}
            onChange={setName}
            placeholder="השם שלכם"
            error={Boolean(nameError)}
          />
          {nameError ? (
            <span className="mt-1 block text-xs text-[var(--color-gap)]">
              {nameError}
            </span>
          ) : null}
        </Field>

        <Field label="טלפון">
          <TextInput
            value={phone}
            onChange={setPhone}
            placeholder="050-0000000"
            inputMode="tel"
            error={Boolean(contactError || phoneError)}
          />
          {phoneError ? (
            <span className="mt-1 block text-xs text-[var(--color-gap)]">
              {phoneError}
            </span>
          ) : null}
        </Field>

        <Field label="אימייל">
          <TextInput
            value={email}
            onChange={setEmail}
            placeholder="name@example.com"
            type="email"
            inputMode="email"
            error={Boolean(contactError || emailError)}
          />
          {emailError ? (
            <span className="mt-1 block text-xs text-[var(--color-gap)]">
              {emailError}
            </span>
          ) : null}
        </Field>

        {contactError ? (
          <p className="text-xs text-[var(--color-gap)]">{contactError}</p>
        ) : (
          <p className="text-xs text-text-muted">
            מספיק טלפון או אימייל. לא צריך את שניהם.
          </p>
        )}

        <label className="flex items-start gap-2.5 text-sm leading-relaxed text-text">
          <input
            type="checkbox"
            checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
            className="mt-1 size-4 shrink-0 rounded border-border accent-[var(--color-primary)]"
            required
          />
          <span>
            אני מאשר/ת לשמור את פרטי הקשר שלי, את הנתונים שהזנתי במחשבון
            ואת התוצאה, כדי שייצרו איתי קשר.{" "}
            <Link
              href="/privacy"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              מדיניות פרטיות
            </Link>
          </span>
        </label>
        {touched && !privacy ? (
          <p className="text-xs text-[var(--color-gap)]">
            נא לאשר שמירת הפרטים והנתונים מהמחשבון בהתאם למדיניות הפרטיות
          </p>
        ) : null}

        <label className="flex items-start gap-2.5 text-sm leading-relaxed text-text">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="mt-1 size-4 shrink-0 rounded border-border accent-[var(--color-primary)]"
          />
          <span>
            אשמח לקבל עדכונים ודיוורים מעין שנייה. אפשר להסיר בכל עת.
          </span>
        </label>

        {submitError ? (
          <p className="text-sm text-[var(--color-gap)]">{submitError}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-[var(--radius-btn)] bg-primary px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
        >
          {submitting ? "שולחים…" : "רוצה לבדוק איך לשפר את התיק"}
        </button>
        <p className="text-xs leading-relaxed text-text-muted">
          עין שנייה אינה משווקת פנסיונית מורשית ואינה נותנת ייעוץ פנסיוני.
        </p>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main calculator                                                            */
/* -------------------------------------------------------------------------- */

export function PensionGapCalculator() {
  const nextId = useRef(1);
  const newId = () => nextId.current++;

  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [salary, setSalary] = useState("");

  const [entryStage, setEntryStage] = useState<EntryStage>("fast");
  const [accumulationEstimate, setAccumulationEstimate] = useState("");
  const [fastTrackRisk, setFastTrackRisk] = useState<RiskId | "">("");
  const [fastAdditionalSavings, setFastAdditionalSavings] = useState("");
  const [fastSavingsRisk, setFastSavingsRisk] = useState<RiskId | "">("");

  const [pensionFundOn, setPensionFundOn] = useState(false);
  const [pensionFundHoldings, setPensionFundHoldings] = useState<Holding[]>([]);

  const [executiveOn, setExecutiveOn] = useState(false);
  const [executiveHoldings, setExecutiveHoldings] = useState<Holding[]>([]);

  const [savingsOn, setSavingsOn] = useState(false);
  const [savingsHoldings, setSavingsHoldings] = useState<Holding[]>([]);

  const [cashOn, setCashOn] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [contributionDestination, setContributionDestination] =
    useState<ContributionDestination>("");

  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const retirementAge = RETIREMENT_AGE_BY_GENDER[gender];

  const toggleCategory = (
    isOn: boolean,
    setOn: (v: boolean) => void,
    holdings: Holding[],
    setHoldings: (h: Holding[] | ((prev: Holding[]) => Holding[])) => void,
    factory: () => Holding,
  ) => {
    const next = !isOn;
    setOn(next);
    if (next && holdings.length === 0) setHoldings([factory()]);
  };

  const addHolding = (
    setHoldings: (h: Holding[] | ((prev: Holding[]) => Holding[])) => void,
    factory: () => Holding,
  ) => setHoldings((h) => [...h, factory()]);

  const removeHolding = (
    setHoldings: (h: Holding[] | ((prev: Holding[]) => Holding[])) => void,
    id: number,
  ) => setHoldings((h) => h.filter((x) => x.id !== id));

  const updateHolding = (
    setHoldings: (h: Holding[] | ((prev: Holding[]) => Holding[])) => void,
    id: number,
    patch: Partial<Holding>,
  ) =>
    setHoldings((h) => h.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const allHoldingAmountsNonNegative = [
    ...pensionFundHoldings,
    ...executiveHoldings,
    ...savingsHoldings,
  ].every((h) => h.amount === "" || Number(h.amount) >= 0);

  const allExposuresInRange = [
    ...pensionFundHoldings,
    ...executiveHoldings,
    ...savingsHoldings,
  ].every(
    (h) =>
      h.exposure === "" ||
      (Number(h.exposure) >= 0 && Number(h.exposure) <= 100),
  );

  const fastTrackValid =
    accumulationEstimate !== "" &&
    Number(accumulationEstimate) >= 0 &&
    fastTrackRisk !== "" &&
    (fastAdditionalSavings === "" ||
      (Number(fastAdditionalSavings) >= 0 && fastSavingsRisk !== ""));

  const detailedRiskValid =
    (!pensionFundOn || pensionFundHoldings.every((h) => h.risk !== "")) &&
    (!executiveOn || executiveHoldings.every((h) => h.risk !== "")) &&
    (!savingsOn || savingsHoldings.every((h) => h.risk !== "")) &&
    (!pensionFundOn || !executiveOn || contributionDestination !== "") &&
    (!savingsOn ||
      savingsHoldings.every(
        (h) =>
          !(SAVINGS_TYPES_WITH_MANAGER as readonly string[]).includes(
            h.assetLabel,
          ) || h.managedBy !== "",
      ));

  const inputsValid =
    age !== "" &&
    salary !== "" &&
    Number(age) > 0 &&
    Number(age) < retirementAge &&
    Number(salary) > 0 &&
    (entryStage === "fast" ? fastTrackValid : true) &&
    (entryStage === "detailed" ? detailedRiskValid : true) &&
    (!pensionFundOn || pensionFundHoldings.every((h) => h.amount !== "")) &&
    (!executiveOn ||
      executiveHoldings.every(
        (h) =>
          h.amount !== "" &&
          (h.factorMode === "unknown"
            ? h.startYear !== "" && Number(h.startYear) > 0
            : h.knownFactor !== "" && Number(h.knownFactor) > 0),
      )) &&
    (!savingsOn || savingsHoldings.every((h) => h.amount !== "")) &&
    (!cashOn || (cashAmount !== "" && Number(cashAmount) >= 0)) &&
    allHoldingAmountsNonNegative &&
    allExposuresInRange;

  const result = useMemo(() => {
    if (!inputsValid) return null;
    return computePensionGap({
      age: Number(age),
      gender,
      salary: Number(salary),
      yearsToRetirement: retirementAge - Number(age),
      entryStage,
      accumulationEstimate: Number(accumulationEstimate) || 0,
      fastTrackRisk,
      fastAdditionalSavings: Number(fastAdditionalSavings) || 0,
      fastSavingsRisk,
      pensionFundOn,
      pensionFundHoldings,
      executiveOn,
      executiveHoldings,
      savingsOn,
      savingsHoldings,
      cashOn,
      cashAmount: Number(cashAmount) || 0,
      contributionDestination,
    });
  }, [
    inputsValid,
    age,
    gender,
    salary,
    retirementAge,
    entryStage,
    accumulationEstimate,
    fastTrackRisk,
    fastAdditionalSavings,
    fastSavingsRisk,
    pensionFundOn,
    pensionFundHoldings,
    executiveOn,
    executiveHoldings,
    savingsOn,
    savingsHoldings,
    cashOn,
    cashAmount,
    contributionDestination,
  ]);

  useEffect(() => {
    captureAndPersistTraffic();
  }, []);

  const inputsSnapshot: PensionGapInputs | null = useMemo(() => {
    if (!inputsValid) return null;
    return {
      age: Number(age),
      gender,
      salary: Number(salary),
      yearsToRetirement: retirementAge - Number(age),
      entryStage,
      accumulationEstimate: Number(accumulationEstimate) || 0,
      fastTrackRisk,
      fastAdditionalSavings: Number(fastAdditionalSavings) || 0,
      fastSavingsRisk,
      pensionFundOn,
      pensionFundHoldings,
      executiveOn,
      executiveHoldings,
      savingsOn,
      savingsHoldings,
      cashOn,
      cashAmount: Number(cashAmount) || 0,
      contributionDestination,
    };
  }, [
    inputsValid,
    age,
    gender,
    salary,
    retirementAge,
    entryStage,
    accumulationEstimate,
    fastTrackRisk,
    fastAdditionalSavings,
    fastSavingsRisk,
    pensionFundOn,
    pensionFundHoldings,
    executiveOn,
    executiveHoldings,
    savingsOn,
    savingsHoldings,
    cashOn,
    cashAmount,
    contributionDestination,
  ]);

  const handleSubmit = () => {
    if (!inputsValid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {!submitted ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)]">
          <div className="rounded-t-[var(--radius-card)] bg-primary px-5 py-4 text-center text-lg font-bold text-white">
            מחשבון הפער בין ההכנסה החודשית לקצבה בפרישה
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="גיל נוכחי">
                <NumberInput
                  value={age}
                  onChange={setAge}
                  placeholder="לדוגמה: 45"
                  error={
                    showErrors &&
                    (age === "" ||
                      Number(age) <= 0 ||
                      Number(age) >= retirementAge)
                  }
                />
              </Field>
              <Field label="מגדר">
                <div className="flex gap-2">
                  <PillButton
                    active={gender === "male"}
                    onClick={() => setGender("male")}
                  >
                    גבר
                  </PillButton>
                  <PillButton
                    active={gender === "female"}
                    onClick={() => setGender("female")}
                  >
                    אישה
                  </PillButton>
                </div>
              </Field>
            </div>

            <Field label="שכר חודשי ברוטו">
              <NumberInput
                value={salary}
                onChange={setSalary}
                placeholder="לדוגמה: 22,000"
                error={showErrors && (salary === "" || Number(salary) <= 0)}
              />
            </Field>

            {entryStage === "fast" ? (
              <div className="space-y-4">
                <Field label="סך הצבירה הפנסיונית הנוכחית">
                  <NumberInput
                    value={accumulationEstimate}
                    onChange={setAccumulationEstimate}
                    placeholder="למשל 400,000"
                    error={
                      showErrors &&
                      (accumulationEstimate === "" ||
                        Number(accumulationEstimate) < 0)
                    }
                  />
                </Field>
                {accumulationEstimate !== "" ? (
                  <Field label="מסלול השקעה">
                    <PillGroup
                      options={RISK_LEVELS.map((r) => r.label)}
                      value={
                        RISK_LEVELS.find((r) => r.id === fastTrackRisk)?.label
                      }
                      onChange={(label) =>
                        setFastTrackRisk(
                          RISK_LEVELS.find((r) => r.label === label)!.id,
                        )
                      }
                      error={showErrors && fastTrackRisk === ""}
                    />
                  </Field>
                ) : null}

                <Field
                  label="חסכונות נוספים (השתלמות, גמל, פוליסות – סכום כולל)"
                  hint="לא זוכרים במדויק? הכל טוב. הערכה כללית תספיק כדי לתת לכם כיוון."
                >
                  <NumberInput
                    value={fastAdditionalSavings}
                    onChange={setFastAdditionalSavings}
                    placeholder="למשל 150,000"
                    error={
                      showErrors &&
                      fastAdditionalSavings !== "" &&
                      Number(fastAdditionalSavings) < 0
                    }
                  />
                </Field>
                {fastAdditionalSavings !== "" ? (
                  <Field label="מסלול השקעה (עבור החסכונות הנוספים)">
                    <PillGroup
                      options={RISK_LEVELS.map((r) => r.label)}
                      value={
                        RISK_LEVELS.find((r) => r.id === fastSavingsRisk)
                          ?.label
                      }
                      onChange={(label) =>
                        setFastSavingsRisk(
                          RISK_LEVELS.find((r) => r.label === label)!.id,
                        )
                      }
                      error={showErrors && fastSavingsRisk === ""}
                    />
                  </Field>
                ) : null}

                <PrimaryButton onClick={handleSubmit}>
                  לקבלת תמונת מצב מהירה
                </PrimaryButton>
                <PrimaryButton
                  variant="secondary"
                  onClick={() => setEntryStage("detailed")}
                >
                  רוצים תוצאה מדויקת ומותאמת אישית? פתחו את המחשבון המלא
                </PrimaryButton>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-text-muted">
                    אילו רכיבי חיסכון והשקעה קיימים ברשותכם?
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    ככל שתמלאו יותר פרטים, כך החישוב יהיה מדויק יותר עבורכם.
                  </p>
                </div>

                <ToggleCard
                  label="קרן פנסיה"
                  checked={pensionFundOn}
                  onToggle={() =>
                    toggleCategory(
                      pensionFundOn,
                      setPensionFundOn,
                      pensionFundHoldings,
                      setPensionFundHoldings,
                      () => makeHolding({ id: newId() }),
                    )
                  }
                >
                  {pensionFundHoldings.map((h) => (
                    <FundHoldingRow
                      key={h.id}
                      holding={h}
                      showRemove={pensionFundHoldings.length > 1}
                      onChange={(patch) =>
                        updateHolding(setPensionFundHoldings, h.id, patch)
                      }
                      onRemove={() =>
                        removeHolding(setPensionFundHoldings, h.id)
                      }
                      showErrors={showErrors}
                    />
                  ))}
                  <AddButton
                    label="להוספת קרן פנסיה נוספת"
                    onClick={() =>
                      addHolding(setPensionFundHoldings, () =>
                        makeHolding({ id: newId() }),
                      )
                    }
                  />
                </ToggleCard>

                <ToggleCard
                  label="ביטוח מנהלים"
                  checked={executiveOn}
                  onToggle={() =>
                    toggleCategory(
                      executiveOn,
                      setExecutiveOn,
                      executiveHoldings,
                      setExecutiveHoldings,
                      () =>
                        makeHolding({
                          id: newId(),
                          factorMode: "known",
                          knownFactor: "",
                          startYear: "",
                        }),
                    )
                  }
                >
                  {executiveHoldings.map((h) => (
                    <ExecutiveHoldingRow
                      key={h.id}
                      holding={h}
                      showRemove={executiveHoldings.length > 1}
                      onChange={(patch) =>
                        updateHolding(setExecutiveHoldings, h.id, patch)
                      }
                      onRemove={() =>
                        removeHolding(setExecutiveHoldings, h.id)
                      }
                      showErrors={showErrors}
                    />
                  ))}
                  <AddButton
                    label="להוספת פוליסת מנהלים נוספת"
                    onClick={() =>
                      addHolding(setExecutiveHoldings, () =>
                        makeHolding({
                          id: newId(),
                          factorMode: "known",
                          knownFactor: "",
                          startYear: "",
                        }),
                      )
                    }
                  />
                </ToggleCard>

                {pensionFundOn && executiveOn ? (
                  <Field label="לאיזו קופה מופקדים הכספים שלכם מדי חודש?">
                    <PillGroup
                      options={["קרן פנסיה", "ביטוח מנהלים"]}
                      value={
                        contributionDestination === "executive"
                          ? "ביטוח מנהלים"
                          : contributionDestination === "pension"
                            ? "קרן פנסיה"
                            : undefined
                      }
                      onChange={(label) =>
                        setContributionDestination(
                          label === "ביטוח מנהלים" ? "executive" : "pension",
                        )
                      }
                      error={showErrors && contributionDestination === ""}
                    />
                  </Field>
                ) : null}

                <ToggleCard
                  label="חיסכון והשקעות נזילות"
                  subLabel="כולל קרנות השתלמות, קופות גמל להשקעה ופוליסות חיסכון"
                  checked={savingsOn}
                  onToggle={() =>
                    toggleCategory(
                      savingsOn,
                      setSavingsOn,
                      savingsHoldings,
                      setSavingsHoldings,
                      () => makeHolding({ id: newId(), managedBy: "" }),
                    )
                  }
                >
                  {savingsHoldings.map((h) => (
                    <SavingsHoldingRow
                      key={h.id}
                      holding={h}
                      showRemove={savingsHoldings.length > 1}
                      onChange={(patch) =>
                        updateHolding(setSavingsHoldings, h.id, patch)
                      }
                      onRemove={() => removeHolding(setSavingsHoldings, h.id)}
                      showErrors={showErrors}
                    />
                  ))}
                  <AddButton
                    label="להוספת רכיב חיסכון נוסף"
                    onClick={() =>
                      addHolding(setSavingsHoldings, () =>
                        makeHolding({ id: newId(), managedBy: "" }),
                      )
                    }
                  />
                </ToggleCard>

                <ToggleCard
                  label="מזומן נזיל, עו״ש או פיקדון לא מושקע"
                  checked={cashOn}
                  onToggle={() => setCashOn(!cashOn)}
                >
                  <Field label="סך הכסף הנזיל שאינו מושקע">
                    <NumberInput
                      value={cashAmount}
                      onChange={setCashAmount}
                      placeholder="לדוגמה: 150,000"
                      error={
                        showErrors &&
                        (cashAmount === "" || Number(cashAmount) < 0)
                      }
                    />
                  </Field>
                </ToggleCard>

                <PrimaryButton onClick={handleSubmit}>
                  לחישוב הפנסיה החודשית הצפויה
                </PrimaryButton>
                <button
                  type="button"
                  className="w-full text-sm font-medium text-text-muted hover:text-primary"
                  onClick={() => setEntryStage("fast")}
                >
                  ← חזרה למסלול המהיר
                </button>
              </div>
            )}
          </div>
        </div>
      ) : result ? (
        <div className="space-y-6">
          <GapResults
            monthlyIncome={result.monthlyIncome}
            monthlyPossible={result.monthlyAtBenchmark}
            salary={result.currentSalary}
            gapAmount={result.gapAmount}
            earlyRetirementAge={result.earlyRetirementAge}
          />

          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            ← לעדכון החישוב
          </button>

          {inputsSnapshot && result ? (
            <LeadForm inputs={inputsSnapshot} results={result} />
          ) : null}
        </div>
      ) : null}

      {/* Disclaimer — pack wording; excludes קצבת זקנה */}
      <aside className="rounded-[var(--radius-card)] border border-border bg-surface-muted/60 p-5 text-sm leading-relaxed text-text-muted">
        <p>
          <strong className="font-semibold text-text">
            החישוב להמחשה בלבד.
          </strong>{" "}
          הוא מתבסס על הנתונים שהזנתם ועל הנחות כלליות, כמו תשואה שנתית ומקדם
          המרה משוערים. הוא לא מבטיח קצבה, תשואה או תוצאה כלשהי.
        </p>
        <p className="mt-3">
          <strong className="font-semibold text-text">
            קצבת זקנה (קצבת אזרח ותיק) מביטוח לאומי אינה נכללת בחישוב
          </strong>
          , גם אם אתם זכאים לה.
        </p>
        <p className="mt-3">
          תשואות עבר אינן מעידות על תשואות עתידיות. עין שנייה אינה בעלת רישיון
          שיווק פנסיוני או ייעוץ פנסיוני. המידע אינו ייעוץ ואינו תחליף לבדיקה
          אישית אצל בעל רישיון.
        </p>
      </aside>
    </div>
  );
}
