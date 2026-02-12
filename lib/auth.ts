import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";

const isDevMode = process.env.DEV_AUTH_ENABLED === "true";

export const authOptions: NextAuthOptions = {
  adapter: isDevMode ? undefined : PrismaAdapter(db),
  providers: isDevMode
    ? [
        CredentialsProvider({
          name: "Dev Mode",
          credentials: {
            email: { label: "Email", type: "email", placeholder: "dev@example.com" },
          },
          async authorize(credentials) {
            if (!credentials?.email) {
              return null;
            }

            // Find or create user (works for both dev and guest users)
            let user = await db.user.findUnique({
              where: { email: credentials.email },
            });

            if (!user) {
              const isGuest = credentials.email.includes("@guest.local");
              user = await db.user.create({
                data: {
                  email: credentials.email,
                  name: isGuest ? "Guest User" : "Dev User",
                },
              });
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
            };
          },
        }),
      ]
    : [
        EmailProvider({
          server: {
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT),
            auth: {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            },
          },
          from: process.env.EMAIL_FROM,
        }),
      ],
  pages: {
    signIn: "/auth/login",
    verifyRequest: "/auth/verify",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
