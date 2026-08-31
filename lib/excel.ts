import * as XLSX from "xlsx";
import { EmployeeSalary } from "@/types/salary";

function numberValue(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export async function parseSalaryExcel(file: File): Promise<EmployeeSalary[]> {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("Excel file has no sheet");
  }

  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  return rows.map((row, index) => ({
    id: `excel-${Date.now()}-${index}`,

    name: String(
      row["Name"] ?? row["name"] ?? row["Employee Name"] ?? "",
    ).trim(),

    basicSalary: numberValue(
      row["Basic"] ?? row["basic"] ?? row["Basic Salary"],
    ),

    daysInMonth: numberValue(
      row["Days in Month"] ?? row["daysInMonth"] ?? row["Days"],
    ),

    presentDays: numberValue(
      row["Present Days"] ?? row["presentDays"] ?? row["Present"],
    ),

    lateDays: numberValue(row["Late Days"] ?? row["lateDays"] ?? row["Late"]),
  }));
}
