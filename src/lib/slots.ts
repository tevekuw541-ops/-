export const days = [
  { key: "monday", label: "周一" },
  { key: "tuesday", label: "周二" },
  { key: "wednesday", label: "周三" },
  { key: "thursday", label: "周四" },
  { key: "friday", label: "周五" },
  { key: "saturday", label: "周六" },
  { key: "sunday", label: "周日" }
] as const;

export const periods = [
  { key: "1-2", label: "1-2 节", group: "上午" },
  { key: "3-4", label: "3-4 节", group: "上午" },
  { key: "5-6", label: "5-6 节", group: "下午" },
  { key: "7-8", label: "7-8 节", group: "下午" },
  { key: "9-10", label: "9-10 节", group: "晚上" }
] as const;

export type DayKey = (typeof days)[number]["key"];
export type PeriodKey = (typeof periods)[number]["key"];
export type FreeSlots = Record<DayKey, PeriodKey[]>;
export type BusySlots = Record<DayKey, PeriodKey[]>;

export const emptyFreeSlots = (): FreeSlots =>
  days.reduce((acc, day) => {
    acc[day.key] = [];
    return acc;
  }, {} as FreeSlots);

export const normalizeFreeSlots = (value: unknown): FreeSlots => {
  const result = emptyFreeSlots();
  if (!value || typeof value !== "object") return result;

  for (const day of days) {
    const slots = (value as Record<string, unknown>)[day.key];
    if (Array.isArray(slots)) {
      result[day.key] = slots.filter((slot): slot is PeriodKey =>
        periods.some((period) => period.key === slot)
      );
    }
  }
  return result;
};

export const freeToBusySlots = (freeSlots: FreeSlots): BusySlots =>
  days.reduce((acc, day) => {
    acc[day.key] = periods
      .map((period) => period.key)
      .filter((period) => !freeSlots[day.key].includes(period));
    return acc;
  }, {} as BusySlots);

export const busyToFreeSlots = (busySlots: BusySlots): FreeSlots =>
  days.reduce((acc, day) => {
    acc[day.key] = periods
      .map((period) => period.key)
      .filter((period) => !busySlots[day.key].includes(period));
    return acc;
  }, {} as FreeSlots);

export const slotLabel = (dayKey: string, periodKey: string) => {
  const day = days.find((item) => item.key === dayKey)?.label ?? dayKey;
  const period = periods.find((item) => item.key === periodKey)?.label ?? periodKey;
  return `${day} ${period}`;
};
