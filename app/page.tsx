"use client";

import { useState } from "react";

import ManualSalaryForm from "@/components/ManualSalaryForm";
import ExcelUpload from "@/components/ExcelUpload";
import SalaryPreview from "@/components/SalaryPreview";

import { EmployeeSalary, SalaryCalculation } from "@/types/salary";
import { calculateSalary } from "@/lib/salary-calculator";

export default function SalaryCalculatorPage() {
  const [employees, setEmployees] = useState<SalaryCalculation[]>([]);

  /* ============================================================
     ADD EMPLOYEE
  ============================================================ */

  function handleAddEmployee(employee: EmployeeSalary) {
    const calculation = calculateSalary(employee);

    setEmployees((current) => [...current, calculation]);
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
          id: employee.id,
          name: field === "name" ? value : employee.name,
          basicSalary:
            field === "basicSalary"
              ? Number(value)
              : Number(employee.basicSalary),
          daysInMonth:
            field === "daysInMonth"
              ? Number(value)
              : Number(employee.daysInMonth),
          presentDays:
            field === "presentDays"
              ? Number(value)
              : Number(employee.presentDays),
          lateDays:
            field === "lateDays" ? Number(value) : Number(employee.lateDays),
        };

        return calculateSalary(updatedEmployee);
      }),
    );
  }

  /* ============================================================
     DELETE EMPLOYEE
  ============================================================ */

  function handleDelete(id: string) {
    setEmployees((current) => current.filter((employee) => employee.id !== id));
  }

  /* ============================================================
     EXCEL IMPORT
  ============================================================ */

  function handleExcelImport(importedEmployees: EmployeeSalary[]) {
    const calculatedEmployees = importedEmployees.map((employee) =>
      calculateSalary(employee),
    );

    setEmployees((current) => [...current, ...calculatedEmployees]);
  }

  /* ============================================================
     TOTALS
  ============================================================ */

  const totalLateDeduction = employees.reduce(
    (total, employee) => total + Number(employee.lateDeduction || 0),
    0,
  );

  const totalPayable = employees.reduce(
    (total, employee) => total + Number(employee.toBePaid || 0),
    0,
  );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* ====================================================
            COMPANY HEADER
        ==================================================== */}

        <header className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            {/* BRAND + PAGE TITLE */}

            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              {/* LOGO */}

              <div className="flex h-[62px] w-[185px] shrink-0 items-center sm:h-[70px] sm:w-[210px]">
                <img
                  src="/logo.png"
                  alt="Shri Balaaji Advertising & Marketing Pvt. Ltd."
                  className="h-full w-full object-contain object-left"
                />
              </div>

              {/* DIVIDER */}

              <div className="hidden h-12 w-px bg-slate-200 sm:block" />

              {/* PAGE TITLE */}

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
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Payroll
                </p>

                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  Monthly Salary
                </p>
              </div>
            </div>
          </div>

          {/* HEADER BOTTOM LINE */}

          <div className="h-1 bg-slate-900" />
        </header>

        {/* ====================================================
            INTRO
        ==================================================== */}

        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Salary Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add employees manually or import multiple employees using an Excel
            file.
          </p>
        </div>

        {/* ====================================================
            INPUT SECTION
        ==================================================== */}

        <section className="grid gap-6 lg:grid-cols-2">
          {/* MANUAL ENTRY */}

          <ManualSalaryForm onAdd={handleAddEmployee} />

          {/* EXCEL UPLOAD */}

          <ExcelUpload onImport={handleExcelImport} />
        </section>

        {/* ====================================================
            SALARY PREVIEW
        ==================================================== */}

        {employees.length > 0 && (
          <SalaryPreview
            employees={employees}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            totalLateDeduction={totalLateDeduction}
            totalPayable={totalPayable}
          />
        )}

        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {employees.length === 0 && (
          <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-500"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />

                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h4" />
              </svg>
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              No employees added yet
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Add an employee manually or upload an Excel file to start
              calculating salaries.
            </p>
          </section>
        )}

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <footer className="mt-8 border-t border-slate-200 py-5">
          <div className="flex flex-col gap-1 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p className="text-xs text-slate-400">
              Shri Balaaji Advertising & Marketing Pvt. Ltd.
            </p>

            <p className="text-xs text-slate-400">Salary Management System</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
