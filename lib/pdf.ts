import jsPDF from "jspdf";
import { SalaryCalculation } from "@/types/salary";

const COMPANY_NAME = "Shri Balaaji Advertising and Marketing";
const COMPANY_SUBTITLE = "Employee Salary & Payroll Management";

const NAVY = [15, 23, 42] as const;
const NAVY_LIGHT = [30, 41, 59] as const;
const GOLD = [202, 148, 20] as const;

const TEXT = [15, 23, 42] as const;
const MUTED = [100, 116, 139] as const;
const BORDER = [226, 232, 240] as const;
const LIGHT_BG = [248, 250, 252] as const;

const RED = [220, 38, 38] as const;
const GREEN = [5, 150, 105] as const;

type RGB = readonly [number, number, number];

/* ============================================================
   FORMATTERS
============================================================ */

function formatMoney(value: number): string {
  return `Rs. ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)}`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/* ============================================================
   PDF COLOR HELPERS
============================================================ */

function setFill(doc: jsPDF, color: RGB) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setText(doc: jsPDF, color: RGB) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setDraw(doc: jsPDF, color: RGB) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

/* ============================================================
   ROUNDED RECT
============================================================ */

function roundedRect(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 3,
  fillColor?: RGB,
  drawColor?: RGB,
) {
  if (fillColor) {
    setFill(doc, fillColor);
  }

  if (drawColor) {
    setDraw(doc, drawColor);
  }

  doc.roundedRect(
    x,
    y,
    width,
    height,
    radius,
    radius,
    fillColor && drawColor ? "FD" : fillColor ? "F" : drawColor ? "S" : "S",
  );
}

/* ============================================================
   LOAD LOGO
============================================================ */

/**
 * Loads /public/logo.png and converts it into a data URL.
 */
async function loadLogo(): Promise<string | null> {
  try {
    const response = await fetch("/logo.png", {
      cache: "force-cache",
    });

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();

    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          resolve(null);
        }
      };

      reader.onerror = () => resolve(null);

      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/* ============================================================
   DRAW LOGO
============================================================ */

function drawLogo(
  doc: jsPDF,
  logo: string | null,
  x: number,
  y: number,
  size: number,
) {
  // Logo container
  setFill(doc, [255, 255, 255]);
  setDraw(doc, BORDER);

  doc.roundedRect(x, y, size, size, 3, 3, "FD");

  if (logo) {
    try {
      doc.addImage(
        logo,
        "PNG",
        x + 2.5,
        y + 2.5,
        size - 5,
        size - 5,
        undefined,
        "FAST",
      );

      return;
    } catch {
      // Fallback logo below
    }
  }

  // Fallback logo mark
  setFill(doc, NAVY);

  doc.roundedRect(x + 7, y + 7, size - 14, size - 14, 2, 2, "F");

  setDraw(doc, GOLD);

  doc.setLineWidth(1.4);

  doc.line(x + 11, y + size - 12, x + size / 2, y + size / 2 + 1);

  doc.line(x + size / 2, y + size / 2 + 1, x + size - 10, y + 11);

  doc.line(x + size - 10, y + 11, x + size - 16, y + 12);

  doc.line(x + size - 10, y + 11, x + size - 11, y + 17);
}

/* ============================================================
   HEADER
============================================================ */

function drawHeader(doc: jsPDF, logo: string | null, employeesCount: number) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Main navy header
  setFill(doc, NAVY);

  doc.rect(0, 0, pageWidth, 42, "F");

  // Gold accent
  setFill(doc, GOLD);

  doc.rect(0, 40.5, pageWidth, 1.5, "F");

  // Logo
  drawLogo(doc, logo, 14, 7, 28);

  // Company name
  setText(doc, [255, 255, 255]);

  doc.setFont("helvetica", "bold");

  doc.setFontSize(13);

  doc.text(COMPANY_NAME, 48, 16);

  // Company subtitle
  setText(doc, [203, 213, 225]);

  doc.setFont("helvetica", "normal");

  doc.setFontSize(7.5);

  doc.text(COMPANY_SUBTITLE, 48, 23);

  // Vertical divider
  setDraw(doc, [71, 85, 105]);

  doc.setLineWidth(0.4);

  doc.line(48, 27, 48, 34);

  // Report title
  setText(doc, [255, 255, 255]);

  doc.setFont("helvetica", "bold");

  doc.setFontSize(8.5);

  doc.text("SALARY REPORT", 48, 32);

  // Right side
  doc.setFontSize(7);

  setText(doc, [148, 163, 184]);

  doc.text(`Generated on ${formatDate(new Date())}`, pageWidth - 14, 15, {
    align: "right",
  });

  setText(doc, [255, 255, 255]);

  doc.setFont("helvetica", "bold");

  doc.setFontSize(9);

  doc.text(
    `${employeesCount} ${employeesCount === 1 ? "Employee" : "Employees"}`,
    pageWidth - 14,
    25,
    {
      align: "right",
    },
  );
}

