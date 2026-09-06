// TEMP diagnostic: dump Vercel Postgres connection strings to build log.
// The build container has decrypted values of encrypted env vars.
// COMMIT WILL BE REVERTED IMMEDIATELY AFTER EXTRACTION.
const keys = [
  'DIVISEEK_POSTGRES_URL',
  'DIVISEEK_POSTGRES_URL_NON_POOLING',
  'DIVISEEK_PRISMA_DATABASE_URL',
  'DIVISEEK_PRISMA_DATABASE_URL_NON_POOLING',
  'DIVISEEK_DATABASE_URL',
];
for (const k of keys) {
  const v = process.env[k];
  console.error(`ENVDUMP ${k} = ${v === undefined ? '(unset)' : v}`);
}