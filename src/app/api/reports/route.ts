import { NextResponse } from "next/server";
import { getProfile, isAdminRole } from "@/lib/auth";
import { buildReport, periodRange, type ReportType } from "@/lib/services/report-data";
import { reportPdf } from "@/lib/services/pdf";
import { reportCsv, reportExcel } from "@/lib/services/report-export";
import { logAudit } from "@/lib/services/audit";
import { toISODate } from "@/lib/format";

const TYPES: ReportType[] = ["daily", "weekly", "monthly"];

export async function GET(request: Request) {
  const profile = await getProfile();
  if (!profile || !isAdminRole(profile.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") ?? "daily") as ReportType;
  const date = searchParams.get("date") ?? toISODate(new Date());
  const format = searchParams.get("format") ?? "pdf";

  if (!TYPES.includes(type)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }

  const data = await buildReport(type, date);
  const { start, end } = periodRange(type, date);
  const base = `mount-patrick-${type}-${start}`;

  await logAudit({
    actorId: profile.id,
    action: "report.generated",
    entity: "reports",
    metadata: { type, start, end, format },
  });

  if (format === "csv") {
    return new NextResponse(reportCsv(data), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${base}.csv"`,
      },
    });
  }

  if (format === "excel" || format === "xlsx") {
    const buf = await reportExcel(data);
    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${base}.xlsx"`,
      },
    });
  }

  const pdf = await reportPdf(data);
  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${base}.pdf"`,
    },
  });
}