/* ============================================================
   SUMMARY CARDS
============================================================ */

function drawSummaryCards(
  doc: jsPDF,
  employees: SalaryCalculation[],
  y: number,
) {
  const pageWidth = doc.internal.pageSize.getWidth();

  const totalEmployees = employees.length;

  const totalEarned = employees.reduce(
    (sum, employee) => sum + Number(employee.earnedSalary || 0),
    0,
  );

  const totalLateDeduction = employees.reduce(
    (sum, employee) => sum + Number(employee.lateDeduction || 0),
    0,
  );

  const totalPayable = employees.reduce(
    (sum, employee) => sum + Number(employee.toBePaid || 0),
    0,
  );

  const margin = 14;
  const gap = 5;

  const cardWidth = (pageWidth - margin * 2 - gap * 2) / 3;

  const cardHeight = 27;

  const cards = [
    {
      title: "TOTAL EMPLOYEES",
      value: formatNumber(totalEmployees),
      subtitle: "Employees in this report",
      valueColor: TEXT,
    },
    {
      title: "TOTAL EARNED",
      value: formatMoney(totalEarned),
      subtitle: "Gross earned salary",
      valueColor: TEXT,
    },
    {
      title: "TOTAL LATE DEDUCTION",
      value: formatMoney(totalLateDeduction),
      subtitle: "Total late deductions",
      valueColor: RED,
    },
  ];

  cards.forEach((card, index) => {
    const x = margin + index * (cardWidth + gap);

    setFill(doc, [255, 255, 255]);

    setDraw(doc, BORDER);

    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, "FD");

    // Card title
    setText(doc, MUTED);

    doc.setFont("helvetica", "bold");

    doc.setFontSize(6.5);

    doc.text(card.title, x + 5, y + 7);

    // Card value
    setText(doc, card.valueColor);

    doc.setFont("helvetica", "bold");

    doc.setFontSize(12);

    doc.text(card.value, x + 5, y + 16);

    // Subtitle
    setText(doc, MUTED);

    doc.setFont("helvetica", "normal");

    doc.setFontSize(5.8);

    doc.text(card.subtitle, x + 5, y + 22);
  });

  // ==========================================================
  // TOTAL PAYABLE BANNER
  // ==========================================================

  const payableY = y + cardHeight + 7;

  setFill(doc, NAVY);

  doc.roundedRect(margin, payableY, pageWidth - margin * 2, 25, 4, 4, "F");

  // Gold accent
  setFill(doc, GOLD);

  doc.roundedRect(margin, payableY, 3, 25, 1.5, 1.5, "F");

  // Label
  setText(doc, [203, 213, 225]);

  doc.setFont("helvetica", "bold");

  doc.setFontSize(7);

  doc.text("TOTAL TO BE PAID", margin + 9, payableY + 10);

  // Amount
  setText(doc, [255, 255, 255]);

  doc.setFont("helvetica", "bold");

  doc.setFontSize(15);

  doc.text(formatMoney(totalPayable), pageWidth - margin - 8, payableY + 15, {
    align: "right",
  });

  return payableY + 25;
}

/* ============================================================
   TABLE HEADER
============================================================ */

function drawTableHeader(doc: jsPDF, y: number) {
  const margin = 14;

  const pageWidth = doc.internal.pageSize.getWidth();

  const tableWidth = pageWidth - margin * 2;

  const rowHeight = 9;

  setFill(doc, NAVY);

  doc.roundedRect(margin, y, tableWidth, rowHeight, 2, 2, "F");

  setText(doc, [255, 255, 255]);

  doc.setFont("helvetica", "bold");

  doc.setFontSize(5.8);

  const columns = [
    {
      title: "#",
      x: margin + 5,
    },
    {
      title: "EMPLOYEE",
      x: margin + 18,
    },
    {
      title: "BASIC",
      x: margin + 56,
    },
    {
      title: "DAYS",
      x: margin + 76,
    },
    {
      title: "PRESENT",
      x: margin + 94,
    },
    {
      title: "LATE",
      x: margin + 113,
    },
    {
      title: "PER DAY",
      x: margin + 130,
    },
    {
      title: "EARNED",
      x: margin + 151,
    },
    {
      title: "LATE DED.",
      x: margin + 175,
    },
    {
      title: "TO BE PAID",
      x: margin + 199,
    },
    {
      title: "STATUS",
      x: pageWidth - margin - 13,
    },
  ];

  columns.forEach((column, index) => {
    doc.text(
      column.title,
      column.x,
      y + 6,
      index === columns.length - 1
        ? {
            align: "right",
          }
        : undefined,
    );
  });

  return y + rowHeight;
}

