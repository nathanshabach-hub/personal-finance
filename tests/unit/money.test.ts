import { addMoney, minorUnitsToDecimalString, parseMoneyToMinorUnits, subtractMoney } from "@/lib/money";

describe("money", () => {
  it("parses and formats amounts deterministically", () => {
    const amount = parseMoneyToMinorUnits("123.45");
    expect(minorUnitsToDecimalString(amount)).toBe("123.45");
  });

  it("adds and subtracts without floating-point errors", () => {
    const a = parseMoneyToMinorUnits("0.10");
    const b = parseMoneyToMinorUnits("0.20");
    const c = addMoney(a, b);
    expect(minorUnitsToDecimalString(c)).toBe("0.30");

    const d = subtractMoney(c, parseMoneyToMinorUnits("0.05"));
    expect(minorUnitsToDecimalString(d)).toBe("0.25");
  });
});
