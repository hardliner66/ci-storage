import { existsSync, readFileSync, writeFileSync } from "fs";
import { argv, exit } from "process";

if (argv.length < 3) {
  console.error("Usage: node increment-count.js <file_path>");
  exit(1);
}

const filePath = argv[2];
console.log(`Incrementing count for file: ${filePath}`);

try {
  // Check if the file exists
  if (existsSync(filePath)) {
    // File exists, read it
    const fileContent = readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContent);

    // Increment the count
    data.count = (data.count || 0) + 1;

    // Write back to the file
    writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`Count incremented to: ${data.count}`);
  } else {
    // File doesn't exist, create it with initial value
    const initialData = { count: 1 };
    writeFileSync(filePath, JSON.stringify(initialData, null, 2), "utf8");
    console.log("File created with count: 1");
  }
} catch (error) {
  console.error("Error:", error.message);
  exit(1);
}
