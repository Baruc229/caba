"use client";

import { useState } from "react";
import { FaArrowRight } from "react-icons/fa6";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        className="w-full flex-1 rounded-full border-[0.5px] border-[#2A2A2A] bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <button type="submit" className="btn-pill btn-primary shrink-0">
        S&apos;inscrire
        <FaArrowRight aria-hidden="true" />
      </button>
    </form>
  );
}
