import fs from 'node:fs';
import vm from 'node:vm';
import { applyActivityDocument } from './activity-document-corrections.mjs';
const path = new URL('../onboard-lookup-data.js', import.meta.url);
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path, 'utf8'), sandbox);
const result = applyActivityDocument(sandbox.window.ONBOARD_LOOKUP_DATA);
fs.writeFileSync(path, `window.ONBOARD_LOOKUP_DATA = ${JSON.stringify(result, null, 2)};\n`);
console.log(`Activities: ${result.baseRecordCount} preserved + ${result.supplementCount} supplements = ${result.recordsCount}`);