/* ============================================================
   EMPLOYEE ROW
============================================================ */

function drawEmployeeRow(
  doc: jsPDF,
  employee: SalaryCalculation,
  index: number,
  y: number,
) {
  const margin = 14;

  const pageWidth = doc.internal.pageSize.getWidth();

  const tableWidth = pageWidth - margin * 2;

  const rowHeight = 11;

  // Alternate row background
  setFill(doc, index % 2 === 0 ? [255, 255, 255] : LIGHT_BG);

  setDraw(doc, BORDER);

  doc.rect(margin, y, tableWidth, rowHeight, "FD");

  // Vertical separators
  const separators = [
    margin + 11,
    margin + 49,
    margin + 70,
    margin + 87,
    margin + 106,
    margin + 123,
    margin + 145,
    margin + 169,
    margin + 191,
    margin + 216,
  ];

  setDraw(doc, BORDER);

  doc.setLineWidth(0.2);

  separators.forEach((x) => {
    doc.line(x, y, x, y + rowHeight);
  });

  const baseline = y + 7.2;

  doc.setFontSize(5.8);

  doc.setFont("helvetica", "normal");

  // ==========================================================
  // #
  // ==========================================================

  setText(doc, MUTED);

  doc.text(String(index + 1), margin + 5.5, baseline, {
    align: "center",
  });

  // ==========================================================
  // EMPLOYEE NAME
  // ==========================================================

  setText(doc, TEXT);

  doc.setFont("helvetica", "bold");

  const employeeName = String(employee.name || "-");

  const shortName =
    employeeName.length > 24
      ? `${employeeName.substring(0, 23)}…`
      : employeeName;

  doc.text(shortName, margin + 13, baseline);

  doc.setFont("helvetica", "normal");

  // ==========================================================
  // BASIC
  // ==========================================================

  doc.text(
    formatMoney(Number(employee.basicSalary || 0)),
    margin + 66,
    baseline,
    {
      align: "right",
    },
  );

  // ==========================================================
  // DAYS
  // ==========================================================

  doc.text(
    formatNumber(Number(employee.daysInMonth || 0)),
    margin + 82,
    baseline,
    {
      align: "right",
    },
  );

  // ==========================================================
  // PRESENT
  // ==========================================================

  doc.text(
    formatNumber(Number(employee.presentDays || 0)),
    margin + 101,
    baseline,
    {
      align: "right",
    },
  );

  // ==========================================================
  // LATE
  // ==========================================================

  doc.text(
    formatNumber(Number(employee.lateDays || 0)),
    margin + 118,
    baseline,
    {
      align: "right",
    },
  );

  // ==========================================================
  // PER DAY
  // ==========================================================

  doc.text(
    formatMoney(Number(employee.perDaySalary || 0)),
    margin + 141,
    baseline,
    {
      align: "right",
    },
  );

  // ==========================================================
  // EARNED
  // ==========================================================

  doc.text(
    formatMoney(Number(employee.earnedSalary || 0)),
    margin + 165,
    baseline,
    {
      align: "right",
    },
  );

  // ==========================================================
  // LATE DEDUCTION
  // ==========================================================

  setText(doc, RED);

  doc.text(
    formatMoney(Number(employee.lateDeduction || 0)),
    margin + 187,
    baseline,
    {
      align: "right",
    },
  );

  // ==========================================================
  // TO BE PAID
  // ==========================================================

  setText(doc, TEXT);

  doc.setFont("helvetica", "bold");

  doc.text(
    formatMoney(Number(employee.toBePaid || 0)),
    margin + 211,
    baseline,
    {
      align: "right",
    },
  );

  // ==========================================================
  // STATUS
  // ==========================================================

  const hasError = Boolean(employee.error);

  if (hasError) {
    setText(doc, RED);
  } else {
    setText(doc, GREEN);
  }

  doc.setFont("helvetica", "bold");

  doc.text(hasError ? "Error" : "Ready", pageWidth - margin - 5, baseline, {
    align: "right",
  });

  return y + rowHeight;
}

/* ============================================================
   FOOTER
============================================================ */

function drawFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();

  const pageHeight = doc.internal.pageSize.getHeight();

  setDraw(doc, BORDER);

  doc.setLineWidth(0.4);

  doc.line(14, pageHeight - 13, pageWidth - 14, pageHeight - 13);

  setText(doc, MUTED);

  doc.setFont("helvetica", "normal");

  doc.setFontSize(5.8);

  doc.text(COMPANY_NAME, 14, pageHeight - 7);

  doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - 14, pageHeight - 7, {
    align: "right",
  });
}

/* ============================================================
   BUILD PDF
   Common generator used by Preview + Download
============================================================ */

async function buildSalaryPDF(
  employees: SalaryCalculation[],
): Promise<jsPDF | null> {
  if (!employees.length) {
    return null;
  }

  const logo = await loadLogo();

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageHeight = doc.internal.pageSize.getHeight();

  // ==========================================================
  // FIRST PAGE
  // ==========================================================

  drawHeader(doc, logo, employees.length);

  let currentY = 50;

  currentY = drawSummaryCards(doc, employees, currentY);

  currentY += 12;

  currentY = drawTableHeader(doc, currentY);

  // ==========================================================
  // EMPLOYEE ROWS
  // ==========================================================

  const bottomLimit = pageHeight - 20;

  const rowHeight = 11;

  employees.forEach((employee, index) => {
    // ======================================================
    // NEW PAGE
    // ======================================================

    if (currentY + rowHeight > bottomLimit) {
      drawFooter(doc);

      doc.addPage();

      drawHeader(doc, logo, employees.length);

      currentY = 50;

      // Continued label
      setText(doc, MUTED);

      doc.setFont("helvetica", "bold");

      doc.setFontSize(6.5);

      doc.text("SALARY DETAILS — CONTINUED", 14, currentY);

      currentY += 5;

      currentY = drawTableHeader(doc, currentY);
    }

    currentY = drawEmployeeRow(doc, employee, index, currentY);
  });

  // ==========================================================
  // FINAL FOOTER
  // ==========================================================

  drawFooter(doc);

  return doc;
}

/* ============================================================
   PREVIEW SALARY PDF
============================================================ */

/**
 * Generate and preview salary PDF.
 *
 * Opens a browser PDF preview in a new tab.
 */
export async function previewSalaryPDF(employees: SalaryCalculation[]) {
  if (!employees.length) {
    return;
  }

  // ==========================================================
  // OPEN WINDOW IMMEDIATELY
  // Prevent popup blockers while logo is loading.
  // ==========================================================

  const previewWindow = window.open("", "_blank");

  if (previewWindow) {
    previewWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Salary Report</title>

          <style>
            body {
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: #0f172a;
              color: white;
              font-family: Arial, sans-serif;
            }

            .loading {
              text-align: center;
            }

            .spinner {
              width: 34px;
              height: 34px;
              margin: 0 auto 14px;
              border: 3px solid rgba(255,255,255,.2);
              border-top-color: #ca9414;
              border-radius: 50%;
              animation: spin .8s linear infinite;
            }

            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }

            p {
              margin: 0;
              color: #cbd5e1;
              font-size: 14px;
            }
          </style>
        </head>

        <body>
          <div class="loading">
            <div class="spinner"></div>
            <p>Preparing Salary Report...</p>
          </div>
        </body>
      </html>
    `);

    previewWindow.document.close();
  }

  // ==========================================================
  // GENERATE PDF
  // ==========================================================

  const doc = await buildSalaryPDF(employees);

  if (!doc) {
    return;
  }

  // ==========================================================
  // PREVIEW
  // ==========================================================

  const pdfBlob = doc.output("blob");

  const pdfUrl = URL.createObjectURL(pdfBlob);

  if (previewWindow && !previewWindow.closed) {
    previewWindow.location.href = pdfUrl;

    // Keep URL alive for browser PDF viewer.
    setTimeout(
      () => {
        URL.revokeObjectURL(pdfUrl);
      },
      10 * 60 * 1000,
    );
  } else {
    // Popup blocked fallback
    window.open(pdfUrl, "_blank");

    setTimeout(
      () => {
        URL.revokeObjectURL(pdfUrl);
      },
      10 * 60 * 1000,
    );
  }
}

/* ============================================================
   DOWNLOAD SALARY PDF
============================================================ */

/**
 * Generate and directly download salary PDF.
 */
export async function downloadSalaryPDF(employees: SalaryCalculation[]) {
  if (!employees.length) {
    return;
  }

  const doc = await buildSalaryPDF(employees);

  if (!doc) {
    return;
  }

  const fileName = `Salary-Report-${new Date().toISOString().slice(0, 10)}.pdf`;

  doc.save(fileName);
}
