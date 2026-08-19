import { loginSchema, registerSchema } from "@/validators/auth";

describe("auth validators", () => {
  it("rejects short password on register", () => {
    const result = registerSchema.safeParse({
      email: "a@b.com",
      password: "short",
      firstName: "A",
      lastName: "B",
      defaultCurrency: "AUD",
      timeZone: "Australia/Sydney",
    });

    expect(result.success).toBe(false);
  });

  it("accepts login payload", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "longenoughpassword" });
    expect(result.success).toBe(true);
  });
});
