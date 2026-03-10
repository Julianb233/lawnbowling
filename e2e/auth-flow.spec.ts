import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("login page has email input and submit button", async ({ page }) => {
    await page.goto("/login");

    // Email input
    const emailInput = page.getByRole("textbox").first();
    await expect(emailInput).toBeVisible();

    // Submit button
    const submitBtn = page.getByRole("button", { name: /sign in|log in|continue/i }).first();
    await expect(submitBtn).toBeVisible();
  });

  test("signup page has registration fields", async ({ page }) => {
    await page.goto("/signup");

    // Should have at least an email input
    const inputs = page.getByRole("textbox");
    await expect(inputs.first()).toBeVisible();

    // Should have a submit button
    const submitBtn = page.getByRole("button").first();
    await expect(submitBtn).toBeVisible();
  });

  test("login form validates empty submission", async ({ page }) => {
    await page.goto("/login");

    // Try to submit empty form
    const submitBtn = page.getByRole("button", { name: /sign in|log in|continue/i }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();

      // Should show validation or stay on login page
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/login");
    }
  });

  test("login form accepts email input", async ({ page }) => {
    await page.goto("/login");

    const emailInput = page.getByRole("textbox").first();
    await emailInput.fill("test@example.com");

    const value = await emailInput.inputValue();
    expect(value).toBe("test@example.com");
  });

  test("signup links to login and vice versa", async ({ page }) => {
    // Check login page has signup link
    await page.goto("/login");
    const signupLink = page.getByRole("link", { name: /sign up|create account|register/i }).first();
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await page.waitForURL(/\/signup/);
      expect(page.url()).toContain("/signup");
    }

    // Check signup page has login link
    await page.goto("/signup");
    const loginLink = page.getByRole("link", { name: /sign in|log in|already have/i }).first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain("/login");
    }
  });
});
