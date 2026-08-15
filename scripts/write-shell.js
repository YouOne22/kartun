const fs = require("fs");
const path = require("path");
const src = path.resolve("src/components/DashboardShell.tsx");
fs.writeFileSync(src, "", "utf8");
console.log("cleared");
