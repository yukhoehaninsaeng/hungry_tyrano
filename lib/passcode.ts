import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashPasscode(passcode: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(passcode, salt, KEY_LENGTH).toString("hex");

  return { passcodeSalt: salt, passcodeHash: hash };
}

export function verifyPasscode(passcode: string, passcodeSalt: string, passcodeHash: string) {
  const candidate = scryptSync(passcode, passcodeSalt, KEY_LENGTH);
  const source = Buffer.from(passcodeHash, "hex");

  if (candidate.length !== source.length) {
    return false;
  }

  return timingSafeEqual(candidate, source);
}
