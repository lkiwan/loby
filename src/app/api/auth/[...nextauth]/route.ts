import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ensureSignupGrant, isDuplicate } from '@/lib/ledger';
import { getConfig } from '@/lib/config';

function randomReferralCode(base: string): string {
  const clean = base.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'player';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${clean}-${suffix}`;
}

async function getOrCreateGoogleUser(
  email: string,
  name?: string | null,
  image?: string | null,
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  let user;
  try {
    user = await prisma.user.create({
      data: {
        email,
        username: `${(name || 'player').replace(/[^a-zA-Z0-9]/g, '').slice(0, 14) || 'player'}${Math.random().toString(36).slice(2, 6)}`,
        image: image || null,
      },
    });
  } catch (e) {
    if (!isDuplicate(e)) throw e;
    user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw e;
  }

  const cfg = await getConfig();
  await ensureSignupGrant(user.id, cfg.signupGrant as unknown as number);

  let ownCode = randomReferralCode(name || email || 'player');
  let codeTaken = true;
  while (codeTaken) {
    const clash = await prisma.user.findUnique({ where: { referralCode: ownCode } });
    if (!clash) {
      codeTaken = false;
    } else {
      ownCode = randomReferralCode(name || email || 'player');
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

  return user;
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
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        const email = profile?.email?.toLowerCase();
        if (!email || !email.endsWith('@gmail.com')) {
          return '/login?error=gmail_only';
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
      if (account?.provider === 'google') {
        const email = typeof token.email === 'string' ? token.email.trim().toLowerCase() : undefined;
        if (email && email.endsWith('@gmail.com')) {
          const googleUser = user as { name?: string | null; image?: string | null } | undefined;
          const dbUser = await getOrCreateGoogleUser(email, googleUser?.name, googleUser?.image);
          if (dbUser) {
            await prisma.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: 'google',
                  providerAccountId: account.providerAccountId,
                },
              },
              create: {
                userId: dbUser.id,
                type: 'oauth',
                provider: 'google',
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
              update: {},
            });
            token.id = dbUser.id;
            token.coins = dbUser.coins;
            token.role = dbUser.role;
            token.username = dbUser.username ?? undefined;
          }
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