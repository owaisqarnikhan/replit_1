import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from "./db";
import { users } from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedUsers() {
  try {
    console.log("Seeding predefined user accounts...");

    // Check if admin already exists
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "admin")
    });

    if (existingAdmin) {
      console.log("Users already exist, skipping seed...");
      return;
    }

    const predefinedUsers = [
      {
        username: "admin",
        email: "admin@innovanceorbit.com",
        password: "admin123",
        isAdmin: true
      },
      {
        username: "customer1",
        email: "customer1@example.com", 
        password: "customer123",
        isAdmin: false
      },
      {
        username: "customer2",
        email: "customer2@example.com",
        password: "customer123", 
        isAdmin: false
      },
      {
        username: "customer3",
        email: "customer3@example.com",
        password: "customer123",
        isAdmin: false
      },
      {
        username: "testuser",
        email: "test@example.com",
        password: "test123",
        isAdmin: false
      },
      {
        username: "demo",
        email: "demo@innovanceorbit.com",
        password: "demo123",
        isAdmin: false
      }
    ];

    for (const userData of predefinedUsers) {
      const hashedPassword = await hashPassword(userData.password);
      
      await db.insert(users).values({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        isAdmin: userData.isAdmin
      });
      
      console.log(`✓ Created ${userData.isAdmin ? 'admin' : 'customer'} account: ${userData.username}`);
    }

    console.log("\n🎉 All predefined accounts created successfully!");
    console.log("\n📋 Available test accounts:");
    console.log("┌─────────────┬─────────────┬─────────┐");
    console.log("│   Username  │   Password  │   Type  │");
    console.log("├─────────────┼─────────────┼─────────┤");
    console.log("│   admin     │   admin123  │  Admin  │");
    console.log("│  customer1  │ customer123 │ Customer│");
    console.log("│  customer2  │ customer123 │ Customer│");
    console.log("│  customer3  │ customer123 │ Customer│");
    console.log("│  testuser   │   test123   │ Customer│");
    console.log("│    demo     │   demo123   │ Customer│");
    console.log("└─────────────┴─────────────┴─────────┘");

  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedUsers().then(() => {
    console.log("Seeding completed!");
    process.exit(0);
  }).catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
}

export { seedUsers };