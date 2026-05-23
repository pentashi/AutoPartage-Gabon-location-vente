import { ContractStatus, PaymentStatus, VehicleStatus } from "@prisma/client";

const BASE_URL = "http://localhost:4000";

async function validate() {
  console.log("--- Validation of Critical Scenarios ---");

  // 1. Login
  console.log("Step 1: Logging in as Admin...");
  const initialRes = await fetch(`${BASE_URL}/auth/csrf-token`);
  const { csrfToken } = await initialRes.json();
  const initialCookies = initialRes.headers.get("set-cookie");

  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
      "cookie": initialCookies || "",
    },
    body: JSON.stringify({
      email: "admin@autopartage.ga",
      password: "admin123456",
    }),
  });

  if (!loginRes.ok) {
    console.error("Login failed", await loginRes.text());
    process.exit(1);
  }
  const authCookies = loginRes.headers.get("set-cookie");
  console.log("Logged in successfully.");

  const allCookies = [initialCookies, authCookies].filter(Boolean).join("; ");

  // 2. Scenario 1: Detect Late -> Suspension -> Immobilization
  console.log("\nStep 2: Scenario 1 - Detecting late payments...");
  const detectRes = await fetch(`${BASE_URL}/payments/detect-late`, {
    method: "PATCH",
    headers: {
      "x-csrf-token": csrfToken,
      "cookie": allCookies,
    },
  });

  const detectData = await detectRes.json();
  console.log("Detection results:", detectData);

  // Check state in DB
  const contractsRes = await fetch(`${BASE_URL}/contracts`, {
    headers: { "cookie": allCookies },
  });
  const contracts = await contractsRes.json();
  const contract = contracts[0];

  const vehiclesRes = await fetch(`${BASE_URL}/vehicles`, {
    headers: { "cookie": allCookies },
  });
  const vehicles = await vehiclesRes.json();
  const vehicle = vehicles.find((v: any) => v.id === contract.vehicleId);

  console.log(`Contract Status: ${contract.status} (Expected: SUSPENDED)`);
  console.log(`Vehicle Status: ${vehicle.status} (Expected: IMMOBILIZED)`);

  if (contract.status === ContractStatus.SUSPENDED && vehicle.status === VehicleStatus.IMMOBILIZED) {
    console.log("✅ Scenario 1 Validated!");
  } else {
    console.log("❌ Scenario 1 Failed!");
  }

  // 3. Scenario 2: Payment -> Rapprochement -> Déblocage -> Réactivation
  console.log("\nStep 3: Scenario 2 - Regularizing payment...");
  
  // Find overdue payments
  const paymentsRes = await fetch(`${BASE_URL}/payments`, {
    headers: { "cookie": allCookies },
  });
  const payments = await paymentsRes.json();
  const overduePayments = payments.filter((p: any) => p.status === PaymentStatus.OVERDUE);

  console.log(`Found ${overduePayments.length} overdue payments. Paying them...`);

  for (const p of overduePayments) {
    await fetch(`${BASE_URL}/payments/${p.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
        "cookie": allCookies,
      },
      body: JSON.stringify({ status: PaymentStatus.PAID, paidAt: new Date() }),
    });
  }

  // Manually reactive contract and vehicle (as done by admin after rapprochement)
  console.log("Admin releasing vehicle and reactivating contract...");
  await fetch(`${BASE_URL}/gps/vehicles/${vehicle.id}/commands/release`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
      "cookie": allCookies,
    },
    body: JSON.stringify({ reason: "Payment regularized" }),
  });

  await fetch(`${BASE_URL}/contracts/${contract.id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
      "cookie": allCookies,
    },
    body: JSON.stringify({ status: ContractStatus.ACTIVE }),
  });

  // Verify
  const finalContractRes = await fetch(`${BASE_URL}/contracts/${contract.id}`, {
    headers: { "cookie": allCookies },
  });
  const finalContract = await finalContractRes.json();

  const finalVehicleRes = await fetch(`${BASE_URL}/vehicles`, {
    headers: { "cookie": allCookies },
  });
  const finalVehicles = await finalVehicleRes.json();
  const finalVehicle = finalVehicles.find((v: any) => v.id === contract.vehicleId);

  console.log(`Final Contract Status: ${finalContract.status} (Expected: ACTIVE)`);
  console.log(`Final Vehicle Status: ${finalVehicle.status} (Expected: ACTIVE)`);

  if (finalContract.status === ContractStatus.ACTIVE && finalVehicle.status === VehicleStatus.ACTIVE) {
    console.log("✅ Scenario 2 Validated!");
  } else {
    console.log("❌ Scenario 2 Failed!");
  }

  // 4. Scenario 3: Maintenance -> Assignation -> Intervention -> Clôture
  console.log("\nStep 4: Scenario 3 - Maintenance lifecycle...");
  
  // Get garage user ID
  const usersRes = await fetch(`${BASE_URL}/users`, {
    headers: { "cookie": allCookies },
  });
  const users = await usersRes.json();
  const garageUser = users.find((u: any) => u.email === "garage@test.com");

  // Create task
  const createTaskRes = await fetch(`${BASE_URL}/maintenance/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
      "cookie": allCookies,
    },
    body: JSON.stringify({
      vehicleId: vehicle.id,
      assignedToId: garageUser.id,
      title: "Vidange périodique",
      description: "Changement huile et filtre",
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
    }),
  });

  const task = await createTaskRes.json();
  console.log(`Maintenance task created: ${task.id} (Status: ${task.status})`);

  // Update to IN_PROGRESS
  console.log("Updating task to IN_PROGRESS...");
  await fetch(`${BASE_URL}/maintenance/tasks/${task.id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
      "cookie": allCookies,
    },
    body: JSON.stringify({ status: "IN_PROGRESS" }),
  });

  // Update to COMPLETED
  console.log("Updating task to COMPLETED...");
  const completeRes = await fetch(`${BASE_URL}/maintenance/tasks/${task.id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
      "cookie": allCookies,
    },
    body: JSON.stringify({ status: "COMPLETED", justification: "Done successfully" }),
  });
  const completedTask = await completeRes.json();

  console.log(`Task finalized (Status: ${completedTask.status})`);

  if (completedTask.status === "COMPLETED") {
    console.log("✅ Scenario 3 Validated!");
  } else {
    console.log("❌ Scenario 3 Failed!");
  }

  // 5. Scenario 4: Incident sécurité -> Alerte critique -> Traçabilité admin
  console.log("\nStep 5: Scenario 4 - Security incident...");
  
  // Get driver ID
  const driversRes = await fetch(`${BASE_URL}/drivers`, {
    headers: { "cookie": allCookies },
  });
  const drivers = await driversRes.json();
  const driver = drivers[0];

  // Create incident
  const createIncidentRes = await fetch(`${BASE_URL}/incidents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
      "cookie": allCookies,
    },
    body: JSON.stringify({
      driverId: driver.id,
      vehicleId: vehicle.id,
      title: "Sortie de zone non autorisée",
      description: "Le véhicule a quitté la zone de Libreville sans autorisation.",
    }),
  });

  const incident = await createIncidentRes.json();
  console.log(`Incident created: ${incident.id}`);

  // Check notifications for admin
  const adminNotifsRes = await fetch(`${BASE_URL}/notifications`, {
    headers: { "cookie": allCookies },
  });
  const adminNotifs = await adminNotifsRes.json();
  const criticalNotif = adminNotifs.find((n: any) => n.priority === "CRITICAL" && n.message.includes(incident.id));

  if (criticalNotif) {
    console.log("✅ Critical notification found for admin!");
  } else {
    console.log("❌ Critical notification NOT found!");
  }

  // Update incident status
  console.log("Resolving incident...");
  await fetch(`${BASE_URL}/incidents/${incident.id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
      "cookie": allCookies,
    },
    body: JSON.stringify({ status: "RESOLVED", note: "Chauffeur rappelé à l'ordre" }),
  });

  // Check trace notification
  const adminNotifsRes2 = await fetch(`${BASE_URL}/notifications`, {
    headers: { "cookie": allCookies },
  });
  const adminNotifs2 = await adminNotifsRes2.json();
  const traceNotif = adminNotifs2.find((n: any) => n.title === "Traçabilité d'incident admin" && n.message.includes("RESOLVED"));

  if (traceNotif) {
    console.log("✅ Trace notification found for admin!");
  } else {
    console.log("❌ Trace notification NOT found!");
  }

  if (criticalNotif && traceNotif) {
    console.log("✅ Scenario 4 Validated!");
  } else {
    console.log("❌ Scenario 4 Failed!");
  }
}

validate().catch(console.error);
