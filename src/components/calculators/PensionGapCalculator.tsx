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
  makeHolding,
} from "@/lib/calculators/pension-gap/math";
import {
  CALC_ANIMATION_MS,
  CALC_STEP_MS,
  CALC_STEPS,
} from "@/lib/calculators/pension-gap/notes";
import type {
  ContributionDestination,
  EntryStage,
  Holding,
  PensionGapInputs,
  PensionGapResult,
} from "@/lib/calculators/pension-gap/types";
import Link from "next/link";
import { GapResults } from "@/components/calculators/GapResults";

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
  id,
  describedBy,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  type?: string;
  inputMode?: "numeric" | "decimal" | "tel" | "email" | "text";
  id?: string;
  describedBy?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-invalid={error || undefined}
      aria-describedby={describedBy}
      className={`w-full rounded-[var(--radius-btn)] border bg-surface px-3 py-2.5 text-base text-text outline-none transition-colors placeholder:text-text-muted/60 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        error ? "border-[var(--color-error)]" : "border-border"
      }`}
    />
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  error,
  id,
  describedBy,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  id?: string;
  describedBy?: string;
}) {
  return (
    <TextInput
      value={value}
      onChange={(v) => onChange(v.replace(/[^\d.]/g, ""))}
      placeholder={placeholder}
      error={error}
      inputMode="decimal"
      id={id}
      describedBy={describedBy}
    />
  );
}

