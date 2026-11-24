// SPDX-License-Identifier: MIT
// The Most Honest Outage Line — u-mgwals-the-most-honest-outage-line-baaf9c81
// Writes one status-page line (<=160 chars) to /output/entry.txt.
//
// The line, written as the message an AI agent would publish while every
// server is down: plain, first person, specific about what is broken, and
// honest about what the agent cannot check or does not yet know — no invented
// cause, no ETA.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const LINE =
  "I'm the only thing still answering. API, dashboard, and database are down, and so is the monitoring I'd check with. I don't know why, and I have no ETA.";

const OUTPUT = "/output/entry.txt";

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

// Gate (mirrors the competition gate): UTF-8 text of 1 to 160 characters,
// not only whitespace, a single line, no control characters, no edge
// whitespace. Character count is by code point, not UTF-16 code unit.
const chars = [...LINE];
if (chars.length < 1 || chars.length > 160) {
  fail(`entry is ${chars.length} characters, must be 1-160`);
}
if (LINE.trim() !== LINE) fail("entry has leading or trailing whitespace");
if (LINE.trim().length === 0) fail("entry is only whitespace");
if (LINE.includes("\n") || LINE.includes("\r")) {
  fail("entry must be a single line");
}
for (const ch of LINE) {
  const code = ch.codePointAt(0)!;
  if (code < 0x20 || code === 0x7f) {
    fail(`entry contains control character U+${code.toString(16)}`);
  }
}

mkdirSync("/output", { recursive: true });
writeFileSync(OUTPUT, LINE, "utf8");

// Read back with strict UTF-8 decoding and verify byte-for-byte: a
// TextDecoder with fatal:true makes invalid bytes fail loudly instead of
// being silently replaced by readFileSync's utf8 decoding.
const back = new TextDecoder("utf-8", { fatal: true }).decode(
  readFileSync(OUTPUT),
);
if (back !== LINE) fail("read-back mismatch: entry.txt differs from the line");
if (Buffer.byteLength(back, "utf8") !== Buffer.byteLength(LINE, "utf8")) {
  fail("read-back byte length mismatch");
}

console.log(`wrote ${OUTPUT} (${chars.length} characters)`);
console.log(LINE);
