import { test, expect } from "@playwright/test";

const SUPABASE_URL = "https://test-project.supabase.mock";

function okJson(body: unknown, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  } as const;
}

test.describe.serial("PriorityMatrix E2E", () => {
  test("magic link request shows success message", async ({ page }) => {
    await page.route(`${SUPABASE_URL}/rest/v1/rpc/check_user_capacity`, (route) => {
      if (route.request().method() === "OPTIONS") {
        return route.fulfill({ status: 204 });
      }
      return route.fulfill(
        okJson([
          {
            capacity_reached: false,
            is_existing_user: false,
            allow_signup: true,
          },
        ])
      );
    });

    await page.route(`${SUPABASE_URL}/auth/v1/otp`, (route) => {
      if (route.request().method() === "OPTIONS") {
        return route.fulfill({ status: 204 });
      }
      return route.fulfill(okJson({}));
    });

    await page.goto("/login");
    await page.getByLabel("Email Address").fill("tester@example.com");
    await page.getByRole("button", { name: "Send Magic Link" }).click();

    await expect(
      page.getByText("Success! Check your email for a login link.")
    ).toBeVisible();
  });

  test("capacity limit reroutes to capacity page", async ({ page }) => {
    await page.route(`${SUPABASE_URL}/rest/v1/rpc/check_user_capacity`, (route) => {
      if (route.request().method() === "OPTIONS") {
        return route.fulfill({ status: 204 });
      }
      return route.fulfill(
        okJson([
          {
            capacity_reached: true,
            is_existing_user: false,
            allow_signup: false,
          },
        ])
      );
    });

    await page.goto("/login");
    await page.getByLabel("Email Address").fill("blocked@example.com");
    await page.getByRole("button", { name: "Send Magic Link" }).click();

    await page.waitForURL("**/capacity");
    await expect(page.getByRole("heading", { name: "Capacity Reached" })).toBeVisible();
  });

  test("authenticated user can manage tasks and see rate limit messaging", async ({ page }) => {
    const user = {
      id: "user-1",
      email: "tester@example.com",
    };

    let tasks = [
      {
        id: "task-1",
        created_at: new Date().toISOString(),
        user_id: user.id,
        title: "Prepare roadmap",
        due_date: null,
        importance: 80,
        urgency: 70,
        status: "todo",
        position: 0,
        completed_at: null,
      },
      {
        id: "task-2",
        created_at: new Date().toISOString(),
        user_id: user.id,
        title: "Book user interviews",
        due_date: null,
        importance: 60,
        urgency: 30,
        status: "scheduled",
        position: 0,
        completed_at: null,
      },
    ];

    await page.route(`${SUPABASE_URL}/auth/v1/:path*`, (route) => {
      const request = route.request();
      const method = request.method();
      const url = request.url();
      if (method === "OPTIONS") {
        return route.fulfill({ status: 204 });
      }

      if (url.includes("/token")) {
        return route.fulfill(
          okJson({
            access_token: "test-access",
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: "test-refresh",
            user,
          })
        );
      }

      if (url.endsWith("/user")) {
        return route.fulfill(okJson(user));
      }

      if (url.endsWith("/logout")) {
        return route.fulfill(okJson({}));
      }

      return route.fulfill(okJson({}));
    });

    await page.route(`${SUPABASE_URL}/rest/v1/rpc/ensure_user_slot`, (route) => {
      if (route.request().method() === "OPTIONS") {
        return route.fulfill({ status: 204 });
      }
      return route.fulfill(okJson(null));
    });

    await page.route(`${SUPABASE_URL}/rest/v1/rpc/check_user_capacity`, (route) => {
      if (route.request().method() === "OPTIONS") {
        return route.fulfill({ status: 204 });
      }
      return route.fulfill(
        okJson([
          {
            capacity_reached: false,
            is_existing_user: true,
            allow_signup: true,
          },
        ])
      );
    });

    let insertAttempts = 0;

    await page.route(`${SUPABASE_URL}/rest/v1/todos`, async (route) => {
      const method = route.request().method();

      if (method === "OPTIONS") {
        return route.fulfill({ status: 204 });
      }

      if (method === "GET") {
        return route.fulfill(okJson(tasks));
      }

      if (method === "POST") {
        if (insertAttempts === 0) {
          insertAttempts += 1;
          return route.fulfill(
            okJson(
              {
                message: "TASK_RATE_LIMIT: wait a second",
              },
              400
            )
          );
        }

        insertAttempts += 1;
        const payload = (await route.request().postDataJSON()) as [typeof tasks[number]];
        const body = payload[0];
        const newTask = {
          ...body,
          id: `task-${insertAttempts + 2}`,
          created_at: new Date().toISOString(),
          user_id: user.id,
          completed_at: null,
        };
        tasks = [newTask, ...tasks];
        return route.fulfill(okJson([newTask], 201));
      }

      if (method === "PATCH") {
        const url = new URL(route.request().url());
        const id = url.searchParams.get("id")?.replace("eq.", "");
        const body = (await route.request().postDataJSON()) as Partial<typeof tasks[number]>;
        tasks = tasks.map((task) => (task.id === id ? { ...task, ...body } : task));
        return route.fulfill(okJson([]));
      }

      if (method === "DELETE") {
        const url = new URL(route.request().url());
        const id = url.searchParams.get("id")?.replace("eq.", "");
        tasks = tasks.filter((task) => task.id !== id);
        return route.fulfill({ status: 204 });
      }

      return route.fulfill(okJson([]));
    });

    await page.route(`${SUPABASE_URL}/rest/v1/todos?*`, (route) => {
      const method = route.request().method();
      if (method === "OPTIONS") {
        return route.fulfill({ status: 204 });
      }
      if (method === "GET") {
        return route.fulfill(okJson(tasks));
      }
      return route.continue();
    });

    await page.goto("/");
    await page.evaluate(() => {
      sessionStorage.setItem("post-auth-redirect", "/todos");
    });

    await page.goto("/auth/callback#access_token=test&refresh_token=test&type=recovery");
    await page.waitForURL("**/todos");
    await expect(page.getByRole("heading", { name: "My Tasks" })).toBeVisible();

    const todoColumnHeader = page.getByText("To Do");
    await expect(todoColumnHeader).toBeVisible();

    const deleteButton = page.locator('button[aria-label="Delete task"]').first();
    await deleteButton.click({ force: true });
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Task deleted.")).toBeVisible();

    await page.goto("/add-todo");
    await page.getByLabel("What needs to be done?").fill("Launch beta");
    await page.getByRole("button", { name: "Next: Position on Matrix" }).click();

    await page.getByRole("button", { name: "Confirm Position" }).click();
    await expect(
      page.getByText("Easy there! You can only add one task per second. Please try again.")
    ).toBeVisible();

    await page.getByRole("button", { name: "Confirm Position" }).click();
    await page.waitForURL("**/todos");
    await expect(page.getByText("Launch beta")).toBeVisible();
  });
});
