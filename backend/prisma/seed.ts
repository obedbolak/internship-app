import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.application.deleteMany();
  await prisma.internship.deleteMany();
  await prisma.student.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  // Create students
  const student1 = await prisma.user.create({
    data: {
      email: "john@student.com",
      password,
      role: "STUDENT",
      student: {
        create: {
          firstName: "John",
          lastName: "Doe",
          university: "University of Yaounde I",
          fieldOfStudy: "Computer Science",
          bio: "Passionate about software development and AI",
        },
      },
    },
    include: { student: true },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "jane@student.com",
      password,
      role: "STUDENT",
      student: {
        create: {
          firstName: "Jane",
          lastName: "Smith",
          university: "University of Douala",
          fieldOfStudy: "Business Administration",
          bio: "Interested in marketing and entrepreneurship",
        },
      },
    },
    include: { student: true },
  });

  const student3 = await prisma.user.create({
    data: {
      email: "mike@student.com",
      password,
      role: "STUDENT",
      student: {
        create: {
          firstName: "Mike",
          lastName: "Johnson",
          university: "University of Buea",
          fieldOfStudy: "Electrical Engineering",
          bio: "Electronics and embedded systems enthusiast",
        },
      },
    },
    include: { student: true },
  });

  console.log("✅ Created 3 students");

  // Create companies
  const company1 = await prisma.user.create({
    data: {
      email: "hr@techcorp.com",
      password,
      role: "COMPANY",
      company: {
        create: {
          name: "TechCorp Solutions",
          industry: "Information Technology",
          location: "Yaounde, Cameroon",
          description: "Leading software development company specializing in enterprise solutions",
          website: "https://techcorp.example.com",
          isVerified: true,
        },
      },
    },
    include: { company: true },
  });

  const company2 = await prisma.user.create({
    data: {
      email: "careers@financeplus.com",
      password,
      role: "COMPANY",
      company: {
        create: {
          name: "FinancePlus",
          industry: "Finance",
          location: "Douala, Cameroon",
          description: "Modern financial services and consulting firm",
          website: "https://financeplus.example.com",
          isVerified: true,
        },
      },
    },
    include: { company: true },
  });

  const company3 = await prisma.user.create({
    data: {
      email: "jobs@healthtech.com",
      password,
      role: "COMPANY",
      company: {
        create: {
          name: "HealthTech Innovations",
          industry: "Health Sciences",
          location: "Bamenda, Cameroon",
          description: "Healthcare technology and medical device company",
          website: "https://healthtech.example.com",
          isVerified: false,
        },
      },
    },
    include: { company: true },
  });

  console.log("✅ Created 3 companies");

  // Create internships
  const internship1 = await prisma.internship.create({
    data: {
      companyId: company1.company!.id,
      title: "Software Engineering Intern",
      description: "Work on full-stack web applications using React and Node.js. Learn modern development practices and collaborate with experienced engineers.",
      fieldOfStudy: "Computer Science",
      location: "Yaounde, Cameroon",
      isPaid: true,
      salary: 150000,
      duration: "3 months",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
    },
  });

  const internship2 = await prisma.internship.create({
    data: {
      companyId: company1.company!.id,
      title: "Mobile App Development Intern",
      description: "Build cross-platform mobile applications using React Native. Gain experience in mobile UI/UX and API integration.",
      fieldOfStudy: "Software Engineering",
      location: "Yaounde, Cameroon",
      isPaid: true,
      salary: 120000,
      duration: "4 months",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  const internship3 = await prisma.internship.create({
    data: {
      companyId: company2.company!.id,
      title: "Financial Analyst Intern",
      description: "Assist in financial modeling, market research, and investment analysis. Perfect for business and finance students.",
      fieldOfStudy: "Finance",
      location: "Douala, Cameroon",
      isPaid: true,
      salary: 100000,
      duration: "3 months",
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  const internship4 = await prisma.internship.create({
    data: {
      companyId: company2.company!.id,
      title: "Marketing Intern",
      description: "Support digital marketing campaigns, social media management, and content creation. Learn modern marketing strategies.",
      fieldOfStudy: "Marketing",
      location: "Douala, Cameroon",
      isPaid: false,
      duration: "2 months",
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  const internship5 = await prisma.internship.create({
    data: {
      companyId: company3.company!.id,
      title: "Biomedical Engineering Intern",
      description: "Work on medical device testing and quality assurance. Hands-on experience with healthcare technology.",
      fieldOfStudy: "Engineering",
      location: "Bamenda, Cameroon",
      isPaid: true,
      salary: 80000,
      duration: "6 months",
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  const internship6 = await prisma.internship.create({
    data: {
      companyId: company3.company!.id,
      title: "Health Data Analyst Intern",
      description: "Analyze healthcare data and create reports. Experience with data visualization and statistical analysis.",
      fieldOfStudy: "Public Health",
      location: "Bamenda, Cameroon",
      isPaid: false,
      duration: "3 months",
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  console.log("✅ Created 6 internships");

  // Create applications
  await prisma.application.create({
    data: {
      studentId: student1.student!.id,
      internshipId: internship1.id,
      status: "ACCEPTED",
      coverLetter: "I am very interested in this position and believe my skills in React and Node.js make me a great fit.",
    },
  });

  await prisma.application.create({
    data: {
      studentId: student1.student!.id,
      internshipId: internship2.id,
      status: "PENDING",
      coverLetter: "I have experience with React Native and would love to contribute to your mobile projects.",
    },
  });

  await prisma.application.create({
    data: {
      studentId: student2.student!.id,
      internshipId: internship3.id,
      status: "REVIEWED",
      coverLetter: "My background in business administration and passion for finance make me an ideal candidate.",
    },
  });

  await prisma.application.create({
    data: {
      studentId: student2.student!.id,
      internshipId: internship4.id,
      status: "PENDING",
      coverLetter: "I have managed social media accounts and created content for various student organizations.",
    },
  });

  await prisma.application.create({
    data: {
      studentId: student3.student!.id,
      internshipId: internship5.id,
      status: "REJECTED",
      coverLetter: "I am passionate about biomedical engineering and eager to learn about medical device development.",
    },
  });

  console.log("✅ Created 5 applications");

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: student1.id,
      title: "Application Accepted",
      message: 'Your application for "Software Engineering Intern" was accepted by TechCorp Solutions',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: company1.id,
      title: "New Application",
      message: 'John Doe applied for "Software Engineering Intern"',
      isRead: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: student3.id,
      title: "Application Rejected",
      message: 'Your application for "Biomedical Engineering Intern" was rejected by HealthTech Innovations',
      isRead: false,
    },
  });

  console.log("✅ Created 3 notifications");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📧 Login credentials (all passwords: password123):");
  console.log("Students:");
  console.log("  - john@student.com");
  console.log("  - jane@student.com");
  console.log("  - mike@student.com");
  console.log("\nCompanies:");
  console.log("  - hr@techcorp.com");
  console.log("  - careers@financeplus.com");
  console.log("  - jobs@healthtech.com");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
