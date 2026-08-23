import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Conexão única com o SQLite.
 *
 * O arquivo do banco fica em data/estudo.db na raiz do projeto — dá para abrir
 * com DB Browser for SQLite, copiar para backup, ou versionar se quiser.
 *
 * Em dev o Next recarrega os módulos a cada edição; guardar a conexão no
 * globalThis evita abrir dezenas de handles no mesmo arquivo.
 */

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'estudo.db');

declare global {
  // eslint-disable-next-line no-var
  var __estudoDb: Database.Database | undefined;
}

function criar(): Database.Database {
  fs.mkdirSync(DB_DIR, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schema = fs.readFileSync(path.join(process.cwd(), 'lib', 'db', 'schema.sql'), 'utf-8');
  db.exec(schema);

  return db;
}

export function getDb(): Database.Database {
  if (!globalThis.__estudoDb) {
    globalThis.__estudoDb = criar();
  }
  return globalThis.__estudoDb;
}

export { DB_PATH };
