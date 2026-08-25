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
        console.log("[AUTH] authorize called, credentials:", JSON.stringify(Object.keys(credentials ?? {})));
        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] credentials missing");
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();
        console.log("[AUTH] looking for email:", email);

        let user;
        try {
          user = await prisma.user.findUnique({ where: { email } });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("[AUTH] prisma error:", msg);
          return null;
        }

        if (!user) {
          console.log("[AUTH] user not found");
          return null;
        }
        if (!user.actif) {
          console.log("[AUTH] user inactive");
          return null;
        }

        if (user.verrouilleJusqua && user.verrouilleJusqua > new Date()) {
          console.log("[AUTH] account locked until", user.verrouilleJusqua);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          console.log("[AUTH] password invalid");
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

        console.log("[AUTH] login success for", email);
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
