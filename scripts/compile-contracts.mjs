import fs from "node:fs";
import path from "node:path";
import solc from "solc";

const contractDir = path.resolve("contracts");
const artifactDir = path.resolve("artifacts");
const files = fs.readdirSync(contractDir).filter((file) => file.endsWith(".sol"));
const sources = Object.fromEntries(files.map((file) => [file, { content: fs.readFileSync(path.join(contractDir, file), "utf8") }]));
const input = { language: "Solidity", sources, settings: { optimizer: { enabled: true, runs: 200 }, outputSelection: { "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object", "metadata"] } } } };
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (output.errors ?? []).filter((item) => item.severity === "error");
if (errors.length) {
  for (const error of errors) console.error(error.formattedMessage);
  process.exit(1);
}
fs.mkdirSync(artifactDir, { recursive: true });
let count = 0;
for (const [sourceName, contracts] of Object.entries(output.contracts)) {
  for (const [contractName, artifact] of Object.entries(contracts)) {
    if (!artifact.evm.bytecode.object) continue;
    fs.writeFileSync(path.join(artifactDir, `${contractName}.json`), JSON.stringify({ contractName, sourceName, abi: artifact.abi, bytecode: `0x${artifact.evm.bytecode.object}`, deployedBytecode: `0x${artifact.evm.deployedBytecode.object}` }, null, 2));
    count += 1;
  }
}
console.log(`Compiled ${count} TrueGuard contracts with solc ${solc.version()}.`);
