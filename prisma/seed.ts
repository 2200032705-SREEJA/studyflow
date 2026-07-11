import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@studyflow.app" },
    update: {},
    create: {
      name: "Demo Student",
      email: "demo@studyflow.app",
      passwordHash,
      university: "State University",
      course: "B.Tech Computer Science",
      semester: "4th Semester"
    }
  });

  await prisma.assignment.create({
    data: {
      userId: user.id,
      title: "Networking Fundamentals Report",
      subject: "Computer Networks",
      question:
        "Explain the OSI model and compare it with the TCP/IP model. Discuss how data flows through each layer with a real-world example.",
      status: "PLANNING"
    }
  });

  await prisma.assignment.create({
    data: {
      userId: user.id,
      title: "Machine Learning Basics",
      subject: "Artificial Intelligence",
      question:
        "Explain the key concepts of Machine Learning. Discuss different types of learning with examples.",
      status: "NOT_STARTED"
    }
  });

  console.log("Seeded demo user: demo@studyflow.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