function PillButton({
  active,
  onClick,
  children,
  error,
  role = "radio",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  error?: boolean;
  role?: "radio" | "button";
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={role === "radio" ? active : undefined}
      aria-pressed={role === "button" ? active : undefined}
      onClick={onClick}
      className={`flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-primary bg-primary text-white"
          : error
            ? "border-[var(--color-error)] bg-surface text-text"
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
  ariaLabel,
  id,
}: {
  options: string[];
  value?: string;
  onChange: (label: string) => void;
  error?: boolean;
  ariaLabel?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className="flex flex-wrap gap-2"
      role="radiogroup"
      aria-label={ariaLabel}
      aria-invalid={error || undefined}
      tabIndex={-1}
    >
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
        role="switch"
        aria-checked={checked}
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
      className="text-xs font-medium text-text-muted hover:text-primary"
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
  fieldIdPrefix,
}: {
  holding: Holding;
  onChange: (patch: Partial<Holding>) => void;
  showErrors: boolean;
  fieldIdPrefix?: string;
}) {
  const [manualExposure, setManualExposure] = useState(holding.exposure !== "");
  return (
    <div className="space-y-3">
      <Field label="מסלול השקעה">
        <PillGroup
          id={fieldIdPrefix ? `${fieldIdPrefix}-risk` : undefined}
          ariaLabel="מסלול השקעה"
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
            id={fieldIdPrefix ? `${fieldIdPrefix}-exposure` : undefined}
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
  const prefix = `pg-fund-${holding.id}`;
  return (
    <div className="space-y-3 rounded-xl border border-border bg-[var(--color-bg)]/50 p-3">
      {showRemove ? (
        <div className="flex justify-end">
          <RemoveButton onClick={onRemove} />
        </div>
      ) : null}
      <Field label="סכום הצבירה הנוכחי">
        <NumberInput
          id={`${prefix}-amount`}
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
        fieldIdPrefix={prefix}
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
  const prefix = `pg-exec-${holding.id}`;
  return (
    <div className="space-y-3 rounded-xl border border-border bg-[var(--color-bg)]/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <Field label="סכום הצבירה הנוכחי">
            <NumberInput
              id={`${prefix}-amount`}
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
            id={`${prefix}-start-year`}
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
            id={`${prefix}-factor`}
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
        fieldIdPrefix={prefix}
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
  const prefix = `pg-savings-${holding.id}`;
  return (
    <div className="space-y-3 rounded-xl border border-border bg-[var(--color-bg)]/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <Field label="סוג המוצר הפיננסי">
            <select
              id={`${prefix}-asset`}
              value={holding.assetLabel}
              onChange={(e) =>
                onChange({ assetLabel: e.target.value, managedBy: "" })
              }
              aria-invalid={
                showErrors && holding.assetLabel === "" ? true : undefined
              }
              className={`w-full rounded-[var(--radius-btn)] border bg-surface px-3 py-2.5 text-base text-text ${
                showErrors && holding.assetLabel === ""
                  ? "border-[var(--color-error)]"
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
            id={`${prefix}-managed`}
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
          id={`${prefix}-amount`}
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
        fieldIdPrefix={prefix}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Results: היום → אפשרי → הפער                                              */
/* -------------------------------------------------------------------------- */

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
        role="status"
        aria-live="polite"
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
            id="lead-name"
            value={name}
            onChange={setName}
            placeholder="השם שלכם"
            error={Boolean(nameError)}
            describedBy={nameError ? "lead-name-error" : undefined}
          />
          {nameError ? (
            <span
              id="lead-name-error"
              className="mt-1 block text-xs text-[var(--color-error)]"
              role="alert"
            >
              {nameError}
            </span>
          ) : null}
        </Field>

        <Field label="טלפון">
          <TextInput
            id="lead-phone"
            value={phone}
            onChange={setPhone}
            placeholder="050-0000000"
            inputMode="tel"
            error={Boolean(contactError || phoneError)}
            describedBy={
              phoneError
                ? "lead-phone-error"
                : contactError
                  ? "lead-contact-error"
                  : undefined
            }
          />
          {phoneError ? (
            <span
              id="lead-phone-error"
              className="mt-1 block text-xs text-[var(--color-error)]"
              role="alert"
            >
              {phoneError}
            </span>
          ) : null}
        </Field>

        <Field label="אימייל">
          <TextInput
            id="lead-email"
            value={email}
            onChange={setEmail}
            placeholder="name@example.com"
            type="email"
            inputMode="email"
            error={Boolean(contactError || emailError)}
            describedBy={
              emailError
                ? "lead-email-error"
                : contactError
                  ? "lead-contact-error"
                  : undefined
            }
          />
          {emailError ? (
            <span
              id="lead-email-error"
              className="mt-1 block text-xs text-[var(--color-error)]"
              role="alert"
            >
              {emailError}
            </span>
          ) : null}
        </Field>

        {contactError ? (
          <p
            id="lead-contact-error"
            className="text-xs text-[var(--color-error)]"
            role="alert"
          >
            {contactError}
          </p>
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
          <p className="text-xs text-[var(--color-error)]" role="alert">
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
          <p
            className="text-sm text-[var(--color-error)]"
            role="alert"
            aria-live="assertive"
          >
            {submitError}
          </p>
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
  const [calculating, setCalculating] = useState(false);
  const [calcStepIndex, setCalcStepIndex] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const [barColor, setBarColor] = useState("var(--color-primary)");
  const [leadReady, setLeadReady] = useState(false);
  const calcTimersRef = useRef<{ step?: ReturnType<typeof setInterval>; done?: ReturnType<typeof setTimeout> }>({});
  const resultsRef = useRef<HTMLDivElement>(null);

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
    (!savingsOn ||
      savingsHoldings.every(
        (h) => h.risk !== "" && h.assetLabel !== "",
      )) &&
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

  useEffect(() => {
    return () => {
      if (calcTimersRef.current.step) clearInterval(calcTimersRef.current.step);
      if (calcTimersRef.current.done) clearTimeout(calcTimersRef.current.done);
    };
  }, []);

  useEffect(() => {
    if (!calculating) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [calculating]);

  const getFirstInvalidFieldId = (): string | null => {
    if (age === "" || Number(age) <= 0 || Number(age) >= retirementAge) {
      return "pg-age";
    }
    if (salary === "" || Number(salary) <= 0) {
      return "pg-salary";
    }

    if (entryStage === "fast") {
      if (
        accumulationEstimate === "" ||
        Number(accumulationEstimate) < 0
      ) {
        return "pg-accumulation";
      }
      if (fastTrackRisk === "") return "pg-fast-track-risk";
      if (
        fastAdditionalSavings !== "" &&
        (Number(fastAdditionalSavings) < 0 || fastSavingsRisk === "")
      ) {
        if (Number(fastAdditionalSavings) < 0) return "pg-fast-additional";
        return "pg-fast-savings-risk";
      }
      return null;
    }

    // detailed path — walk holdings in form order
    if (pensionFundOn) {
      for (const h of pensionFundHoldings) {
        const prefix = `pg-fund-${h.id}`;
        if (h.amount === "" || Number(h.amount) < 0) return `${prefix}-amount`;
        if (h.risk === "") return `${prefix}-risk`;
        if (
          h.exposure !== "" &&
          (Number(h.exposure) < 0 || Number(h.exposure) > 100)
        ) {
          return `${prefix}-exposure`;
        }
      }
    }

    if (executiveOn) {
      for (const h of executiveHoldings) {
        const prefix = `pg-exec-${h.id}`;
        if (h.amount === "" || Number(h.amount) < 0) return `${prefix}-amount`;
        if (h.factorMode === "unknown") {
          if (h.startYear === "" || Number(h.startYear) <= 0) {
            return `${prefix}-start-year`;
          }
        } else if (
          h.knownFactor === "" ||
          Number(h.knownFactor) <= 0
        ) {
          return `${prefix}-factor`;
        }
        if (h.risk === "") return `${prefix}-risk`;
        if (
          h.exposure !== "" &&
          (Number(h.exposure) < 0 || Number(h.exposure) > 100)
        ) {
          return `${prefix}-exposure`;
        }
      }
    }

    if (pensionFundOn && executiveOn && contributionDestination === "") {
      return "pg-contribution-dest";
    }

    if (savingsOn) {
      for (const h of savingsHoldings) {
        const prefix = `pg-savings-${h.id}`;
        if (h.assetLabel === "") return `${prefix}-asset`;
        const needsManager = (
          SAVINGS_TYPES_WITH_MANAGER as readonly string[]
        ).includes(h.assetLabel);
        if (needsManager && h.managedBy === "") return `${prefix}-managed`;
        if (h.amount === "" || Number(h.amount) < 0) return `${prefix}-amount`;
        if (h.risk === "") return `${prefix}-risk`;
        if (
          h.exposure !== "" &&
          (Number(h.exposure) < 0 || Number(h.exposure) > 100)
        ) {
          return `${prefix}-exposure`;
        }
      }
    }

    if (cashOn && (cashAmount === "" || Number(cashAmount) < 0)) {
      return "pg-cash-amount";
    }

    return null;
  };

  const focusFieldById = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const isDirectlyFocusable =
      el instanceof HTMLElement &&
      (el.matches("input, select, textarea, button") ||
        el.tabIndex >= 0);
    const target: HTMLElement | null = isDirectlyFocusable
      ? el
      : el.querySelector<HTMLElement>(
          "input, select, textarea, button, [tabindex]",
        );
    target?.focus({ preventScroll: true });
  };

  const handleCalculate = () => {
    if (!inputsValid || !result) return;
    if (calcTimersRef.current.step) clearInterval(calcTimersRef.current.step);
    if (calcTimersRef.current.done) clearTimeout(calcTimersRef.current.done);

    setSubmitted(false);
    setLeadReady(false);
    setCalculating(true);
    setBarWidth(0);
    setBarColor("var(--color-primary)");
    setCalcStepIndex(0);

    const targetColor =
      result.gapPercent > 0 ? "var(--color-error)" : "#2E7D4F";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setBarWidth(100);
        setBarColor(targetColor);
      });
    });

    let step = 0;
    calcTimersRef.current.step = setInterval(() => {
      step += 1;
      if (step < CALC_STEPS.length) setCalcStepIndex(step);
    }, CALC_STEP_MS);

    calcTimersRef.current.done = setTimeout(() => {
      if (calcTimersRef.current.step) clearInterval(calcTimersRef.current.step);
      // Unlock overlay body lock before results mount / scroll
      document.body.style.overflow = "";
      setCalculating(false);
      setSubmitted(true);
      // Wait for GapResults to mount, then scroll to start of results (not bottom)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      });
    }, CALC_ANIMATION_MS);
  };

  const handleSubmit = () => {
    if (!inputsValid) {
      setShowErrors(true);
      const id = getFirstInvalidFieldId();
      // Wait for error styles / aria-invalid to paint, then scroll + focus
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (id) focusFieldById(id);
        });
      });
      return;
    }
    setShowErrors(false);
    handleCalculate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {!submitted && !calculating ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)]">
          <div className="rounded-t-[var(--radius-card)] bg-primary px-5 py-4 text-center text-lg font-bold text-white">
            מחשבון הפער בין ההכנסה החודשית לקצבה בפרישה
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="גיל נוכחי">
                <NumberInput
                  id="pg-age"
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
                <div
                  className="flex gap-2"
                  role="radiogroup"
                  aria-label="מגדר"
                >
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
                id="pg-salary"
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
                    id="pg-accumulation"
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
                      id="pg-fast-track-risk"
                      ariaLabel="מסלול השקעה"
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
                    id="pg-fast-additional"
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
                      id="pg-fast-savings-risk"
                      ariaLabel="מסלול השקעה לחסכונות נוספים"
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
                      id="pg-contribution-dest"
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
                      id="pg-cash-amount"
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
      ) : null}

      {calculating ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--color-bg)] px-6"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="w-full max-w-md">
            <p className="mb-4 text-center text-base font-medium text-text">
              {CALC_STEPS[calcStepIndex]}
            </p>
            <div
              className="h-2 overflow-hidden rounded-full"
              style={{ background: "var(--color-surface-muted)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${barWidth}%`,
                  background: barColor,
                  transition: `width ${CALC_ANIMATION_MS}ms ease, background-color ${CALC_ANIMATION_MS}ms ease`,
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {submitted && result && inputsSnapshot ? (
        <div
          ref={resultsRef}
          id="pension-gap-results"
          className="scroll-mt-24 space-y-6"
        >
          <GapResults
            result={result}
            inputs={inputsSnapshot}
            onLeadReady={setLeadReady}
          />

          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setLeadReady(false);
            }}
            className="text-sm font-semibold text-primary hover:underline"
          >
            ← לעדכון החישוב
          </button>

          {leadReady ? (
            <LeadForm inputs={inputsSnapshot} results={result} />
          ) : null}
        </div>
      ) : null}

      {/* Disclaimer — source-style adapted; excludes קצבת זקנה; Soft Sketch / עין שנייה */}
      {!calculating ? (
      <aside className="rounded-[var(--radius-card)] border border-border bg-surface-muted/60 p-5 text-sm leading-relaxed text-text-muted">
        <p>
          <strong className="font-semibold text-text">הבהרה משפטית:</strong>{" "}
          התוצאות וההערות המוצגות במחשבון הן הערכה כללית ואוטומטית בלבד,
          המבוססת על הנתונים שהזנתם ועל הנחות יסוד ממוצעות שאינן מובטחות. המידע{" "}
          <strong className="font-semibold text-text">
            אינו מהווה ייעוץ פנסיוני, ייעוץ השקעות או ייעוץ מס
          </strong>{" "}
          המותאם לנתוניו וצרכיו האישיים של המשתמש, ואינו תחליף לבחינה מקצועית.{" "}
          <strong className="font-semibold text-text">
            עין שנייה אינה בעלת רישיון ואינה עוסקת בייעוץ או בשיווק פנסיוני.
          </strong>{" "}
          השארת פרטים מהווה הסכמה להעברתם לאיש מקצוע בעל רישיון בתחום החיסכון
          הפנסיוני, לצורך יצירת קשר. אין לבצע פעולות פיננסיות על בסיס נתונים אלו
          ללא התייעצות עם בעל רישיון.
        </p>
        <p className="mt-3">
          <strong className="font-semibold text-text">
            קצבת זקנה (קצבת אזרח ותיק) מביטוח לאומי אינה נכללת בחישוב
          </strong>
          , גם אם אתם זכאים לה.
        </p>
        <p className="mt-3">
          תשואות עבר אינן מעידות על תשואות עתידיות. המידע אינו ייעוץ ואינו
          תחליף לבדיקה אישית אצל בעל רישיון.
        </p>
      </aside>
      ) : null}
    </div>
  );
}
