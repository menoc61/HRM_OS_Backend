const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getHolidaysInMonth = require("./getHolidaysInMonth");

const calculatePayslip = async (salaryMonth, salaryYear) => {
  // get all employee salary and show in payroll
  const allEmployee = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      salaryHistory: {
        orderBy: {
          id: "desc"
        },
        select: {
          id: true,
          salary: true
        }
      },
      leaveApplication: {
        where: {
          status: "ACCEPTED",
          acceptLeaveFrom: {
            gte: new Date(`${salaryYear}-${salaryMonth}-01`)
          },
          acceptLeaveTo: {
            lte: new Date(`${salaryYear}-${parseInt(salaryMonth) + 1}-01`)
          }
        }
      }
    }
  });

  // calculate work days in a month based on publicHoliday table
  const publicHoliday = await prisma.publicHoliday.count({
    where: {
      date: {
        gte: new Date(`${salaryYear}-${salaryMonth}-01`),
        lte: new Date(`${salaryYear}-${parseInt(salaryMonth) + 1}-01`)
      }
    }
  });

  // get only the first salary of each employee from salary history
  const allEmployeeSalary = allEmployee.map((item) => {
    const salary = item.salaryHistory[0]?.salary || 0;
    const paidLeave = item.leaveApplication
      .filter((item) => item.leaveType === "PAID")
      .reduce((acc, item) => {
        return acc + item.leaveDuration;
      }, 0);
    const unpaidLeave = item.leaveApplication
      .filter((item) => item.leaveType === "UNPAID")
      .reduce((acc, item) => {
        return acc + item.leaveDuration;
      }, 0);
    const monthlyHoliday = getHolidaysInMonth(salaryYear, salaryMonth);
    return {
      id: item.id,
      firstName: item.firstName,
      lastName: item.lastName,
      salaryMonth: parseInt(salaryMonth),
      salaryYear: parseInt(salaryYear),
      salary: salary,
      paidLeave: paidLeave,
      unpaidLeave: unpaidLeave,
      monthlyHoliday: monthlyHoliday,
      publicHoliday: publicHoliday,
      bonus: 0,
      bonusComment: "",
      deduction: 0,
      deductionComment: "",
      totalPayable: 0
    };
  });

  // add working hours to the allEmployeeSalary array
  allEmployeeSalary.forEach((item) => {
    item.salaryPayable = parseFloat(item.salary.toFixed(2));
    item.totalPayable = parseFloat(
      (item.salaryPayable + item.bonus - item.deduction).toFixed(2)
    );
  });

  // sort the array by id
  allEmployeeSalary.sort((a, b) => a.id - b.id);

  return allEmployeeSalary;
};

module.exports = calculatePayslip;
