"use client";

import * as React from "react";
import { FileText, FileSpreadsheet, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toISODate } from "@/lib/format";

export function ReportGenerator() {
  const [type, setType] = React.useState("daily");
  const [date, setDate] = React.useState(toISODate(new Date()));

  function url(format: string) {
    const p = new URLSearchParams({ type, date, format });
    return `/api/reports?${p.toString()}`;
  }

  return (
    <div className="max-w-xl rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Report type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">
            {type === "monthly" ? "Any date in month" : type === "weekly" ? "Week starting" : "Date"}
          </Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <p className="mt-5 text-sm text-muted-foreground">Download in your preferred format:</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Button asChild className="bg-primary text-primary-foreground">
          <a href={url("pdf")} target="_blank" rel="noreferrer">
            <FileText className="size-4" /> PDF
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={url("excel")}>
            <FileSpreadsheet className="size-4" /> Excel
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={url("csv")}>
            <FileDown className="size-4" /> CSV
          </a>
        </Button>
      </div>
    </div>
  );
}
