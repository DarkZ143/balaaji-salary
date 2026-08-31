"use client";

import { useState } from "react";
import Image from "next/image";
import { EmployeeSalary } from "@/types/salary";

interface Props {
  onAdd: (employee: EmployeeSalary) => void;
}

export default function ManualSalaryForm({ onAdd }: Props) {
  const [name, setName] = useState("");
  const [basicSalary, setBasicSalary] = useState("");
  const [daysInMonth, setDaysInMonth] = useState("30");
  const [presentDays, setPresentDays] = useState("");
  const [lateDays, setLateDays] = useState("0");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const basic = Number(basicSalary);
    const days = Number(daysInMonth);
    const present = Number(presentDays);
    const late = Number(lateDays);

    if (!name.trim()) {
      setError("Employee name is required.");
      return;
    }

    if (!basicSalary || basic < 0) {
      setError("Enter a valid basic salary.");
      return;
    }

    if (!days || days <= 0 || days > 31) {
      setError("Days in month must be between 1 and 31.");
      return;
    }

    if (presentDays === "") {
      setError("Enter the number of present days.");
      return;
    }

    if (present < 0 || present > days) {
      setError("Present days cannot be greater than days in month.");
      return;
    }

    if (late < 0 || late > present) {
      setError("Late days cannot be greater than present days.");
      return;
    }

    const employee: EmployeeSalary = {
      id: `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      basicSalary: basic,
      daysInMonth: days,
      presentDays: present,
      lateDays: late,
    };

    onAdd(employee);

    setName("");
    setBasicSalary("");
    setPresentDays("");
    setLateDays("0");
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-slate-300 " +
    "bg-white px-4 text-sm font-medium text-slate-900 " +
    "placeholder:text-slate-400 caret-slate-900 " +
    "outline-none transition-all duration-150 " +
    "hover:border-slate-400 " +
    "focus:border-slate-900 " +
    "focus:ring-4 focus:ring-slate-900/10";

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {/* ==================================================
          BRAND HEADER
      ================================================== */}

      <div className="relative overflow-hidden border-b border-slate-200 bg-white">
        {/* Gold top accent */}
        <div className="h-1 w-full bg-[#ca9414]" />

        <div className="px-6 py-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* BRAND */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <Image
                  src="/logo.png"
                  alt="Shri Balaaji Advertising and Marketing"
                  width={56}
                  height={56}
                  className="h-12 w-12 object-contain"
                  priority
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Shri Balaaji
                </p>

                <h1 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                  Advertising and Marketing
                </h1>

                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Employee Salary &amp; Payroll Management
                </p>
              </div>
            </div>

            {/* FORM BADGE */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Payroll
                </p>

                <p className="text-sm font-bold text-slate-800">Add Employee</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          SECTION TITLE
      ================================================== */}

      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Add Employee Manually
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Enter employee salary and attendance details.
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================
          FORM BODY
      ================================================== */}

      <div className="px-6 py-6">
        <div className="grid gap-5 md:grid-cols-2">
          {/* ==================================================
              EMPLOYEE NAME
          ================================================== */}

          <div className="md:col-span-2">
            <label
              htmlFor="employee-name"
              className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-800"
            >
              Employee Name
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>

              <input
                id="employee-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. Rahul Sharma"
                autoComplete="name"
                className={`${inputClass} pl-11`}
              />
            </div>

            <p className="mt-1.5 text-xs text-slate-500">
              Enter the employee&apos;s full name.
            </p>
          </div>

          {/* ==================================================
              BASIC SALARY
          ================================================== */}

          <div>
            <label
              htmlFor="basic-salary"
              className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-800"
            >
              Basic Salary / Month
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-700">
                ₹
              </span>

              <input
                id="basic-salary"
                type="number"
                min="0"
                step="0.01"
                value={basicSalary}
                onChange={(e) => {
                  setBasicSalary(e.target.value);
                  if (error) setError("");
                }}
                placeholder="30,000"
                inputMode="decimal"
                className={`${inputClass} pl-9`}
              />
            </div>

            <p className="mt-1.5 text-xs text-slate-500">
              Monthly basic salary before attendance deductions.
            </p>
          </div>

          {/* ==================================================
              DAYS IN MONTH
          ================================================== */}

          <div>
            <label
              htmlFor="days-in-month"
              className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-800"
            >
              Days in Month
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                id="days-in-month"
                type="number"
                min="1"
                max="31"
                value={daysInMonth}
                onChange={(e) => {
                  setDaysInMonth(e.target.value);
                  if (error) setError("");
                }}
                inputMode="numeric"
                className={`${inputClass} pr-16`}
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                DAYS
              </span>
            </div>

            <p className="mt-1.5 text-xs text-slate-500">
              Usually 28–31 days depending on the month.
            </p>
          </div>

          {/* ==================================================
              PRESENT DAYS
          ================================================== */}

          <div>
            <label
              htmlFor="present-days"
              className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-800"
            >
              Present Days
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                id="present-days"
                type="number"
                min="0"
                max={daysInMonth || 31}
                value={presentDays}
                onChange={(e) => {
                  setPresentDays(e.target.value);
                  if (error) setError("");
                }}
                placeholder="26"
                inputMode="numeric"
                className={`${inputClass} pr-16`}
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                DAYS
              </span>
            </div>

            <p className="mt-1.5 text-xs text-slate-500">
              Sundays and holidays can be counted as present by admin.
            </p>
          </div>

          {/* ==================================================
              LATE DAYS
          ================================================== */}

          <div>
            <label
              htmlFor="late-days"
              className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-800"
            >
              Late Days
            </label>

            <div className="relative">
              <input
                id="late-days"
                type="number"
                min="0"
                max={presentDays || 0}
                value={lateDays}
                onChange={(e) => {
                  setLateDays(e.target.value);
                  if (error) setError("");
                }}
                inputMode="numeric"
                className={`${inputClass} pr-16`}
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                DAYS
              </span>
            </div>

            <p className="mt-1.5 text-xs text-slate-500">
              Each late day results in a ½ day salary deduction.
            </p>
          </div>
        </div>

        {/* ==================================================
            CALCULATION INFO
        ================================================== */}

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Automatic salary calculation
              </p>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Per-day salary, earned salary and late deductions will be
                calculated automatically after adding the employee.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-600"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.3 3.6 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-red-800">
                Please check the form
              </p>

              <p className="mt-0.5 text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="mt-7 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          {/* INFO */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </span>

            <span>Salary will be calculated automatically.</span>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-slate-800 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-slate-900/15"
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
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Add Employee
          </button>
        </div>
      </div>
    </form>
  );
}
