import fs from "fs";
import JSON5 from "json5";
const inputPath = process.argv[2];
const outputPath = process.argv[3];

const file = fs.readFileSync(inputPath, "utf-8");
const data = JSON5.parse(file);
fs.writeFileSync(outputPath, JSON5.stringify(data, null, 2), "utf-8");
// fs.writeFileSync("./data/heap-data-example.json", JSON5.stringify(data, null, 2), "utf-8");
// console.log(JSON.stringify(data, null, 2));
