/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Create or update the ADMIN account.
 * Usage: DATABASE_URL="postgres://..." npm run create-admin
 *
 * Defaults: username "walidomar", password "WalidOmar", email "walidomar@gmail.com".
 * Override with the ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD env vars.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = (process.env.ADMIN_USERNAME || 'walidomar').trim().toLowerCase();
  const email = (process.env.ADMIN_EMAIL || 'walidomar@gmail.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'WalidOmar';

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      email,
      role: 'ADMIN',
      status: 'ACTIVE',
      password: await bcrypt.hash(password, 10),
    },
    create: {
      username,
      email,
      role: 'ADMIN',
      status: 'ACTIVE',
      password: await bcrypt.hash(password, 10),
      coins: 500,
      referralCode: `admin-${Math.random().toString(36).slice(2, 6)}`,
    },
  });

  console.log(`Admin OK — id=${user.id} username=${user.username} email=${user.email} role=${user.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());