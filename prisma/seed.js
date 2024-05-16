const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const saltRounds = 10;

const endpoints = [
  "rolePermission",
  "transaction",
  "permission",
  "dashboard",
  "user",
  "role",
  "designation",
  "account",
  "setting",
  "email",
  "attendance",
  "department",
  "education",
  "payroll",
  "leaveApplication",
  "shift",
  "employmentStatus",
  "announcement",
  "salaryHistory",
  "designationHistory",
  "award",
  "awardHistory",
  "file",
  "leavePolicy",
  "weeklyHoliday",
  "publicHoliday",
  "project",
  "milestone",
  "task",
  "projectTeam",
  "taskDependency",
  "taskStatus",
  "taskTime",
  "priority",
  "assignedTask",
];

const permissionTypes = ["create", "readAll", "readSingle", "update", "delete"];

// create permissions for each endpoint by combining permission type and endpoint name
const permissions = endpoints.reduce((acc, cur) => {
  const permission = permissionTypes.map((type) => {
    return `${type}-${cur}`;
  });
  return [...acc, ...permission];
}, []);

const roles = ["admin", "staff"];

const account = [
  { name: "Asset", type: "Asset" },
  { name: "Liability", type: "Liability" },
  { name: "Capital", type: "Owner's Equity" },
  { name: "Withdrawal", type: "Owner's Equity" },
  { name: "Revenue", type: "Owner's Equity" },
  { name: "Expense", type: "Owner's Equity" },
];

const subAccount = [
  { account_id: 1, name: "Cash" }, //1
  { account_id: 1, name: "Bank" }, //2
  { account_id: 1, name: "Inventory" }, //3
  { account_id: 1, name: "Accounts Receivable" }, //4
  { account_id: 2, name: "Accounts Payable" }, //5
  { account_id: 3, name: "Capital" }, //6
  { account_id: 4, name: "Withdrawal" }, //7
  { account_id: 5, name: "Sales" }, //8
  { account_id: 6, name: "Cost of Sales" }, //9
  { account_id: 6, name: "Salary" }, //10
  { account_id: 6, name: "Rent" }, //11
  { account_id: 6, name: "Utilities" }, //12
  { account_id: 5, name: "Discount Earned" }, //13
  { account_id: 6, name: "Discount Given" }, //14
];

const settings = {
  company_name: "Sai i lama",
  address: "Etoa Meki",
  phone: "693972665",
  email: "contact@sai-i-lama.gmail",
  website: "My Website",
  footer: "©2023 sai i lama",
  tag_line: "votre sante c'est notre interest",
};

const department = [
  { name: "IT" },
  { name: "HR" },
  { name: "Sales" },
  { name: "Marketing" },
  { name: "Finance" },
  { name: "Operations" },
  { name: "Customer Support" },
];

const designation = [
  { name: "CEO" },
  { name: "CTO" },
  { name: "CFO" },
  { name: "COO" },
  { name: "HR Manager" },
];

const employmentStatus = [
  { name: "Interne", colourValue: "#00FF00", description: "Intern" },
  { name: "Permanent", colourValue: "#FF0000", description: "Permenent" },
  { name: "Stagiaire", colourValue: "#FFFF00", description: "Stagiaire" },
  { name: "Terminé", colourValue: "#00FFFF", description: "Terminated" },
];

const shifts = [
  {
    name: "Matin",
    startTime: "1970-01-01T08:00:00.000Z",
    endTime: "1970-01-01T16:00:00.000Z",
    workHour: 8,
  },
  {
    name: "Soir",
    startTime: "1970-01-01T16:00:00.000Z",
    endTime: "1970-01-01T00:00:00.000Z",
    workHour: 8,
  },
  {
    name: "Nuit",
    startTime: "1970-01-01T00:00:00.000Z",
    endTime: "1970-01-01T08:00:00.000Z",
    workHour: 8,
  },
];

const leavePolicy = [
  {
    name: "Policy 8-12",
    paidLeaveCount: 8,
    unpaidLeaveCount: 12,
  },
  {
    name: "Policy 12-15",
    paidLeaveCount: 12,
    unpaidLeaveCount: 15,
  },
  {
    name: "Policy 15-15",
    paidLeaveCount: 15,
    unpaidLeaveCount: 15,
  },
];

const weeklyHoliday = [
  {
    name: "samedi-jeudi",
    startDay: "Samedi",
    endDay: "Jeudi",
  },
  {
    name: "Dimanche-Vendredi",
    startDay: "Dimanche",
    endDay: "Vendredi",
  },
];

const date = new Date();

const publicHoliday = [
  {
    name: "Nouvel an",
    date: date,
  },
  {
    name: "Fête national",
    date: new Date(date.getTime() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    name: "Noël",
    date: new Date(date.getTime() + 9 * 24 * 60 * 60 * 1000),
  },
];

const award = [
  {
    name: "L'employé du Mois",
    description: "Employé qui a bien performé au cours du mois",
  },
  {
    name: "L'employé de l'année",
    description: "Employé qui a bien performé au cours de l'année",
  },
];

const priority = [
  {
    name: "Faible",
  },
  {
    name: "Moyen",
  },
  {
    name: "Haut",
  },
];

async function main() {
  await prisma.department.createMany({
    data: department,
  });
  await prisma.designation.createMany({
    data: designation,
  });
  await prisma.employmentStatus.createMany({
    data: employmentStatus,
  });
  await prisma.shift.createMany({
    data: shifts,
  });

  await prisma.leavePolicy.createMany({
    data: leavePolicy,
  });

  await prisma.weeklyHoliday.createMany({
    data: weeklyHoliday,
  });

  await prisma.publicHoliday.createMany({
    data: publicHoliday,
  });

  await prisma.award.createMany({
    data: award,
  });

  await prisma.priority.createMany({
    data: priority,
  });

  await prisma.role.createMany({
    data: roles.map((role) => {
      return {
        name: role,
      };
    }),
  });
  await prisma.permission.createMany({
    data: permissions.map((permission) => {
      return {
        name: permission,
      };
    }),
  });
  for (let i = 1; i <= permissions.length; i++) {
    await prisma.rolePermission.create({
      data: {
        role: {
          connect: {
            id: 1,
          },
        },
        permission: {
          connect: {
            id: i,
          },
        },
      },
    });
  }
  const adminHash = await bcrypt.hash("admin", saltRounds);
  await prisma.user.create({
    data: {
      firstName: "Pascal",
      lastName: "Blaise",
      userName: "admin",
      password: adminHash,
      employmentStatusId: 1,
      departmentId: 1,
      roleId: 1,
      shiftId: 1,
      leavePolicyId: 1,
      weeklyHolidayId: 1,
    },
  });

  await prisma.account.createMany({
    data: account,
  });
  await prisma.subAccount.createMany({
    data: subAccount,
  });
  await prisma.appSetting.create({
    data: settings,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    process.exit(1);
  });
