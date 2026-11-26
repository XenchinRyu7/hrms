import { test, expect } from "@playwright/test";

test.describe("EHMRS Full UI & Sidebar Navigation Flow", () => {
  test("login and navigate across all sidebar modules without errors", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    page.on("requestfailed", (req) => {
      failedRequests.push(`${req.url()} (${req.failure()?.errorText})`);
    });

    // 1. Visit Login Page
    await page.goto("/login");
    await expect(page).toHaveTitle(/Login/);

    // Fill credentials directly
    await page.fill('input[type="email"]', "admin@ethereal.hr");
    await page.fill('input[type="password"]', "password123");

    // Click Sign In
    const signInBtn = page.getByRole("button", { name: /Sign In/i });
    await signInBtn.click();

    // Wait for Dashboard to mount
    await page.waitForURL((url) => url.pathname === "/", { timeout: 10000 });
    await expect(page.getByText("Executive Console").first()).toBeVisible({
      timeout: 10000,
    });

    // 2. Test all sidebar modules
    const modules = [
      {
        name: "Employees & Org",
        path: "/employees",
        expectedText: "Employee Directory",
      },
      {
        name: "Attendance & Clock",
        path: "/attendance",
        expectedText: "Attendance Terminal",
      },
      {
        name: "Time Off & Leave",
        path: "/leave",
        expectedText: "Leave & Absence Management",
      },
      {
        name: "Payroll & Compensation",
        path: "/payroll",
        expectedText: "Payroll",
      },
      {
        name: "Recruitment & ATS",
        path: "/recruitment",
        expectedText: "Recruitment",
      },
      {
        name: "Expense Approvals & Claims",
        path: "/expenses",
        expectedText: "Expense",
      },
      {
        name: "Performance & OKR",
        path: "/performance",
        expectedText: "Performance",
      },
      {
        name: "Compliance & Audit",
        path: "/audit",
        expectedText: "Audit Trail",
      },
      {
        name: "System Settings",
        path: "/settings",
        expectedText: "Workspace & System Settings",
      },
    ];

    for (const mod of modules) {
      console.log(`Navigating to ${mod.name} (${mod.path})...`);
      const navItem = page.locator(`aside a[href="${mod.path}"]`).first();
      await expect(navItem).toBeVisible();
      await navItem.click();

      // Ensure URL updated
      await expect(page).toHaveURL(new RegExp(mod.path));

      // Ensure content loaded
      await expect(
        page.getByText(mod.expectedText, { exact: false }).first(),
      ).toBeVisible({ timeout: 10000 });

      // Ensure sidebar highlight is active (has bg-primary)
      await expect(navItem).toHaveClass(/bg-primary/);
    }

    // 3. Verify Profile Dropdown
    const profileBtn = page
      .getByRole("button", { name: /Alex Thorne|Akun/i })
      .first();
    await profileBtn.click();
    const myProfileItem = page.getByText(/My Profile & Password/i);
    await expect(myProfileItem).toBeVisible();
    await myProfileItem.click();

    await expect(page).toHaveURL(/.*\/profile/);
    await expect(
      page.getByText("Profil Karyawan & Keamanan").first(),
    ).toBeVisible({ timeout: 10000 });

    // 4. Assert zero fatal page errors and zero failed static JS requests
    const criticalFailed = failedRequests.filter(
      (r) =>
        r.includes(".vite/deps") || r.includes(".js") || r.includes(".astro"),
    );
    expect(pageErrors).toEqual([]);
    expect(criticalFailed).toEqual([]);
    console.log(
      "✅ ALL PAGES AND NAVIGATION TEST PASSED 100% WITH ZERO ERRORS!",
    );
  });
});
