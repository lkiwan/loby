import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ensureSignupGrant } from '@/lib/ledger';
import { getConfig } from '@/lib/config';

function randomReferralCode(base: string): string {
  const clean = base.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'player';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${clean}-${suffix}`;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user || !user.password) {
          throw new Error('User not found');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          username: user.username ?? undefined,
          coins: user.coins,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const email = profile?.email?.toLowerCase();
        if (!email || !email.endsWith('@gmail.com')) {
          return '/login?error=gmail_only';
        }

        const existingUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true, password: true, username: true },
        });

        if (existingUser) {
          if (existingUser.password) {
            return '/login?error=account_exists';
          }
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        const ident = user as { username?: string; coins?: number; role?: string; email?: string };
        token.id = user.id;
        token.username = ident.username;
        token.coins = ident.coins;
        token.role = ident.role;
        token.email = ident.email;
      }
      if (trigger === 'update' && session?.coins !== undefined) {
        token.coins = session.coins;
      }
      if (account?.provider === 'google' && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { coins: true, role: true, username: true },
        });
        if (dbUser) {
          token.coins = dbUser.coins;
          token.role = dbUser.role;
          token.username = dbUser.username ?? undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.coins = token.coins as number;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      const cfg = await getConfig();
      await ensureSignupGrant(user.id, cfg.signupGrant as unknown as number);

      let ownCode = randomReferralCode(user.name || user.email || 'player');
      let codeTaken = true;
      while (codeTaken) {
        const clash = await prisma.user.findUnique({ where: { referralCode: ownCode } });
        if (!clash) {
          codeTaken = false;
        } else {
          ownCode = randomReferralCode(user.name || user.email || 'player');
        }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: ownCode },
      });

      await prisma.event.create({
        data: {
          name: 'signup',
          userId: user.id,
          props: { provider: 'google' },
        },
      });
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };