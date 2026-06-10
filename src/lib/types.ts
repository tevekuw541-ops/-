import type { FreeSlots } from "./slots";

export type Gender = "男" | "女" | "不方便透露";
export type ApplicantStatus = "pending" | "contacted" | "qualified" | "rejected";

export type Applicant = {
  id: number;
  name: string;
  phone: string;
  wechat: string;
  grade: string;
  gender: Gender;
  remark: string;
  schedule_image_url: string;
  schedule_ocr_text: string;
  schedule_ocr_json: string;
  free_slots_json: string;
  status: ApplicantStatus;
  created_at: string;
  updated_at: string;
};

export type ApplicantView = Omit<Applicant, "free_slots_json"> & {
  freeSlots: FreeSlots;
};

export type ApplicantFilters = {
  q?: string;
  name?: string;
  phone?: string;
  wechat?: string;
  grade?: string;
  gender?: string;
  status?: string;
  day?: string;
  period?: string;
  from?: string;
  to?: string;
};
