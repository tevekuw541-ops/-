export const getSchoolDurationYears = () => {
  const raw = Number(process.env.SCHOOL_DURATION_YEARS ?? "3");
  return Number.isFinite(raw) && raw >= 1 && raw <= 8 ? Math.floor(raw) : 3;
};

export const getGradeOptions = (year = new Date().getFullYear(), duration = getSchoolDurationYears()) => {
  return Array.from({ length: duration }, (_, index) => `${year - duration + 1 + index} 级`);
};
