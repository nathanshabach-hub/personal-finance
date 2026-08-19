import { test, expect } from "@playwright/test";

test("auth pages render", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Welcome back")).toBeVisible();

  await page.goto("/register");
  await expect(page.getByText("Create your account")).toBeVisible();
});
