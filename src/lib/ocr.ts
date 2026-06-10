import path from "path";
import sharp from "sharp";
import { days, emptyFreeSlots, periods, type FreeSlots, type PeriodKey } from "./slots";

type AnalysisCell = {
  day: string;
  period: PeriodKey;
  busy: boolean;
  colorRatio: number;
};

const weekdayCount = 5;
const courseThreshold = 0.12;

const isCourseColor = (r: number, g: number, b: number, a: number) => {
  if (a < 80) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max - min;
  const greenCourse = g > 120 && g > r + 18 && g > b + 8;
  const pinkCourse = r > 200 && b > 150 && g < 210;
  const blueCourse = b > 150 && g > 140 && r < 210;
  return saturation > 34 && (greenCourse || pinkCourse || blueCourse);
};

const rowColorDensity = (data: Buffer, width: number, channels: number, y: number) => {
  let colored = 0;
  for (let x = 0; x < width; x += 3) {
    const index = (y * width + x) * channels;
    if (isCourseColor(data[index], data[index + 1], data[index + 2], data[index + 3] ?? 255)) {
      colored++;
    }
  }
  return colored / Math.ceil(width / 3);
};

const rectColorRatio = (
  data: Buffer,
  width: number,
  height: number,
  channels: number,
  rect: { left: number; top: number; right: number; bottom: number }
) => {
  let colored = 0;
  let total = 0;
  for (let y = Math.max(0, rect.top); y < Math.min(rect.bottom, height); y += 3) {
    for (let x = Math.max(0, rect.left); x < Math.min(rect.right, width); x += 3) {
      const index = (y * width + x) * channels;
      total++;
      if (isCourseColor(data[index], data[index + 1], data[index + 2], data[index + 3] ?? 255)) {
        colored++;
      }
    }
  }
  return total ? colored / total : 0;
};

const withWeekendFree = () => {
  const freeSlots: FreeSlots = emptyFreeSlots();
  freeSlots.saturday = periods.map((period) => period.key);
  freeSlots.sunday = periods.map((period) => period.key);
  return freeSlots;
};

export const analyzeScheduleImage = async (fileName: string) => {
  const imagePath = path.join(process.cwd(), "public", "uploads", fileName);
  const image = sharp(imagePath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const freeSlots = withWeekendFree();
  const cells: AnalysisCell[] = [];
  const scanTop = Math.floor(height * 0.12);
  const scanBottom = Math.floor(height * 0.58);
  const coloredRows: number[] = [];

  for (let y = scanTop; y < scanBottom; y += 2) {
    if (rowColorDensity(data, width, channels, y) > 0.018) coloredRows.push(y);
  }

  if (coloredRows.length < 12) {
    return {
      text: "自动识别未找到清晰的课表颜色块，周六周日已默认标为空闲，请手动复核周一到周五。",
      freeSlots,
      json: {
        engine: "color-grid-v2",
        fileName,
        confidence: 0,
        reason: "not_enough_colored_rows",
        image: { width, height }
      }
    };
  }

  const runs: { start: number; end: number; count: number }[] = [];
  for (const y of coloredRows) {
    const current = runs[runs.length - 1];
    if (!current || y - current.end > 10) {
      runs.push({ start: y, end: y, count: 1 });
    } else {
      current.end = y;
      current.count++;
    }
  }

  const scheduleRun =
    runs.find((run) => run.end - run.start > 120 && run.start < height * 0.42) ??
    [...runs].sort((a, b) => b.count - a.count)[0];

  const first = scheduleRun.start;
  const last = scheduleRun.end;
  const gridHeight = last - first;
  const headerHeight = Math.max(18, Math.round(gridHeight / 11));
  const classTop = first + headerHeight;
  const rowHeight = Math.max(8, (last - classTop) / 10);

  // 课表横坐标是周一到周日，左侧是课次标签；这里只识别周一到周五。
  const leftLabelWidth = Math.round(width * 0.112);
  const usableWidth = width - leftLabelWidth;
  const colWidth = usableWidth / 7;

  let busyCount = 0;
  for (let dayIndex = 0; dayIndex < weekdayCount; dayIndex++) {
    const day = days[dayIndex];
    const left = Math.round(leftLabelWidth + dayIndex * colWidth + colWidth * 0.08);
    const right = Math.round(leftLabelWidth + (dayIndex + 1) * colWidth - colWidth * 0.08);

    for (let periodIndex = 0; periodIndex < periods.length; periodIndex++) {
      const period = periods[periodIndex];
      const rowStart = periodIndex * 2;
      const top = Math.round(classTop + rowStart * rowHeight + rowHeight * 0.18);
      const bottom = Math.round(classTop + (rowStart + 2) * rowHeight - rowHeight * 0.18);
      const colorRatio = rectColorRatio(data, width, height, channels, { left, top, right, bottom });
      const busy = colorRatio >= courseThreshold;
      if (busy) busyCount++;
      if (!busy) freeSlots[day.key].push(period.key);
      cells.push({ day: day.key, period: period.key, busy, colorRatio: Number(colorRatio.toFixed(4)) });
    }
  }

  const weekdayTotal = weekdayCount * periods.length;
  const weekdayFreeCount = weekdayTotal - busyCount;
  const weekendFreeCount = 2 * periods.length;
  const freeCount = weekdayFreeCount + weekendFreeCount;
  const confidence = Math.min(0.94, Math.max(0.5, coloredRows.length / Math.max(1, gridHeight) + 0.35));

  return {
    text: `已按横向周几、纵向课次自动识别：周一到周五 ${weekdayFreeCount} 个空闲节次，${busyCount} 个可能有课节次；周六周日默认标为空闲。共标记 ${freeCount} 个空闲节次，请管理员复核。`,
    freeSlots,
    json: {
      engine: "color-grid-v2",
      fileName,
      confidence: Number(confidence.toFixed(2)),
      threshold: courseThreshold,
      image: { width, height },
      detectedGrid: { firstColoredRow: first, lastColoredRow: last, classTop, rowHeight, leftLabelWidth },
      cells
    }
  };
};

export const runScheduleOcr = analyzeScheduleImage;
