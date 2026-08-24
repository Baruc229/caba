"use client";

import { useMemo } from "react";

export function scorePassword(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const strong = password.length >= 12 && hasUpper && hasDigit;
  if (strong) return 3;
  if (password.length >= 8 && (hasUpper || hasDigit)) return 2;
  return 1;
}

export function StrengthMeter({ password }: { password: string }) {
  const score = useMemo(() => scorePassword(password), [password]);
  if (!password) return null;

  return (
    <div className="auth-strength" aria-live="polite">
      <div className="auth-strength-bar">
        {[1, 2, 3].map((level) => (
          <span
            key={level}
            className={`auth-strength-seg${score >= level ? ` is-${score}` : ""}`}
          />
        ))}
      </div>
      <p className="auth-strength-label">
        {score === 1 ? "Faible" : score === 2 ? "Moyen" : "Fort"}
      </p>
    </div>
  );
}

export function CriteriaList({ password }: { password: string }) {
  const rules = [
    { ok: password.length >= 8, label: "8 caractères minimum" },
    { ok: /[A-Z]/.test(password), label: "Au moins une majuscule" },
    { ok: /\d/.test(password), label: "Au moins un chiffre" },
  ];

  return (
    <ul className="auth-criteria">
      {rules.map((rule) => (
        <li key={rule.label} className={rule.ok ? "is-ok" : undefined}>
          {rule.ok ? "✓" : "•"} {rule.label}
        </li>
      ))}
    </ul>
  );
}
