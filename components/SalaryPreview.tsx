"use client";

import { useState } from "react";
import { EmployeeSalary, SalaryCalculation } from "@/types/salary";
import { downloadSalaryPDF, previewSalaryPDF } from "@/lib/pdf";

import * as XLSX from "xlsx";

interface Props {
  employees: SalaryCalculation[];

  onUpdate: (id: string, field: keyof EmployeeSalary, value: string) => void;

  onDelete: (id: string) => void;

  totalLateDeduction: number;
  totalPayable: number;
}

export default function SalaryPreview({
  employees,
  onUpdate,
  onDelete,
  totalLateDeduction,
  totalPayable,
}: Props) {
  const [search, setSearch] = useState("");

  const money = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(search.toLowerCase()),
  );

  const hasErrors = employees.some((employee) => employee.error);

  /* ============================================================
     DOWNLOAD EXCEL
  ============================================================ */

  function downloadExcel() {
    if (!employees.length || hasErrors) return;

    const excelData = employees.map((employee, index) => ({
      "#": index + 1,
      "Employee Name": employee.name,
      "Basic Salary": employee.basicSalary,
      "Days in Month": employee.daysInMonth,
      "Present Days": employee.presentDays,
      "Late Days": employee.lateDays,
      "Per Day Salary": Number(employee.perDaySalary.toFixed(2)),
      "Earned Salary": Number(employee.earnedSalary.toFixed(2)),
      "Late Deduction": Number(employee.lateDeduction.toFixed(2)),
      "To Be Paid": Number(employee.toBePaid.toFixed(2)),
      Status: employee.error ? "Error" : "Ready",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 24 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Report");

    XLSX.writeFile(
      workbook,
      `Salary-Report-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  }

  /* ============================================================
     PREVIEW PDF
  ============================================================ */

  function handlePreviewPDF() {
    if (!employees.length || hasErrors) return;

    previewSalaryPDF(employees);
  }

  /* ============================================================
     DOWNLOAD PDF
  ============================================================ */

  function handleDownloadPDF() {
    if (!employees.length || hasErrors) return;

    downloadSalaryPDF(employees);
  }

  /* ============================================================
     INPUT STYLE
  ============================================================ */

  const inputClass =
    "bg-white text-slate-900 placeholder:text-slate-400 " +
    "caret-slate-900 border border-slate-300 rounded-xl " +
    "px-4 py-2.5 text-sm font-medium outline-none " +
    "transition-all duration-150 " +
    "hover:border-slate-400 " +
    "focus:border-slate-900 " +
    "focus:ring-2 focus:ring-slate-900/10";

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col gap-5 border-b border-slate-200 p-6 lg:flex-row lg:items-center lg:justify-between">
        {/* TITLE */}

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Salary Preview</h2>

            {employees.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {employees.length}{" "}
                {employees.length === 1 ? "Employee" : "Employees"}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-600">
            Review and edit employee salary data before downloading.
          </p>
        </div>

        {/* ACTIONS */}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {/* SEARCH */}

          <div className="relative">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} h-11 w-full pl-11 pr-10 sm:w-64`}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl leading-none text-slate-400 transition hover:text-slate-700"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* PREVIEW PDF */}

          <button
            type="button"
            onClick={handlePreviewPDF}
            disabled={hasErrors || employees.length === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
            Preview PDF
          </button>

          {/* DOWNLOAD PDF */}

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={hasErrors || employees.length === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Download PDF
          </button>

          {/* DOWNLOAD EXCEL */}

          <button
            type="button"
            onClick={downloadExcel}
            disabled={hasErrors || employees.length === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <path d="M14 2v6h6" />
              <path d="M8 13h8" />
              <path d="M8 17h8" />
            </svg>
            Download Excel
          </button>
        </div>
      </div>

      {/* ==================================================
          ERROR BANNER
      ================================================== */}

      {hasErrors && (
        <div className="border-b border-red-200 bg-red-50 px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
              <span className="text-sm">⚠️</span>
            </div>

            <div>
              <p className="font-semibold text-red-800">
                Some rows need attention
              </p>

              <p className="mt-1 text-sm text-red-600">
                Fix the highlighted errors before downloading the salary report.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div className="grid border-b border-slate-200 md:grid-cols-3">
        {/* EMPLOYEES */}

        <div className="p-5 md:border-r border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Employees
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {employees.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">Total employees</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-600"
              >
                <circle cx="9" cy="7" r="4" />
                <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
                <path d="M16 3.5a4 4 0 0 1 0 7.8" />
                <path d="M21 21v-2a6 6 0 0 0-4-5.65" />
              </svg>
            </div>
          </div>
        </div>

        {/* LATE DEDUCTION */}

        <div className="p-5 md:border-r border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Late Deduction
              </p>

              <p className="mt-1 text-2xl font-bold text-red-600">
                {money(totalLateDeduction)}
              </p>

              <p className="mt-1 text-xs text-slate-500">Total deductions</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <span className="text-xl font-bold text-red-500">₹</span>
            </div>
          </div>
        </div>

        {/* TOTAL PAYABLE */}

        <div className="bg-slate-900 p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-300">
                Total To Be Paid
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {money(totalPayable)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Final payable amount
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M7 9h10" />
                <path d="M7 13h5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1450px] border-collapse">
          {/* TABLE HEADER */}

          <thead>
            <tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
              <th className="px-4 py-4">#</th>

              <th className="px-4 py-4">Employee</th>

              <th className="px-4 py-4">Basic</th>

              <th className="px-4 py-4">Days</th>

              <th className="px-4 py-4">Present</th>

              <th className="px-4 py-4">Late</th>

              <th className="px-4 py-4">Per Day</th>

              <th className="px-4 py-4">Earned</th>

              <th className="px-4 py-4">Late Deduction</th>

              <th className="px-4 py-4">To Be Paid</th>

              <th className="px-4 py-4">Status</th>

              <th className="px-4 py-4 text-center">Action</th>
            </tr>
          </thead>

          {/* TABLE BODY */}

          <tbody className="divide-y divide-slate-200">
            {filteredEmployees.map((employee, index) => {
              const rowHasError = Boolean(employee.error);

              return (
                <tr
                  key={employee.id}
                  className={
                    rowHasError
                      ? "bg-red-50"
                      : "bg-white transition hover:bg-slate-50"
                  }
                >
                  {/* NUMBER */}

                  <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                    {index + 1}
                  </td>

                  {/* NAME */}

                  <td className="px-4 py-4">
                    <input
                      type="text"
                      value={employee.name}
                      onChange={(e) =>
                        onUpdate(employee.id, "name", e.target.value)
                      }
                      className={`${inputClass} w-56`}
                    />
                  </td>

                  {/* BASIC */}

                  <td className="px-4 py-4">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={employee.basicSalary}
                      onChange={(e) =>
                        onUpdate(employee.id, "basicSalary", e.target.value)
                      }
                      className={`${inputClass} w-32`}
                    />
                  </td>

                  {/* DAYS */}

                  <td className="px-4 py-4">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={employee.daysInMonth}
                      onChange={(e) =>
                        onUpdate(employee.id, "daysInMonth", e.target.value)
                      }
                      className={`${inputClass} w-24`}
                    />
                  </td>

                  {/* PRESENT */}

                  <td className="px-4 py-4">
                    <input
                      type="number"
                      min="0"
                      value={employee.presentDays}
                      onChange={(e) =>
                        onUpdate(employee.id, "presentDays", e.target.value)
                      }
                      className={`${inputClass} w-24`}
                    />
                  </td>

                  {/* LATE */}

                  <td className="px-4 py-4">
                    <input
                      type="number"
                      min="0"
                      value={employee.lateDays}
                      onChange={(e) =>
                        onUpdate(employee.id, "lateDays", e.target.value)
                      }
                      className={`${inputClass} w-24`}
                    />
                  </td>

                  {/* PER DAY */}

                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-800">
                    {money(employee.perDaySalary)}
                  </td>

                  {/* EARNED */}

                  <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-800">
                    {money(employee.earnedSalary)}
                  </td>

                  {/* LATE DEDUCTION */}

                  <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-red-600">
                    -{money(employee.lateDeduction)}
                  </td>

                  {/* TO BE PAID */}

                  <td className="whitespace-nowrap px-4 py-4">
                    <span className="text-sm font-bold text-slate-900">
                      {money(employee.toBePaid)}
                    </span>
                  </td>

                  {/* STATUS */}

                  <td className="px-4 py-4">
                    {rowHasError ? (
                      <div className="max-w-[180px]">
                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          Error
                        </span>

                        <p className="mt-1 text-xs font-medium text-red-600">
                          {employee.error}
                        </p>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Ready
                      </span>
                    )}
                  </td>

                  {/* DELETE */}

                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => onDelete(employee.id)}
                      title={`Delete ${employee.name}`}
                      aria-label={`Delete ${employee.name}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:border-red-300 hover:bg-red-100 hover:text-red-700 active:scale-95"
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 15H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ==================================================
            EMPTY SEARCH STATE
        ================================================== */}

        {filteredEmployees.length === 0 && (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <span className="text-xl">🔍</span>
            </div>

            <p className="mt-4 font-semibold text-slate-800">
              No employees found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try another employee name.
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 text-sm font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-600"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {hasErrors ? (
              <span className="h-2 w-2 rounded-full bg-red-500" />
            ) : employees.length > 0 ? (
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            ) : null}

            <p className="text-sm font-medium text-slate-600">
              {hasErrors
                ? "Fix errors before downloading."
                : employees.length === 0
                  ? "Add employees to generate a report."
                  : "All employees are ready for export."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* FOOTER PREVIEW */}

          <button
            type="button"
            onClick={handlePreviewPDF}
            disabled={hasErrors || employees.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
            Preview PDF
          </button>

          {/* FOOTER DOWNLOAD PDF */}

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={hasErrors || employees.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Download PDF
          </button>

          {/* FOOTER EXCEL */}

          <button
            type="button"
            onClick={downloadExcel}
            disabled={hasErrors || employees.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <path d="M14 2v6h6" />
              <path d="M8 13h8" />
              <path d="M8 17h8" />
            </svg>
            Download Excel
          </button>
        </div>
      </div>
    </section>
  );
}
