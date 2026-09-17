import { getDb } from './database';
import { DEFAULT_INTERVALS, DEFAULT_PASS_THRESHOLD, nextLeitnerState } from './leitner';
import {
  AppSettings,
  Domain,
  DomainStat,
  LeitnerCard,
  Page,
  PageWithDomain,
  Progress,
  Question,
} from '../types';

// ---------- Domains ----------

export async function getDomains(): Promise<Domain[]> {
  const db = await getDb();
  return db.getAllAsync<Domain>('SELECT * FROM domains ORDER BY sort_order ASC');
}

export async function getDomainBySlug(slug: string): Promise<Domain | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Domain>('SELECT * FROM domains WHERE slug = ?', [slug]);
  return row ?? null;
}

// ---------- Domain filter helpers ----------
// A "domain filter" is either the literal string 'all' or a JSON array of
// domain ids, e.g. "[1,3]" — used for both the saved random-reading
// preference and to key best-streak exam records.

export function parseDomainFilter(raw: string): 'all' | number[] {
  if (raw === 'all' || !raw) return 'all';
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as number[];
  } catch {
    // fallthrough
  }
  return 'all';
}

export function serializeDomainFilter(filter: 'all' | number[]): string {
  return filter === 'all' ? 'all' : JSON.stringify(filter);
}

export async function domainFilterKey(filter: 'all' | number[]): Promise<string> {
  if (filter === 'all') return 'all';
  const domains = await getDomains();
  const slugs = domains
    .filter((d) => filter.includes(d.id))
    .map((d) => d.slug)
    .sort();
  return slugs.length ? slugs.join(',') : 'all';
}

function domainWhere(filter: 'all' | number[], column = 'p.domain_id'): { clause: string; params: any[] } {
  if (filter === 'all' || filter.length === 0) return { clause: '1=1', params: [] };
  const placeholders = filter.map(() => '?').join(',');
  return { clause: `${column} IN (${placeholders})`, params: filter };
}

// ---------- Pages ----------

export async function getPagesByDomain(domainId: number): Promise<Page[]> {
  const db = await getDb();
  return db.getAllAsync<Page>(
    'SELECT * FROM pages WHERE domain_id = ? ORDER BY sort_order ASC',
    [domainId]
  );
}

export async function getPageWithDomain(pageId: number): Promise<PageWithDomain | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<PageWithDomain>(
    `SELECT p.*, d.name as domain_name, d.color as domain_color, d.slug as domain_slug
     FROM pages p JOIN domains d ON d.id = p.domain_id WHERE p.id = ?`,
    [pageId]
  );
  return row ?? null;
}

