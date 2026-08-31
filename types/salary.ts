export interface EmployeeSalary {
  id: string;
  name: string;
  basicSalary: number;
  daysInMonth: number;
  presentDays: number;
  lateDays: number;
}

export interface SalaryCalculation extends EmployeeSalary {
  perDaySalary: number;
  earnedSalary: number;
  lateDeduction: number;
  toBePaid: number;
  error?: string;
}