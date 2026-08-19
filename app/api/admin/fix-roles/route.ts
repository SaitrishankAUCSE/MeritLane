import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "adminDb not initialized" }, { status: 500 });
    }

    const employersSnapshot = await adminDb.collection("employers").get();
    let found = false;
    let migratedCount = 0;
    const logs = [];

    for (const doc of employersSnapshot.docs) {
      const data = doc.data();
      const roles = data.roles || [];
      
      let updated = false;
      const newRoles = roles.map((role: any) => {
        if (role.title === "Python Full Stack Engineer") {
          logs.push(`Found Python role in employer ${doc.id}`);
          logs.push(`Raw skills: ${JSON.stringify(role.requiredSkills || role.skills)}`);
          
          const skillsArray = role.requiredSkills || role.skills;
          if (skillsArray && skillsArray.length === 1 && skillsArray[0] === "Python React Firebase") {
            updated = true;
            found = true;
            return {
              ...role,
              requiredSkills: ["Python", "React", "Firebase"]
            };
          }
        }
        return role;
      });

      if (updated) {
        logs.push(`Updating employer ${doc.id} with corrected role...`);
        await doc.ref.update({ roles: newRoles });
        migratedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      found,
      migratedCount,
      logs
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
