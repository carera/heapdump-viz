import fs from "fs";
import JSON5 from "json5";
const filename = process.argv[2];

const file = fs.readFileSync(filename, "utf-8");
const data = JSON5.parse(file);
fs.writeFileSync("./data/heap-data-example.json", JSON.stringify(data), "utf-8");
// console.log(JSON.stringify(data, null, 2));
