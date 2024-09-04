const prisma = require("../../utils/prisma");
// const { produceUserEvent } = require("../../utils/kafka");
// const { encrypt } = require("../../utils/encryption");
require("dotenv").config();
const axios = require("axios");
const moment = require("moment");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const login = async (req, res) => {
  try {
    const allUser = await prisma.user.findMany();
    const user = allUser.find(
      (u) =>
        u.email === req.body.email &&
        bcrypt.compareSync(req.body.password, u.password)
    );
    // get permission from user roles
    const permissions = await prisma.role.findUnique({
      where: {
        id: user.roleId
      },
      include: {
        rolePermission: {
          include: {
            permission: true
          }
        }
      }
    });
    // store all permissions name to an array
    const permissionNames = permissions.rolePermission.map(
      (rp) => rp.permission.name
    );

    if (user) {
      const token = jwt.sign(
        { sub: user.id, permissions: permissionNames },
        secret,
        {
          expiresIn: "24h"
        }
      );
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json({
        ...userWithoutPassword,
        token
      });
    }
    return res
      .status(400)
      .json({ message: "userName or password is incorrect" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const register = async (req, res) => {
  try {
    const join_date = new Date(req.body.joinDate);
    const leave_date = new Date(req.body.leaveDate);

    const hash = await bcrypt.hash(req.body.password, saltRounds);
    const createUser = await prisma.user.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        password: hash,
        email: req.body.email,
        phone: req.body.phone,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        country: req.body.country,
        Birthday: req.body.Birthday,
        maritalstatus: req.body.maritalstatus,
        speech: req.body.speech,
        fathername: req.body.fathername,
        mothername: req.body.mothername,

        emergencyname1: req.body.emergencyname1,
        emergencyforename1: req.body.emergencyforename1,
        emergencyPhone1: req.body.emergencyPhone1,
        emergencylink1: req.body.emergencylink1,

        CnpsId: req.body.CnpsId,
        uppername: req.body.uppername,
        Category: req.body.Category,
        gender: req.body.gender,
        joinDate: join_date,
        leaveDate: leave_date,
        employeeId: req.body.employeeId,
        bloodGroup: req.body.bloodGroup,
        image: req.body.image,
        employmentStatusId: req.body.employmentStatusId,
        departmentId: req.body.departmentId,
        roleId: req.body.roleId,
        designationHistory: {
          create: {
            designationId: req.body.designationId,
            startDate: new Date(req.body.designationStartDate),
            endDate: new Date(req.body.designationEndDate),
            comment: req.body.designationComment
          }
        },
        salaryHistory: {
          create: {
            salary: req.body.salary,
            startDate: new Date(req.body.salaryStartDate),
            endDate: new Date(req.body.salaryEndDate),
            comment: req.body.salaryComment
          }
        },
        educations: {
          create: req.body.educations.map((e) => {
            return {
              degree: e.degree,
              institution: e.institution,
              fieldOfStudy: e.fieldOfStudy,
              result: e.result,
              qualification: e.qualification,
              skill: e.skill,
              startDate: new Date(e.studyStartDate),
              endDate: new Date(e.studyEndDate)
            };
          })
        }
      }
    });

    // ###############################################################################################################################################
    // const departmentId = createUser.departmentId; // ou une autre source
    // const UserWithDepartment = await prisma.department.findUnique({
    //   where: {
    //     id: departmentId
    //   }
    // });
    // // Préparer les données pour Stock API
    // const userDataForStock = {
    //   username: req.body.userName,
    //   email: req.body.email,
    //   password: req.body.password,
    //   role: "staff",
    //   phone: req.body.phone,
    //   gender: req.body.gender,
    //   address: req.body.city, // Assurez-vous que ce champ est correct
    //   designation_id: 1,
    //   id_no: req.body.employeeId,
    //   department: UserWithDepartment.name, // Utilisez le nom du département
    //   createdAt: moment(createUser.createdAt).format("YYYY-MM-DD HH:mm:ss.SSS"),
    //   updatedAt: moment(createUser.updatedAt).format("YYYY-MM-DD HH:mm:ss.SSS")
    // };
    // // Envoyer les données à l'API de votre application Laravel
    // const stockApiUrl = "http://localhost:5001/v1/user/register";
    // console.log("Sending data to Stock API:", userDataForStock);
    // try {
    //   const response1 = await axios.post(stockApiUrl, userDataForStock);
    //   console.log("Received response from Stock API:", response1.data);
    // } catch (error) {
    //   console.log("Error sending data to Stock API:", error);
    // }

    // #######################################################################################################################################################

    // ###############################################################################################################################################
    // données a envoyer a l'application de laravel
    const userDataForLaravel = {
      name: req.body.userName,
      email: req.body.email,
      password: req.body.password,
      role_id: 2, // Mettez le rôle souhaité ici
      phone: req.body.phone,
      gender: req.body.gender,
      address: req.body.street,
      appChoice: "true",
      source: "HRM",
      created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
    };
    // // Envoyer les données à l'API de votre application Laravel
    const laravelApiUrl = "http://127.0.0.1:8000/api/users/register";
    console.log("Sending data to Laravel API:", userDataForLaravel);
    const response = await axios.post(laravelApiUrl, userDataForLaravel);
    console.log("Received response from Laravel API:", response.data);
    // #######################################################################################################################################################

    // Encrypt the plain text password before sending it to the message broker
    // const userWithEncryptedPassword = {
    //   ...createUser,
    //   password: encrypt(req.body.password),
    // };
    // await produceUserEvent('create', userWithEncryptedPassword);

    const { password, ...userWithoutPassword } = createUser;
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error(
      "Error in register function:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json(error.response ? error.response.data : error.message);
  }
};

const getAllUser = async (req, res) => {
  if (req.query.query === "all") {
    try {
      const allUser = await prisma.user.findMany({
        include: {
          designationHistory: {
            include: {
              designation: true
            }
          },
          salaryHistory: true,
          educations: true,
          employmentStatus: true,
          department: true,
          role: true,
          awardHistory: true
        }
      });
      return res.status(200).json(
        allUser
          .map((u) => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword;
          })
          .sort((a, b) => a.id - b.id)
      );
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  } else if (req.query.status === "false") {
    try {
      const allUser = await prisma.user.findMany({
        where: {
          status: false
        },
        include: {
          designationHistory: {
            include: {
              designation: true
            }
          },
          salaryHistory: true,
          educations: true,
          employmentStatus: true,
          department: true,
          role: true,
          awardHistory: true
        }
      });
      return res.status(200).json(
        allUser
          .map((u) => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword;
          })
          .sort((a, b) => a.id - b.id)
      );
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  } else {
    try {
      const allUser = await prisma.user.findMany({
        where: {
          status: true
        },
        include: {
          designationHistory: {
            include: {
              designation: true
            }
          },
          salaryHistory: true,
          educations: true,
          employmentStatus: true,
          department: true,
          role: true,
          awardHistory: true
        }
      });
      return res.status(200).json(
        allUser
          .map((u) => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword;
          })
          .sort((a, b) => a.id - b.id)
      );
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

const getSingleUser = async (req, res) => {
  const singleUser = await prisma.user.findUnique({
    where: {
      id: Number(req.params.id)
    },
    include: {
      designationHistory: {
        include: {
          designation: true
        }
      },
      salaryHistory: true,
      educations: true,
      employmentStatus: true,
      department: true,
      role: true,
      awardHistory: {
        include: {
          award: true
        }
      },
      leaveApplication: {
        orderBy: {
          id: "desc"
        },
        take: 5
      },
      attendance: {
        orderBy: {
          id: "desc"
        },
        take: 1
      }
    }
  });

  // calculate paid and unpaid leave days for the user for the current year
  const leaveDays = await prisma.leaveApplication.findMany({
    where: {
      userId: Number(req.params.id),
      status: "ACCEPTED",
      acceptLeaveFrom: {
        gte: new Date(new Date().getFullYear(), 0, 1)
      },
      acceptLeaveTo: {
        lte: new Date(new Date().getFullYear(), 11, 31)
      }
    }
  });
  const paidLeaveDays = leaveDays
    .filter((l) => l.leaveType === "PAID")
    .reduce((acc, item) => {
      return acc + item.leaveDuration;
    }, 0);
  const unpaidLeaveDays = leaveDays
    .filter((l) => l.leaveType === "UNPAID")
    .reduce((acc, item) => {
      return acc + item.leaveDuration;
    }, 0);

  singleUser.paidLeaveDays = paidLeaveDays;
  singleUser.unpaidLeaveDays = unpaidLeaveDays;
  const id = parseInt(req.params.id);
  // only allow admins and owner to access other user records. use truth table to understand the logic
  if (
    id !== req.auth.sub &&
    !req.auth.permissions.includes("readSingle-user")
  ) {
    return res
      .status(401)
      .json({ message: "Unauthorized. You are not an admin" });
  }

  if (!singleUser) return;
  const { password, ...userWithoutPassword } = singleUser;
  return res.status(200).json(userWithoutPassword);
};

const updateSingleUser = async (req, res) => {
  const id = parseInt(req.params.id);
  // only allow admins and owner to edit other user records. use truth table to understand the logic
  if (id !== req.auth.sub && !req.auth.permissions.includes("update-user")) {
    return res.status(401).json({
      message: "Unauthorized. You can only edit your own record."
    });
  }
  try {
    // admin can change all fields
    if (req.auth.permissions.includes("update-user")) {
      const hash = await bcrypt.hash(req.body.password, saltRounds);
      const join_date = new Date(req.body.joinDate);
      const leave_date = new Date(req.body.leaveDate);
      const updateUser = await prisma.user.update({
        where: {
          id: Number(req.params.id)
        },
        data: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          userName: req.body.userName,
          password: hash,
          email: req.body.email,
          phone: req.body.phone,
          street: req.body.street,
          city: req.body.city,
          state: req.body.state,
          zipCode: req.body.zipCode,
          country: req.body.country,
          Birthday: req.body.Birthday,
          maritalstatus: req.body.maritalstatus,
          speech: req.body.speech,
          fathername: req.body.fathername,
          mothername: req.body.mothername,

          emergencyname1: req.body.emergencyname1,
          emergencyforename1: req.body.emergencyforename1,
          emergencyPhone1: req.body.emergencyPhone1,
          emergencylink1: req.body.emergencylink1,

          CnpsId: req.body.CnpsId,
          uppername: req.body.uppername,
          Category: req.body.Category,
          gender: req.body.gender,
          joinDate: join_date,
          leaveDate: leave_date,
          employeeId: req.body.employeeId,
          bloodGroup: req.body.bloodGroup,
          image: req.body.image,
          employmentStatusId: req.body.employmentStatusId,
          departmentId: req.body.departmentId,
          roleId: req.body.roleId
        }
      });
      // Encrypt the plain text password before sending it to the message broker
      // const userWithEncryptedPassword = {
      //   ...updateUser,
      //   password: encrypt(req.body.password),
      // };

      // await produceUserEvent('update', userWithEncryptedPassword);
      const { password, ...userWithoutPassword } = updateUser;
      return res.status(200).json(userWithoutPassword);
    } else {
      // owner can change only password
      const hash = await bcrypt.hash(req.body.password, saltRounds);
      const updateUser = await prisma.user.update({
        where: {
          id: Number(req.params.id)
        },
        data: {
          password: hash
        }
      });
      const { password, ...userWithoutPassword } = updateUser;
      return res.status(200).json(userWithoutPassword);
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};

const deleteSingleUser = async (req, res) => {
  // const id = parseInt(req.params.id);
  // only allow admins to delete other user records
  if (!req.auth.permissions.includes("delete-user")) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Only admin can delete." });
  }
  try {
    const deleteUser = await prisma.user.update({
      where: {
        id: Number(req.params.id)
      },
      data: {
        status: req.body.status
      }
    });
    // await produceUserEvent('delete', deleteUser);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  register,
  getAllUser,
  getSingleUser,
  updateSingleUser,
  deleteSingleUser
};
