
const fs = require("fs");

let content = fs.readFileSync("app/api/employer/discover/route.ts", "utf8");

content = content.replace(
  `const { roleId } = await req.json();`,
  `
    let roleId;
    try {
      const body = await req.json();
      roleId = body.roleId;
    } catch (e) {
      // Body might be empty
    }
  `
);

content = content.replace(
  `    if (!roleId) {
      return NextResponse.json({ error: "Missing roleId" }, { status: 400 });
    }`,
  ``
);

content = content.replace(
  `const targetRole = roles.find((r) => r.id === roleId);\n\n    if (!targetRole) {\n      return NextResponse.json({ error: "Role not found or does not belong to this employer" }, { status: 403 });\n    }`,
  `const targetRole = roleId ? roles.find((r) => r.id === roleId) : null;\n    if (roleId && !targetRole) {\n      return NextResponse.json({ error: "Role not found or does not belong to this employer" }, { status: 403 });\n    }`
);

content = content.replace(
  `const requiredSkills: string[] = targetRole.skills || [];`,
  `const requiredSkills: string[] = targetRole?.skills || [];`
);

fs.writeFileSync("app/api/employer/discover/route.ts", content, "utf8");

