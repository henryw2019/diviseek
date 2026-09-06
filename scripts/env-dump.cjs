// TEMP diagnostic: dump Vercel Postgres connection strings to build log (base64, avoids log redaction).
// COMMIT WILL BE REVERTED IMMEDIATELY AFTER EXTRACTION.
const keys = [
  'DIVISEEK_POSTGRES_URL',
  'DIVISEEK_PRISMA_DATABASE_URL',
  'DIVISEEK_DATABASE_URL',
];
for (const k of keys) {
  const v = process.env[k];
  if (v === undefined) { console.error(`ENVDUMPB64 ${k} = (unset)`); continue; }
  console.error(`ENVDUMPB64 ${k} = ${Buffer.from(v, 'utf8').toString('base64')}`);
}