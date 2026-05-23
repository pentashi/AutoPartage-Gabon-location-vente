import bcrypt from "bcryptjs";
import { PrismaClient, Role, VehicleStatus, ContractType, ContractStatus, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function hash(pwd: string) {
  return bcrypt.hash(pwd, 12);
}

async function main() {
  console.log("🚀 Starting enhanced seeding...");

  // 1. CLEAR EXISTING DATA (Optional, but helps for a clean start)
  // await prisma.payment.deleteMany();
  // await prisma.contract.deleteMany();
  // await prisma.vehicle.deleteMany();
  // await prisma.driver.deleteMany();
  // await prisma.user.deleteMany();

  // 2. CREATE USERS FOR DIFFERENT ROLES
  const roles = [
    { email: "admin@autopartage.ga", name: "Super Admin", role: Role.SUPER_ADMIN },
    { email: "compta@autopartage.ga", name: "Marcelle Mba", role: Role.ACCOUNTANT },
    { email: "flotte@autopartage.ga", name: "Junior Obiang", role: Role.FLEET_MANAGER },
    { email: "garage@central.ga", name: "Garage Central", role: Role.GARAGE },
  ];

  for (const r of roles) {
    await prisma.user.upsert({
      where: { email: r.email },
      update: { role: r.role },
      create: {
        email: r.email,
        fullName: r.name,
        passwordHash: await hash("password123"),
        role: r.role,
      },
    });
  }

  // 3. CREATE VEHICLES
  const vehiclesData = [
    { brand: "Toyota", model: "Corolla", plate: "G-123-AA", year: 2022, status: VehicleStatus.ACTIVE },
    { brand: "Hyundai", model: "Elantra", plate: "G-456-BB", year: 2021, status: VehicleStatus.ACTIVE },
    { brand: "Suzuki", model: "Ertiga", plate: "G-789-CC", year: 2023, status: VehicleStatus.ACTIVE },
    { brand: "Toyota", model: "Hilux", plate: "G-101-DD", year: 2020, status: VehicleStatus.MAINTENANCE },
    { brand: "Kia", model: "Rio", plate: "G-202-EE", year: 2022, status: VehicleStatus.IMMOBILIZED },
  ];

  const vehicles = [];
  for (const v of vehiclesData) {
    const veh = await prisma.vehicle.upsert({
      where: { plateNumber: v.plate },
      update: { status: v.status },
      create: {
        brand: v.brand,
        model: v.model,
        plateNumber: v.plate,
        year: v.year,
        status: v.status,
      },
    });
    vehicles.push(veh);
  }

  // 4. CREATE DRIVERS & CONTRATS
  const driversData = [
    { email: "jean@driver.ga", name: "Jean Dupont", license: "GA-001" },
    { email: "pierre@driver.ga", name: "Pierre Mve", license: "GA-002" },
    { email: "serge@driver.ga", name: "Serge Ndong", license: "GA-003" },
  ];

  for (let i = 0; i < driversData.length; i++) {
    const d = driversData[i];
    const user = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        email: d.email,
        fullName: d.name,
        passwordHash: await hash("password123"),
        role: Role.DRIVER,
      },
    });

    const driver = await prisma.driver.upsert({
      where: { licenseNumber: d.license },
      update: {},
      create: {
        userId: user.id,
        licenseNumber: d.license,
        riskScore: 0.1,
      },
    });

    // Create a contract for the first 3 vehicles
    if (i < vehicles.length) {
      const contract = await prisma.contract.create({
        data: {
          driverId: driver.id,
          vehicleId: vehicles[i].id,
          type: i === 2 ? ContractType.RENT : ContractType.SALE,
          status: ContractStatus.ACTIVE,
          startDate: new Date(),
          monthlyAmount: 250000 + (i * 10000),
        },
      });

      // Add some payments
      const now = new Date();
      await prisma.payment.create({
        data: {
          contractId: contract.id,
          amount: 250000 + (i * 10000),
          dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
          status: i === 0 ? PaymentStatus.PAID : PaymentStatus.PENDING,
          paidAt: i === 0 ? now : null,
        },
      });
    }
  }

  console.log("✅ Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
