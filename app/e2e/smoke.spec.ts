import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("home page loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await expect(page).toHaveTitle(/Caba Residence/i);
    await expect(page.locator("header")).toBeVisible();

    // No console errors
    const criticalErrors = errors.filter(
      (e) => !e.includes("Warning") && !e.includes("favicon")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("header navigation links work", async ({ page }) => {
    await page.goto("/");

    // Navigate to Chambres
    await page.click("text=Chambres");
    await expect(page).toHaveURL(/\/logements/);
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("Property listing (/logements)", () => {
  test("page loads and shows properties or empty state", async ({ page }) => {
    await page.goto("/logements");

    // Page should have a header
    await expect(page.locator("header")).toBeVisible();

    // Either properties are listed or an empty state is shown
    const hasContent =
      (await page.locator("[data-testid='property-card']").count()) > 0 ||
      (await page.locator("text=Aucun logement").isVisible()) ||
      (await page.locator("text=disponible").isVisible());
    expect(hasContent).toBeTruthy();
  });

  test("search form is present and sticky", async ({ page }) => {
    await page.goto("/logements");

    // Search bar should be present
    const searchBar = page.locator(".search-bar-compact, .logements-search-wrap");
    await expect(searchBar.first()).toBeVisible();
  });
});

test.describe("Property detail page", () => {
  test("property detail page loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    // First go to listings to find a property
    await page.goto("/logements");

    // Find any property link and navigate to it
    const propertyLink = page.locator("a[href^='/logements/']").first();
    const count = await propertyLink.count();

    if (count > 0) {
      await propertyLink.click();
      await page.waitForURL(/\/logements\/[^/]+$/);

      // Page should have a title
      await expect(page.locator("h1")).toBeVisible();

      // No critical console errors
      const criticalErrors = errors.filter(
        (e) =>
          !e.includes("Warning") &&
          !e.includes("favicon") &&
          !e.includes("404")
      );
      expect(criticalErrors).toHaveLength(0);
    }
  });

  test("reserve button navigates to checkout", async ({ page }) => {
    await page.goto("/logements");

    const propertyLink = page.locator("a[href^='/logements/']").first();
    const count = await propertyLink.count();

    if (count > 0) {
      await propertyLink.click();
      await page.waitForURL(/\/logements\/[^/]+$/);

      // Click reserve button
      const reserveBtn = page.locator("text=Réserver, a[href*='reserver']").first();
      if (await reserveBtn.isVisible()) {
        await reserveBtn.click();
        // Should navigate to checkout
        await expect(page).toHaveURL(/\/reserver/);
      }
    }
  });
});

test.describe("Auth pages", () => {
  test("connexion page loads", async ({ page }) => {
    await page.goto("/connexion");
    await expect(page.locator("text=Connexion").first()).toBeVisible();
  });

  test("inscription page loads", async ({ page }) => {
    await page.goto("/inscription");
    await expect(page.locator("text=Inscription").first()).toBeVisible();
  });
});
