import { format } from "date-fns";
import { nextOccurrence } from "@/services/recurring-service";

describe("recurring", () => {
  it("supports fortnightly schedule", () => {
    const date = nextOccurrence("2026-08-01", "Fortnightly");
    expect(format(date, "yyyy-MM-dd")).toBe("2026-08-15");
  });

  it("supports monthly schedule", () => {
    const date = nextOccurrence("2026-08-01", "Monthly");
    expect(format(date, "yyyy-MM-dd")).toBe("2026-09-01");
  });
});
