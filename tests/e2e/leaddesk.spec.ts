import { expect, test } from "@playwright/test";

test("public page contains the required form, validation, and exact credit", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Turn a project idea",
  );
  await expect(page.getByLabel("Name")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Budget range")).toBeVisible();
  await expect(page.getByLabel("Project details")).toBeVisible();

  await page.getByLabel("Email").fill("invalid-email");
  await page.getByRole("button", { name: "Send project request" }).click();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();

  const credit = page.getByRole("link", {
    name: "Built for Digital Heroes Training Task",
  });
  await expect(credit).toHaveAttribute("href", "https://digitalheroesco.com");
});

test("admin route is protected in a fresh browser", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Administrator login" }),
  ).toBeVisible();
});

test("production journey stores, searches, and updates a lead", async ({
  page,
}) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  test.skip(!email || !password, "Production administrator credentials required.");

  const unique = Date.now();
  const leadName = `Verification Lead ${unique}`;
  const leadEmail = `verification.${unique}@example.com`;

  await page.goto("/");
  await page.getByLabel("Name").fill(leadName);
  await page.getByLabel("Email").fill(leadEmail);
  await page.getByLabel("Budget range").selectOption("1000-5000");
  await page
    .getByLabel("Project details")
    .fill("I need a responsive Shopify storefront for a clothing brand.");
  const leadResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/leads") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Send project request" }).click();
  const leadResponse = await leadResponsePromise;
  if (!leadResponse.ok()) {
    const body = (await leadResponse.json()) as { error?: string };
    throw new Error(
      `Lead creation failed (${leadResponse.status()}): ${body.error ?? "Unknown error"}`,
    );
  }
  await expect(page.getByRole("status")).toContainText("received", {
    timeout: 10_000,
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password", { exact: true }).fill(password!);
  const sessionResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/auth/session") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Sign in securely" }).click();
  const sessionResponse = await sessionResponsePromise;
  if (!sessionResponse.ok()) {
    const body = (await sessionResponse.json()) as { error?: string };
    throw new Error(
      `Session creation failed (${sessionResponse.status()}): ${body.error ?? "Unknown error"}`,
    );
  }
  await expect(page).toHaveURL(/\/admin$/);

  await page.getByRole("searchbox").fill(leadEmail);
  await expect(page.getByText(leadName)).toBeVisible();
  const statusResponsePromise = page.waitForResponse(
    (response) =>
      /\/api\/leads\/[^/]+$/.test(new URL(response.url()).pathname) &&
      response.request().method() === "PATCH",
  );
  await page.getByLabel(`Status for ${leadName}`).selectOption("closed");
  const statusResponse = await statusResponsePromise;
  if (!statusResponse.ok()) {
    const body = (await statusResponse.json()) as { error?: string };
    throw new Error(
      `Status update failed (${statusResponse.status()}): ${body.error ?? "Unknown error"}`,
    );
  }
  await expect(page.getByLabel(`Status for ${leadName}`)).toHaveValue("closed");
  await page.reload();
  await page.getByRole("searchbox").fill(leadEmail);
  await expect(page.getByLabel(`Status for ${leadName}`)).toHaveValue("closed");
});
