import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      coins: number;
      role?: string;
      email?: string;
    } & DefaultSession['user'];
  }

  interface User {
    username?: string;
    coins?: number;
    role?: string;
    email?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    username?: string;
    coins?: number;
    role?: string;
    email?: string;
  }
}