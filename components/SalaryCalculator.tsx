"use client";

import { useMemo, useState } from "react";

import ExcelUpload from "./ExcelUpload";
import ManualSalaryForm from "./ManualSalaryForm";
import SalaryPreview from "./SalaryPreview";

import { calculateSalary } from "@/lib/salary-calculator";
import { EmployeeSalary, SalaryCalculation } from "@/types/salary";

export default function SalaryCalculator() {
  const [employees, setEmployees] = useState<EmployeeSalary[]>([]);

  /* ============================================================
     CALCULATIONS
  ============================================================ */

  const calculations: SalaryCalculation[] = useMemo(() => {
    return employees.map((employee) => calculateSalary(employee));
  }, [employees]);

  /* ============================================================
     VALID ROWS
  ============================================================ */

  const validRows = useMemo(() => {
    return calculations.filter((employee) => !employee.error);
  }, [calculations]);

  /* ============================================================
     TOTAL BASIC
  ============================================================ */

  const totalBasic = useMemo(() => {
    return validRows.reduce(
      (sum, employee) => sum + Number(employee.basicSalary || 0),
      0,
    );
  }, [validRows]);

  /* ============================================================
     TOTAL EARNED
  ============================================================ */

  const totalEarned = useMemo(() => {
    return validRows.reduce(
      (sum, employee) => sum + Number(employee.earnedSalary || 0),
      0,
    );
  }, [validRows]);

  /* ============================================================
     TOTAL LATE DEDUCTION
  ============================================================ */

  const totalLateDeduction = useMemo(() => {
    return validRows.reduce(
      (sum, employee) => sum + Number(employee.lateDeduction || 0),
      0,
    );
  }, [validRows]);

  /* ============================================================
     TOTAL PAYABLE
  ============================================================ */

  const totalPayable = useMemo(() => {
    return validRows.reduce(
      (sum, employee) => sum + Number(employee.toBePaid || 0),
      0,
    );
  }, [validRows]);

  /* ============================================================
     EXCEL IMPORT
  ============================================================ */

  function handleUpload(uploadedEmployees: EmployeeSalary[]) {
    setEmployees((current) => {
      /*
       * Existing employees are preserved.
       * Imported Excel employees are appended.
       */
      return [...current, ...uploadedEmployees];
    });
  }

  /* ============================================================
     MANUAL EMPLOYEE
  ============================================================ */

  function handleAddEmployee(employee: EmployeeSalary) {
    setEmployees((current) => [...current, employee]);
  }

  /* ============================================================
     UPDATE EMPLOYEE
  ============================================================ */

  function handleUpdate(
    id: string,
    field: keyof EmployeeSalary,
    value: string,
  ) {
    setEmployees((current) =>
      current.map((employee) => {
        if (employee.id !== id) {
          return employee;
        }

        const updatedEmployee: EmployeeSalary = {
          ...employee,
          [field]:
            field === "name"
              ? value
              : value === ""
                ? 0
                : Number(value),
        };

        return updatedEmployee;
      }),
    );
  }

  /* ============================================================
     DELETE EMPLOYEE
  ============================================================ */

  function handleDelete(id: string) {
    setEmployees((current) =>
      current.filter((employee) => employee.id !== id),
    );
  }

  /* ============================================================
     FORMAT MONEY
  ============================================================ */

  function formatMoney(value: number) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* ======================================================
            COMPANY HEADER
        ====================================================== */}

        <header className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              {/* BRAND */}

              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                {/* LOGO */}

                <div className="flex h-[62px] w-[185px] shrink-0 items-center sm:h-[70px] sm:w-[210px]">
                  <img
                    src="/logo.png"
                    alt="Shri Balaaji Advertising and Marketing"
                    className="h-full w-full object-contain object-left"
                  />
                </div>

                {/* DIVIDER */}

                <div className="hidden h-12 w-px bg-slate-200 sm:block" />

                {/* TITLE */}

                <div className="min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    Salary Calculator
                  </h1>

                  <p className="mt-1 text-sm text-slate-500 sm:text-base">
                    Employee salary & attendance management
                  </p>
                </div>
              </div>

              {/* PAYROLL BADGE */}

              <div className="hidden shrink-0 md:block">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Payroll
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Monthly Salary
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* HEADER ACCENT */}

          <div className="h-1 bg-slate-900" />
        </header>

        {/* ======================================================
            INTRO
        ====================================================== */}

        <section className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Salary Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload employee attendance or add employees manually to calculate
            their monthly salary.
          </p>
        </section>

        {/* ======================================================
            INPUT SECTION
        ====================================================== */}

        <section className="grid gap-6 lg:grid-cols-2">
          {/* ====================================================
              EXCEL UPLOAD
          ==================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Upload Salary Excel
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Import multiple employees from an Excel file.
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v12" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M5 21h14" />
                  </svg>
                </div>
              </div>
            </div>

            {/* IMPORTANT:
                ExcelUpload.tsx must have onImport prop.
            */}

            <ExcelUpload onImport={handleUpload} />
          </section>

          {/* ====================================================
              MANUAL ENTRY
          ==================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Add Employee Manually
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter employee salary and attendance details.
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 20a6 6 0 0 0-12 0" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M19 8v6" />
                    <path d="M16 11h6" />
                  </svg>
                </div>
              </div>
            </div>

            <ManualSalaryForm onAdd={handleAddEmployee} />
          </section>
        </section>

        {/* ======================================================
            SUMMARY
        ====================================================== */}

        {calculations.length > 0 && (
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* EMPLOYEES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Employees
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-950">
                    {calculations.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Total employees
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
            </div>

            {/* TOTAL BASIC */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    Total Basic
                  </p>

                  <p className="mt-2 truncate text-2xl font-bold text-slate-950">
                    {formatMoney(totalBasic)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Monthly basic salary
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <span className="text-lg font-bold">₹</span>
                </div>
              </div>
            </div>

            {/* TOTAL EARNED */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    Total Earned
                  </p>

                  <p className="mt-2 truncate text-2xl font-bold text-slate-950">
                    {formatMoney(totalEarned)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Earned salary
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v18" />
                    <path d="M17 7.5c0-2-2-3.5-5-3.5s-5 1.5-5 3.5 2 3 5 3 5 1 5 3.5-2 4-5 4-5-1.5-5-4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* TOTAL PAYABLE */}

            <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-400">
                    Total To Be Paid
                  </p>

                  <p className="mt-2 truncate text-2xl font-bold">
                    {formatMoney(totalPayable)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Final payable amount
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v18" />
                    <path d="M17 7.5c0-2-2-3.5-5-3.5s-5 1.5-5 3.5 2 3 5 3 5 1 5 3.5-2 4-5 4-5-1.5-5-4" />
                  </svg>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================
            DEDUCTION SUMMARY
        ====================================================== */}

        {calculations.length > 0 && (
          <section className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Late Deduction Summary
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                Total deduction from valid employee records
              </p>
            </div>

            <p className="text-lg font-bold text-red-600">
              {formatMoney(totalLateDeduction)}
            </p>
          </section>
        )}

        {/* ======================================================
            SALARY PREVIEW
        ====================================================== */}

        {calculations.length > 0 && (
          <SalaryPreview
            employees={calculations}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            totalLateDeduction={totalLateDeduction}
            totalPayable={totalPayable}
          />
        )}

        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {calculations.length === 0 && (
          <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h4" />
              </svg>
            </div>

            <h3 className="mt-5 text-base font-bold text-slate-900">
              No employees added yet
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              Upload an Excel file or add an employee manually to start
              calculating salaries.
            </p>
          </section>
        )}

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <footer className="mt-8 border-t border-slate-200 py-5">
          <div className="flex flex-col gap-1 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p className="text-xs text-slate-400">
              Shri Balaaji Advertising & Marketing Pvt. Ltd.
            </p>

            <p className="text-xs text-slate-400">
              Salary Management System
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}