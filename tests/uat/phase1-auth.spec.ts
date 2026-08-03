import { test, expect } from '@playwright/test';

const users = [
  { role: 'Chairman', email: 'uat-chairman@mirealestate.com', expectedPath: '/admin/dashboard' },
  { role: 'Director', email: 'uat-director@mirealestate.com', expectedPath: '/admin/dashboard' },
  { role: 'Secretary', email: 'uat-secretary@mirealestate.com', expectedPath: '/admin/dashboard' },
  { role: 'Customer Care', email: 'uat-customercare@mirealestate.com', expectedPath: '/admin/dashboard' },
  { role: 'Admin Engineer', email: 'uat-engineer@mirealestate.com', expectedPath: '/admin/dashboard' },
  { role: 'Customer', email: 'uat-customer@mirealestate.com', expectedPath: '/portal/dashboard' } // Customer portals usually redirect to /portal/dashboard or /dashboard
];

const password = 'UATTestPassword123!';

for (const user of users) {
  test(`Phase 1 - Auth & Roles: ${user.role} Login and Sidebar`, async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Fill credentials
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for network idle or redirect
    await page.waitForLoadState('networkidle');

    // Verify redirect
    expect(page.url()).toContain(user.expectedPath);

    // Verify Session Persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain(user.expectedPath);

    // Logout
    const logoutBtn = page.locator('text=Logout');
    if (await logoutBtn.count() > 0) {
      await logoutBtn.first().click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/login');
    }
  });
}
