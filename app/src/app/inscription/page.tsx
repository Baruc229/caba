"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InscriptionPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      prenom: formData.get("prenom") as string,
      nom: formData.get("nom") as string,
      email: formData.get("email") as string,
      telephone: formData.get("telephone") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    if (data.password !== data.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Une erreur est survenue");
        return;
      }

      router.push("/connexion?success=1");
    } catch {
      setError("Une erreur est survenue. Veuillez reessayer.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black">Creer un compte</h1>
            <p className="mt-2 text-gray-500">
              Rejoignez Caba Residence et reservez facilement
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-error bg-error/10 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prenom"
                name="prenom"
                placeholder="Prenom"
                required
              />
              <Input
                label="Nom"
                name="nom"
                placeholder="Nom"
                required
              />
            </div>

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              required
            />

            <Input
              label="Telephone"
              name="telephone"
              type="tel"
              placeholder="+229 97 00 00 00"
            />

            <Input
              label="Mot de passe"
              name="password"
              type="password"
              placeholder="Minimum 8 caracteres"
              required
              minLength={8}
            />

            <Input
              label="Confirmer le mot de passe"
              name="confirmPassword"
              type="password"
              placeholder="Confirmer le mot de passe"
              required
              minLength={8}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Creer mon compte
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Deja un compte ?{" "}
            <Link href="/connexion" className="text-primary hover:text-primary-hover font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