export async function getPagesReadStatusByDomain(
  domainId: number
): Promise<Array<Page & { is_read: number }>> {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT p.*, COALESCE(pr.is_read, 0) as is_read
     FROM pages p LEFT JOIN progress pr ON pr.page_id = p.id
     WHERE p.domain_id = ? ORDER BY p.sort_order ASC`,
    [domainId]
  );
}

export async function getRandomPage(
  filter: 'all' | number[],
  preferUnread = true
): Promise<PageWithDomain | null> {
  const db = await getDb();
  const { clause, params } = domainWhere(filter);

  if (preferUnread) {
    const unread = await db.getFirstAsync<PageWithDomain>(
      `SELECT p.*, d.name as domain_name, d.color as domain_color, d.slug as domain_slug
       FROM pages p
       JOIN domains d ON d.id = p.domain_id
       LEFT JOIN progress pr ON pr.page_id = p.id
       WHERE ${clause} AND (pr.is_read IS NULL OR pr.is_read = 0)
       ORDER BY RANDOM() LIMIT 1`,
      params
    );
    if (unread) return unread;
  }

  const any = await db.getFirstAsync<PageWithDomain>(
    `SELECT p.*, d.name as domain_name, d.color as domain_color, d.slug as domain_slug
     FROM pages p JOIN domains d ON d.id = p.domain_id
     WHERE ${clause}
     ORDER BY RANDOM() LIMIT 1`,
    params
  );
  return any ?? null;
}

// ---------- Questions ----------

export async function getQuestionsForPage(pageId: number): Promise<Question[]> {
  const db = await getDb();
  return db.getAllAsync<Question>(
    'SELECT * FROM questions WHERE page_id = ? ORDER BY sort_order ASC',
    [pageId]
  );
}

export async function recordQuizAttempt(
  pageId: number,
  questionId: number,
  isCorrect: boolean
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO quiz_attempts (page_id, question_id, is_correct, answered_at) VALUES (?, ?, ?, ?)',
    [pageId, questionId, isCorrect ? 1 : 0, new Date().toISOString()]
  );
}

// ---------- Progress ----------

export async function markPageRead(pageId: number): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const existing = await db.getFirstAsync<Progress>(
    'SELECT * FROM progress WHERE page_id = ?',
    [pageId]
  );
  if (existing) {
    await db.runAsync(
      'UPDATE progress SET is_read = 1, last_read_at = ?, times_read = times_read + 1 WHERE page_id = ?',
      [now, pageId]
    );
  } else {
    await db.runAsync(
      'INSERT INTO progress (page_id, is_read, first_read_at, last_read_at, times_read) VALUES (?, 1, ?, ?, 1)',
      [pageId, now, now]
    );
  }
  // Ensure a leitner row exists so it enters the review cycle.
  const leitnerRow = await db.getFirstAsync('SELECT page_id FROM leitner WHERE page_id = ?', [pageId]);
  if (!leitnerRow) {
    await db.runAsync(
      'INSERT INTO leitner (page_id, box, next_review_at, last_reviewed_at, correct_in_a_row) VALUES (?, 1, ?, NULL, 0)',
      [pageId, now]
    );
  }
}

export async function getReadPageIds(): Promise<Set<number>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ page_id: number }>(
    'SELECT page_id FROM progress WHERE is_read = 1'
  );
  return new Set(rows.map((r) => r.page_id));
}

// ---------- Leitner ----------

export async function applyLeitnerResult(pageId: number, scoreOutOf5: number): Promise<void> {
  const db = await getDb();
  const settings = await getSettings();
  const current = await db.getFirstAsync<LeitnerCard>(
    'SELECT * FROM leitner WHERE page_id = ?',
    [pageId]
  );
  const currentBox = current?.box ?? 1;
  const { box, nextReviewAt } = nextLeitnerState(
    currentBox,
    scoreOutOf5,
    settings.intervals,
    settings.passThreshold
  );
  const now = new Date().toISOString();
  if (current) {
    await db.runAsync(
      'UPDATE leitner SET box = ?, next_review_at = ?, last_reviewed_at = ?, correct_in_a_row = ? WHERE page_id = ?',
      [box, nextReviewAt, now, scoreOutOf5 >= settings.passThreshold ? current.correct_in_a_row + 1 : 0, pageId]
    );
  } else {
    await db.runAsync(
      'INSERT INTO leitner (page_id, box, next_review_at, last_reviewed_at, correct_in_a_row) VALUES (?, ?, ?, ?, ?)',
      [pageId, box, nextReviewAt, now, scoreOutOf5 >= settings.passThreshold ? 1 : 0]
    );
  }
}

export async function getDuePages(filter: 'all' | number[]): Promise<Array<PageWithDomain & LeitnerCard>> {
  const db = await getDb();
  const { clause, params } = domainWhere(filter);
  const now = new Date().toISOString();
  return db.getAllAsync(
    `SELECT p.*, d.name as domain_name, d.color as domain_color, d.slug as domain_slug,
            l.box, l.next_review_at, l.last_reviewed_at, l.correct_in_a_row
     FROM leitner l
     JOIN pages p ON p.id = l.page_id
     JOIN domains d ON d.id = p.domain_id
     WHERE l.next_review_at <= ? AND ${clause}
     ORDER BY l.next_review_at ASC`,
    [now, ...params]
  );
}

export async function getDueCount(filter: 'all' | number[]): Promise<number> {
  const rows = await getDuePages(filter);
  return rows.length;
}

// ---------- Exam mode ----------

export async function getRandomQuestion(
  filter: 'all' | number[],
  excludeIds: number[]
): Promise<(Question & { page_title: string; domain_name: string; domain_color: string }) | null> {
  const db = await getDb();
  const { clause, params } = domainWhere(filter);
  const excludeClause = excludeIds.length ? `AND q.id NOT IN (${excludeIds.map(() => '?').join(',')})` : '';
  const row = await db.getFirstAsync<any>(
    `SELECT q.*, p.title as page_title, d.name as domain_name, d.color as domain_color
     FROM questions q
     JOIN pages p ON p.id = q.page_id
     JOIN domains d ON d.id = p.domain_id
     WHERE ${clause} ${excludeClause}
     ORDER BY RANDOM() LIMIT 1`,
    [...params, ...excludeIds]
  );
  return row ?? null;
}

export async function saveExamRecord(filterKey: string, streak: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO exam_records (domain_filter, streak, achieved_at) VALUES (?, ?, ?)',
    [filterKey, streak, new Date().toISOString()]
  );
}

export async function getBestStreak(filterKey: string): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ best: number | null }>(
    'SELECT MAX(streak) as best FROM exam_records WHERE domain_filter = ?',
    [filterKey]
  );
  return row?.best ?? 0;
}

// ---------- Settings ----------

const SETTINGS_DEFAULTS: AppSettings = {
  theme: 'light',
  fontSize: 'medium',
  randomDomainFilter: 'all',
  passThreshold: DEFAULT_PASS_THRESHOLD,
  intervals: DEFAULT_INTERVALS,
  reminderEnabled: false,
  reminderHour: 20,
  reminderMinute: 0,
};

export async function getSettings(): Promise<AppSettings> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT * FROM settings');
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const get = <K extends keyof AppSettings>(key: K): AppSettings[K] => {
    const raw = map.get(key as string);
    if (raw === undefined) return SETTINGS_DEFAULTS[key];
    try {
      return JSON.parse(raw);
    } catch {
      return SETTINGS_DEFAULTS[key];
    }
  };
  return {
    theme: get('theme'),
    fontSize: get('fontSize'),
    randomDomainFilter: get('randomDomainFilter'),
    passThreshold: get('passThreshold'),
    intervals: get('intervals'),
    reminderEnabled: get('reminderEnabled'),
    reminderHour: get('reminderHour'),
    reminderMinute: get('reminderMinute'),
  };
}

export async function setSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, JSON.stringify(value)]
  );
}

// ---------- Stats ----------

export async function getOverallStats() {
  const db = await getDb();
  const totalPages = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM pages');
  const readPages = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM progress WHERE is_read = 1'
  );
  const totalAnswers = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM quiz_attempts');
  const correctAnswers = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM quiz_attempts WHERE is_correct = 1'
  );
  const dueToday = await getDueCount('all');
  const bestStreakAll = await getBestStreak('all');
  return {
    totalPages: totalPages?.c ?? 0,
    readPages: readPages?.c ?? 0,
    totalAnswers: totalAnswers?.c ?? 0,
    correctAnswers: correctAnswers?.c ?? 0,
    dueToday,
    bestStreakAll,
  };
}

export async function getDomainStats(): Promise<DomainStat[]> {
  const db = await getDb();
  return db.getAllAsync<DomainStat>(`
    SELECT
      d.id as domain_id,
      d.name as domain_name,
      d.color as domain_color,
      COUNT(DISTINCT p.id) as total_pages,
      COUNT(DISTINCT CASE WHEN pr.is_read = 1 THEN p.id END) as read_pages,
      COUNT(qa.id) as total_answers,
      COUNT(CASE WHEN qa.is_correct = 1 THEN 1 END) as correct_answers
    FROM domains d
    LEFT JOIN pages p ON p.domain_id = d.id
    LEFT JOIN progress pr ON pr.page_id = p.id
    LEFT JOIN quiz_attempts qa ON qa.page_id = p.id
    GROUP BY d.id
    ORDER BY d.sort_order ASC
  `);
}

// ---------- Backup / restore ----------

export async function exportAllData(): Promise<string> {
  const db = await getDb();
  const progress = await db.getAllAsync('SELECT * FROM progress');
  const leitner = await db.getAllAsync('SELECT * FROM leitner');
  const quizAttempts = await db.getAllAsync('SELECT * FROM quiz_attempts');
  const examRecords = await db.getAllAsync('SELECT * FROM exam_records');
  const settingsRows = await db.getAllAsync('SELECT * FROM settings');
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: 1,
      progress,
      leitner,
      quizAttempts,
      examRecords,
      settingsRows,
    },
    null,
    2
  );
}

export async function importAllData(json: string): Promise<void> {
  const db = await getDb();
  const data = JSON.parse(json);
  await db.withTransactionAsync(async () => {
    await db.execAsync(
      'DELETE FROM progress; DELETE FROM leitner; DELETE FROM quiz_attempts; DELETE FROM exam_records; DELETE FROM settings;'
    );
    for (const row of data.progress ?? []) {
      await db.runAsync(
        'INSERT INTO progress (page_id, is_read, first_read_at, last_read_at, times_read) VALUES (?, ?, ?, ?, ?)',
        [row.page_id, row.is_read, row.first_read_at, row.last_read_at, row.times_read]
      );
    }
    for (const row of data.leitner ?? []) {
      await db.runAsync(
        'INSERT INTO leitner (page_id, box, next_review_at, last_reviewed_at, correct_in_a_row) VALUES (?, ?, ?, ?, ?)',
        [row.page_id, row.box, row.next_review_at, row.last_reviewed_at, row.correct_in_a_row]
      );
    }
    for (const row of data.quizAttempts ?? []) {
      await db.runAsync(
        'INSERT INTO quiz_attempts (page_id, question_id, is_correct, answered_at) VALUES (?, ?, ?, ?)',
        [row.page_id, row.question_id, row.is_correct, row.answered_at]
      );
    }
    for (const row of data.examRecords ?? []) {
      await db.runAsync(
        'INSERT INTO exam_records (domain_filter, streak, achieved_at) VALUES (?, ?, ?)',
        [row.domain_filter, row.streak, row.achieved_at]
      );
    }
    for (const row of data.settingsRows ?? []) {
      await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', [row.key, row.value]);
    }
  });
}
