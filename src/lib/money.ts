import { AppError } from "@/lib/errors";

const MONEY_SCALE = 2n;
const SCALE_FACTOR = 10n ** MONEY_SCALE;

export type MinorUnit = bigint;

export function parseMoneyToMinorUnits(input: string): MinorUnit {
  if (!/^[-+]?\d+(\.\d{1,2})?$/.test(input.trim())) {
    throw new AppError("Invalid monetary value");
  }

  const sign = input.startsWith("-") ? -1n : 1n;
  const normalized = input.replace(/^[-+]/, "");
  const [wholePart, decimalPart = ""] = normalized.split(".");
  const decimals = (decimalPart + "00").slice(0, 2);
  const value = BigInt(wholePart) * SCALE_FACTOR + BigInt(decimals);
  return value * sign;
}

export function minorUnitsToDecimalString(value: MinorUnit): string {
  const sign = value < 0n ? "-" : "";
  const absolute = value < 0n ? value * -1n : value;
  const whole = absolute / SCALE_FACTOR;
  const decimals = (absolute % SCALE_FACTOR).toString().padStart(2, "0");
  return `${sign}${whole.toString()}.${decimals}`;
}

export function addMoney(...values: MinorUnit[]): MinorUnit {
  return values.reduce((acc, value) => acc + value, 0n);
}

export function subtractMoney(left: MinorUnit, right: MinorUnit): MinorUnit {
  return left - right;
}
