"use client";

import { useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { useApp } from "@/components/providers/app-provider";

export function NewsletterForm() {
  const { t } = useApp();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const inputClass =
    "w-full rounded-full border-[0.5px] border-border-input bg-bg-card px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent-secondary";

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="mx-auto flex w-full max-w-xs flex-col gap-3 sm:mx-0"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        {t("footer.newsletterOffers")}
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        placeholder={t("footer.newsletterEmailPlaceholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
      />
      <label htmlFor="newsletter-phone" className="sr-only">
        {t("footer.newsletterPhone")}
      </label>
      <input
        id="newsletter-phone"
        name="phone"
        type="tel"
        placeholder={t("footer.newsletterPhonePlaceholder")}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={inputClass}
      />
      <button type="submit" className="btn-pill btn-primary w-full">
        {t("footer.newsletterSubscribe")}
        <FaArrowRight aria-hidden="true" />
      </button>
    </form>
  );
}
