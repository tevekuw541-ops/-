import { mkdirSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import { emptyFreeSlots, normalizeFreeSlots } from "./slots";
import type { FreeSlots } from "./slots";
import type { Applicant, ApplicantFilters, ApplicantView, ApplicantStatus } from "./types";

const dataDir = path.join(process.cwd(), "data");
let db: DatabaseSync | null = null;

const getDb = () => {
  if (db) return db;
  mkdirSync(dataDir, { recursive: true });
  db = new DatabaseSync(path.join(dataDir, "blackboard-cat.sqlite"));
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec(`
  CREATE TABLE IF NOT EXISTS applicants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    wechat TEXT NOT NULL,
    grade TEXT NOT NULL,
    gender TEXT NOT NULL,
    remark TEXT DEFAULT '',
    schedule_image_url TEXT NOT NULL,
    schedule_ocr_text TEXT DEFAULT '',
    schedule_ocr_json TEXT DEFAULT '{}',
    free_slots_json TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
  CREATE INDEX IF NOT EXISTS idx_applicants_created_at ON applicants(created_at);
  CREATE INDEX IF NOT EXISTS idx_applicants_grade ON applicants(grade);
  CREATE INDEX IF NOT EXISTS idx_applicants_gender ON applicants(gender);
  CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status);
  `);
  return db;
};

const toView = (row: Applicant): ApplicantView => ({
  ...row,
  freeSlots: normalizeFreeSlots(JSON.parse(row.free_slots_json || "{}"))
});

const rowsToViews = (rows: unknown[]) => rows.map((row) => toView(row as Applicant));

export const createApplicant = (input: {
  name: string;
  phone: string;
  wechat: string;
  grade: string;
  gender: string;
  remark: string;
  scheduleImageUrl: string;
  scheduleOcrText: string;
  scheduleOcrJson: unknown;
  inferredFreeSlots?: FreeSlots;
}) => {
  const result = getDb()
    .prepare(
      `INSERT INTO applicants
       (name, phone, wechat, grade, gender, remark, schedule_image_url, schedule_ocr_text, schedule_ocr_json, free_slots_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.name,
      input.phone,
      input.wechat,
      input.grade,
      input.gender,
      input.remark,
      input.scheduleImageUrl,
      input.scheduleOcrText,
      JSON.stringify(input.scheduleOcrJson),
      JSON.stringify(input.inferredFreeSlots ?? emptyFreeSlots())
    );
  return Number(result.lastInsertRowid);
};

const buildWhere = (filters: ApplicantFilters) => {
  const clauses: string[] = [];
  const params: string[] = [];

  const like = (field: string, value?: string) => {
    if (value) {
      clauses.push(`${field} LIKE ?`);
      params.push(`%${value}%`);
    }
  };

  if (filters.q) {
    clauses.push("(name LIKE ? OR phone LIKE ? OR wechat LIKE ?)");
    params.push(`%${filters.q}%`, `%${filters.q}%`, `%${filters.q}%`);
  }
  like("name", filters.name);
  like("phone", filters.phone);
  like("wechat", filters.wechat);
  if (filters.grade) {
    clauses.push("grade = ?");
    params.push(filters.grade);
  }
  if (filters.gender) {
    clauses.push("gender = ?");
    params.push(filters.gender);
  }
  if (filters.status) {
    clauses.push("status = ?");
    params.push(filters.status);
  }
  if (filters.from) {
    clauses.push("date(created_at) >= date(?)");
    params.push(filters.from);
  }
  if (filters.to) {
    clauses.push("date(created_at) <= date(?)");
    params.push(filters.to);
  }
  if (filters.day && filters.period) {
    clauses.push("EXISTS (SELECT 1 FROM json_each(json_extract(free_slots_json, ?)) WHERE value = ?)");
    params.push(`$.${filters.day}`, filters.period);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params
  };
};

export const listApplicants = (filters: ApplicantFilters = {}) => {
  const built = buildWhere(filters);
  const rows = getDb()
    .prepare(`SELECT * FROM applicants ${built.where} ORDER BY created_at DESC, id DESC`)
    .all(...built.params);
  return rowsToViews(rows);
};

export const getApplicant = (id: number) => {
  const row = getDb().prepare("SELECT * FROM applicants WHERE id = ?").get(id);
  return row ? toView(row as Applicant) : null;
};

export const updateApplicant = (
  id: number,
  input: { freeSlots?: unknown; status?: ApplicantStatus; remark?: string }
) => {
  const current = getApplicant(id);
  if (!current) return null;
  const freeSlots = input.freeSlots ? normalizeFreeSlots(input.freeSlots) : current.freeSlots;
  getDb().prepare(
    `UPDATE applicants
     SET free_slots_json = ?, status = ?, remark = COALESCE(?, remark), updated_at = datetime('now', 'localtime')
     WHERE id = ?`
  ).run(JSON.stringify(freeSlots), input.status ?? current.status, input.remark ?? null, id);
  return getApplicant(id);
};

export const updateScheduleAnalysis = (
  id: number,
  input: { scheduleOcrText: string; scheduleOcrJson: unknown; freeSlots: FreeSlots }
) => {
  getDb().prepare(
    `UPDATE applicants
     SET schedule_ocr_text = ?, schedule_ocr_json = ?, free_slots_json = ?, updated_at = datetime('now', 'localtime')
     WHERE id = ?`
  ).run(input.scheduleOcrText, JSON.stringify(input.scheduleOcrJson), JSON.stringify(input.freeSlots), id);
  return getApplicant(id);
};

export const deleteApplicant = (id: number) => {
  getDb().prepare("DELETE FROM applicants WHERE id = ?").run(id);
};

export const getStats = () => {
  const applicants = listApplicants();
  const today = new Date().toISOString().slice(0, 10);
  const byGrade = new Map<string, number>();
  const byGender = new Map<string, number>();
  const daily = new Map<string, number>();
  const bySlot = new Map<string, number>();

  for (const applicant of applicants) {
    byGrade.set(applicant.grade, (byGrade.get(applicant.grade) ?? 0) + 1);
    byGender.set(applicant.gender, (byGender.get(applicant.gender) ?? 0) + 1);
    const day = applicant.created_at.slice(0, 10);
    daily.set(day, (daily.get(day) ?? 0) + 1);
    for (const [dayKey, slots] of Object.entries(applicant.freeSlots)) {
      for (const slot of slots) {
        const key = `${dayKey}|${slot}`;
        bySlot.set(key, (bySlot.get(key) ?? 0) + 1);
      }
    }
  }

  return {
    total: applicants.length,
    today: applicants.filter((item) => item.created_at.slice(0, 10) === today).length,
    byGrade: [...byGrade].map(([name, count]) => ({ name, count })),
    byGender: [...byGender].map(([name, value]) => ({ name, value })),
    bySlot: [...bySlot].map(([key, count]) => ({ key, count })),
    daily: [...daily]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, count]) => ({ date: date.slice(5), count })),
    recent: applicants.slice(0, 6)
  };
};
