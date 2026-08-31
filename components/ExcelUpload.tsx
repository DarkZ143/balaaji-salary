"use client";

import { useRef, useState } from "react";

import { parseSalaryExcel } from "@/lib/excel";
import { EmployeeSalary } from "@/types/salary";

interface Props {
  onImport: (employees: EmployeeSalary[]) => void;
}

export default function ExcelUpload({ onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ============================================================
     HANDLE FILE
  ============================================================ */

  async function handleFile(file?: File) {
    if (!file || loading) {
      return;
    }

    setError("");

    /* ----------------------------------------------------------
       Validate Excel extension
    ---------------------------------------------------------- */

    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      setError("Please upload a valid Excel file (.xlsx or .xls).");

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    try {
      setLoading(true);

      /* --------------------------------------------------------
         Parse Excel
      -------------------------------------------------------- */

      const employees = await parseSalaryExcel(file);

      if (!employees || employees.length === 0) {
        throw new Error(
          "No employee records found in the uploaded Excel file.",
        );
      }

      /* --------------------------------------------------------
         Send employees to parent
      -------------------------------------------------------- */

      onImport(employees);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to read the Excel file.",
      );
    } finally {
      setLoading(false);

      /* --------------------------------------------------------
         Reset input so same file can be uploaded again
      -------------------------------------------------------- */

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  /* ============================================================
     DRAG EVENTS
  ============================================================ */

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (!loading) {
      setDragging(true);
    }
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    if (loading) {
      return;
    }

    const file = event.dataTransfer.files?.[0];

    void handleFile(file);
  }

  /* ============================================================
     FILE INPUT
  ============================================================ */

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    void handleFile(file);
  }

  /* ============================================================
     OPEN FILE PICKER
  ============================================================ */

  function openFilePicker() {
    if (loading) {
      return;
    }

    inputRef.current?.click();
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        role="button"
        tabIndex={loading ? -1 : 0}
        onKeyDown={(event) => {
          if (!loading && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            openFilePicker();
          }
        }}
        className={`
          group relative overflow-hidden rounded-2xl border-2
          border-dashed p-8 text-center transition-all duration-200
          sm:p-10
          ${
            loading
              ? "cursor-wait border-slate-300 bg-slate-100"
              : dragging
                ? "cursor-pointer border-blue-500 bg-blue-50 shadow-sm"
                : "cursor-pointer border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white hover:shadow-sm"
          }
        `}
      >
        {/* ======================================================
            BACKGROUND DECORATION
        ====================================================== */}

        <div
          className={`
            pointer-events-none absolute -right-12 -top-12
            h-32 w-32 rounded-full blur-3xl transition
            ${dragging ? "bg-blue-200 opacity-80" : "bg-slate-200 opacity-40"}
          `}
        />

        {/* ======================================================
            ICON
        ====================================================== */}

        <div
          className={`
            relative mx-auto flex h-16 w-16 items-center
            justify-center rounded-2xl transition-all
            ${
              dragging
                ? "bg-blue-100 text-blue-600"
                : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200"
            }
          `}
        >
          {loading ? (
            <svg
              className="h-7 w-7 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2.5"
                className="opacity-25"
              />

              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />

              <path d="M14 2v6h6" />

              <path d="M8 13h2" />
              <path d="M8 17h8" />
              <path d="M14 13h2" />

              <path d="M12 10v7" />
              <path d="m9.5 12.5 2.5-2.5 2.5 2.5" />
            </svg>
          )}
        </div>

        {/* ======================================================
            TITLE
        ====================================================== */}

        <h3 className="relative mt-5 text-lg font-bold text-slate-900">
          {loading
            ? "Reading Excel file..."
            : dragging
              ? "Drop your Excel file here"
              : "Upload Salary Excel"}
        </h3>

        {/* ======================================================
            DESCRIPTION
        ====================================================== */}

        <p className="relative mt-2 text-sm text-slate-500">
          {loading
            ? "Please wait while employee records are being imported."
            : "Drag & drop your file here, or click to browse."}
        </p>

        {/* ======================================================
            SUPPORTED FORMATS
        ====================================================== */}

        {!loading && (
          <div className="relative mt-5 flex items-center justify-center gap-2">
            <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
              .XLSX
            </span>

            <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
              .XLS
            </span>
          </div>
        )}

        {/* ======================================================
            HIDDEN INPUT
        ====================================================== */}

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          hidden
          disabled={loading}
          onChange={handleInputChange}
        />
      </div>

      {/* ========================================================
          ERROR
      ======================================================== */}

      {error && (
        <div className="mt-3 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>

          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
