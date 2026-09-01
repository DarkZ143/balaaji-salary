import { EmployeeSalary, SalaryCalculation } from "@/types/salary";

export function calculateSalary(employee: EmployeeSalary): SalaryCalculation {
  const basicSalary = Number(employee.basicSalary || 0);
  const daysInMonth = Number(employee.daysInMonth || 0);
  const presentDays = Number(employee.presentDays || 0);
  const lateDays = Number(employee.lateDays || 0);

  let error: string | undefined;

  if (!employee.name?.trim()) {
    error = "Employee name is required.";
  } else if (!Number.isFinite(basicSalary) || basicSalary < 0) {
    error = "Invalid basic salary.";
  } else if (!Number.isFinite(daysInMonth) || daysInMonth <= 0) {
    error = "Invalid days in month.";
  } else if (
    !Number.isFinite(presentDays) ||
    presentDays < 0 ||
    presentDays > daysInMonth
  ) {
    error = "Present days cannot be greater than days in month.";
  } else if (
    !Number.isFinite(lateDays) ||
    lateDays < 0 ||
    lateDays > presentDays
  ) {
    error = "Late days cannot be greater than present days.";
  }

  const perDaySalary = daysInMonth > 0 ? basicSalary / daysInMonth : 0;

  const earnedSalary = perDaySalary * presentDays;

  const lateDeduction = perDaySalary / 2 * lateDays;

  const toBePaid = earnedSalary - lateDeduction;

  return {
    ...employee,

    basicSalary,
    daysInMonth,
    presentDays,
    lateDays,

    perDaySalary,
    earnedSalary,
    lateDeduction,
    toBePaid,

    ...(error ? { error } : {}),
  };
}
