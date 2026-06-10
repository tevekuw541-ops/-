import { getGradeOptions } from "./grades";

export const genders = ["男", "女", "不方便透露"] as const;
export const statuses = ["pending", "contacted", "qualified", "rejected"] as const;

export const statusLabels: Record<(typeof statuses)[number], string> = {
  pending: "未联系",
  contacted: "已联系",
  qualified: "合适",
  rejected: "不合适"
};

export const isValidPhone = (phone: string) => /^1[3-9]\d{9}$/.test(phone);

export const validateApplicantFields = (fields: Record<string, string>) => {
  const errors: Record<string, string> = {};
  if (!fields.name?.trim()) errors.name = "请填写姓名";
  if (!fields.phone?.trim() || !isValidPhone(fields.phone.trim())) errors.phone = "请填写正确的手机号";
  if (!fields.wechat?.trim()) errors.wechat = "请填写微信号";
  if (!getGradeOptions().includes(fields.grade)) errors.grade = "请选择有效年级";
  if (!genders.includes(fields.gender as (typeof genders)[number])) errors.gender = "请选择性别";
  return errors;
};

export const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
export const maxImageSize = 10 * 1024 * 1024;
