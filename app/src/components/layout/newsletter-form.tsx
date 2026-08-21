"use client";

import { useState } from "react";
import { FaArrowRight } from "react-icons/fa6";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const inputClass =
    "w-full rounded-full border-[0.5px] border-[#2A2A2A] bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label htmlFor="newsletter-email" className="sr-only">
        Recevoir nos offres et nouveautés
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        placeholder="Votre adresse email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
      />
      <label htmlFor="newsletter-phone" className="sr-only">
        Votre numéro de téléphone
      </label>
      <input
        id="newsletter-phone"
        name="phone"
        type="tel"
        placeholder="Votre numéro de téléphone (optionnel)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={inputClass}
      />
      <button type="submit" className="btn-pill btn-primary justify-self-start sm:col-span-2">
        S&apos;inscrire
        <FaArrowRight aria-hidden="true" />
      </button>
    </form>
  );
}
