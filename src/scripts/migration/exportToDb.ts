// =============================================================================
// Migration Script: LocalStorage to PostgreSQL
// Path: src/scripts/migration/exportToDb.ts
//
// Since localStorage is only accessible from the browser, we need a client-side 
// page or an injected script to read it and POST to a new /api/migration route.
// 
// Alternatively, if you run this in browser console, it will send the data:
// =============================================================================

export async function migrateLocalDataToDb() {
  console.log("Starting Migration from LocalStorage...");

  try {
    const rawPatients = localStorage.getItem("dental_patients_data");
    const rawAppointments = localStorage.getItem("dental_appointments_data");
    const rawPlans = localStorage.getItem("dental_treatments_data");
    const rawInvoices = localStorage.getItem("dental_finance_data");

    const patients = rawPatients ? JSON.parse(rawPatients) : [];
    
    // For each patient, we send them to the backend API to be inserted
    for (const p of patients) {
      console.log(`Migrating Patient: ${p.firstName} ${p.lastName}`);
      
      const payload = {
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone,
        dateOfBirth: p.dateOfBirth,
        city: p.city || "غير محدد",
        address: p.address || "",
        bloodGroup: p.bloodGroup,
        medicalAlerts: p.medicalHistory?.map((h: any) => h.condition).join(", ") || "",
        allergies: []
      };

      await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    console.log("Migration Complete! ✅");
    console.log(`Migrated ${patients.length} patients.`);
    
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

// In your application, you can temporarily attach this to the global window
if (typeof window !== "undefined") {
  (window as any).runMigration = migrateLocalDataToDb;
}
