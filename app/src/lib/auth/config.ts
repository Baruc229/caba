import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      prenom: string;
      nom: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth" {
  interface JWT {
    role?: string;
    id?: string;
    prenom?: string;
    nom?: string;
  }
}

const MAX_TENTATIVES = 5;
const VERROU_MINUTES = 15;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] === authorize START ===");
        console.log("[AUTH] credentials type:", typeof credentials);
        console.log("[AUTH] credentials keys:", JSON.stringify(Object.keys(credentials ?? {})));
        console.log("[AUTH] credentials:", JSON.stringify(credentials));

        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] FAIL: credentials missing");
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;
        console.log("[AUTH] email:", email);
        console.log("[AUTH] password length:", password.length);
        console.log("[AUTH] password type:", typeof password);

        let user;
        try {
          user = await prisma.user.findUnique({ where: { email } });
          console.log("[AUTH] prisma query OK, user found:", !!user);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("[AUTH] FAIL: prisma error:", msg);
          return null;
        }

        if (!user) {
          console.log("[AUTH] FAIL: user not found for email:", email);
          return null;
        }
        if (!user.actif) {
          console.log("[AUTH] FAIL: user inactive:", email);
          return null;
        }

        if (user.verrouilleJusqua && user.verrouilleJusqua > new Date()) {
          console.log("[AUTH] FAIL: account locked until", user.verrouilleJusqua);
          return null;
        }

        console.log("[AUTH] comparing password, hash prefix:", user.password.slice(0, 7), "hash length:", user.password.length);

        let isPasswordValid: boolean;
        try {
          isPasswordValid = await bcrypt.compare(password, user.password);
          console.log("[AUTH] bcrypt.compare result:", isPasswordValid);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("[AUTH] FAIL: bcrypt.compare error:", msg);
          return null;
        }

        if (!isPasswordValid) {
          console.log("[AUTH] FAIL: password invalid for", email);
          const tentatives = user.tentativesEchouees + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              tentativesEchouees: tentatives,
              ...(tentatives >= MAX_TENTATIVES
                ? {
                    verrouilleJusqua: new Date(Date.now() + VERROU_MINUTES * 60 * 1000),
                    tentativesEchouees: 0,
                  }
                : {}),
            },
          });
          return null;
        }

        console.log("[AUTH] SUCCESS: login for", email);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLogin: new Date(),
            tentativesEchouees: 0,
            verrouilleJusqua: null,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.prenom} ${user.nom}`,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: Number(process.env.AUTH_SESSION_HEURES ?? 8) * 3600,
    updateAge: 3600,
  },
  pages: {
    signIn: "/connexion",
    newUser: "/inscription",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as { role: string }).role;
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { prenom: true, nom: true },
        });
        if (dbUser) {
          token.prenom = dbUser.prenom;
          token.nom = dbUser.nom;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.prenom = (token.prenom as string) || "";
        session.user.nom = (token.nom as string) || "";
      }
      return session;
    },
  },
});
