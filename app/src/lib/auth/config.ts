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
      emailConfirme: boolean;
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
    emailConfirme?: boolean;
  }
}

const MAX_TENTATIVES = 5;
const VERROU_MINUTES = 15;

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        let user;
        try {
          user = await prisma.user.findUnique({ where: { email } });
        } catch {
          return null;
        }

        if (!user) return null;
        if (!user.actif) return null;
        if (!user.emailConfirme) return null;

        if (user.verrouilleJusqua && user.verrouilleJusqua > new Date()) return null;

        let isPasswordValid: boolean;
        try {
          isPasswordValid = await bcrypt.compare(password, user.password);
        } catch {
          return null;
        }

        if (!isPasswordValid) {
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
          emailConfirme: user.emailConfirme,
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
          select: { prenom: true, nom: true, emailConfirme: true },
        });
        if (dbUser) {
          token.prenom = dbUser.prenom;
          token.nom = dbUser.nom;
          token.emailConfirme = dbUser.emailConfirme;
        }
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, actif: true },
        });
        if (!dbUser || !dbUser.actif) {
          return null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (!token || !token.id) {
          return { ...session, user: { ...session.user, id: "" } };
        }
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.prenom = (token.prenom as string) || "";
        session.user.nom = (token.nom as string) || "";
        session.user.emailConfirme = token.emailConfirme as boolean;
      }
      return session;
    },
  },
});
