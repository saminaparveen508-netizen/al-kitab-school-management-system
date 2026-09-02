import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ==========================================================
// Seed script — creates one login for every role so you can
// test the system immediately after setup.
// Run with: npm run db:seed
// ==========================================================

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // ---- Classes (Pre-Nursery to Class 8) ----
  const classNames = [
    "Pre-Nursery",
    "Nursery",
    "KG",
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
  ];

  for (let i = 0; i < classNames.length; i++) {
    await prisma.class.upsert({
      where: { name: classNames[i] },
      update: {},
      create: { name: classNames[i], order: i },
    });
  }

  const class1 = await prisma.class.findUnique({ where: { name: "Class 1" } });

  // ---- Admin ----
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@alkitabschool.edu.pk" },
    update: {},
    create: {
      name: "School Admin",
      email: "admin@alkitabschool.edu.pk",
      password,
      role: Role.ADMIN,
    },
  });

  await prisma.staff.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      employeeCode: "EMP-0001",
      staffType: "NON_TEACHING",
      designation: "Principal",
    },
  });

  // ---- Teacher ----
  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@alkitabschool.edu.pk" },
    update: {},
    create: {
      name: "Ayesha Bibi",
      email: "teacher@alkitabschool.edu.pk",
      password,
      role: Role.TEACHER,
    },
  });

  const teacherStaff = await prisma.staff.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      employeeCode: "EMP-0002",
      staffType: "TEACHING",
      designation: "Class Teacher",
    },
  });

  let section = null;
  if (class1) {
    section = await prisma.section.upsert({
      where: { classId_name: { classId: class1.id, name: "A" } },
      update: {},
      create: {
        classId: class1.id,
        name: "A",
        classTeacherId: teacherStaff.id,
      },
    });
  }

  // ---- Parent ----
  const parentUser = await prisma.user.upsert({
    where: { email: "parent@alkitabschool.edu.pk" },
    update: {},
    create: {
      name: "Muhammad Aslam",
      email: "parent@alkitabschool.edu.pk",
      password,
      role: Role.PARENT,
    },
  });

  const parentProfile = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: {
      userId: parentUser.id,
      fatherName: "Muhammad Aslam",
    },
  });

  // ---- Student ----
  const studentUser = await prisma.user.upsert({
    where: { email: "student@alkitabschool.edu.pk" },
    update: {},
    create: {
      name: "Ali Aslam",
      email: "student@alkitabschool.edu.pk",
      password,
      role: Role.STUDENT,
    },
  });

  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      fullName: "Ali Aslam",
      userId: studentUser.id,
      rollNumber: "AK-0001",
      parentId: parentProfile.id,
      sectionId: section?.id,
    },
  });

  console.log("Seed complete. Test logins (password: password123):");
  console.log("  admin@alkitabschool.edu.pk");
  console.log("  teacher@alkitabschool.edu.pk");
  console.log("  parent@alkitabschool.edu.pk");
  console.log("  student@alkitabschool.edu.pk");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
