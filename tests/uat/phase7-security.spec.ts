import { test, expect } from '@playwright/test';

const uatUsers = {
  customer: { email: 'uat-customer@mirealestate.com', password: 'UATTestPassword123!' },
  admin: { email: 'uat-chairman@mirealestate.com', password: 'UATTestPassword123!' }
};

test.describe('Phase 7 - Security & Authorization', () => {

  test('Customer cannot access Admin Dashboard URL directly', async ({ page }) => {
    // Login as Customer
    await page.goto('/login');
    await page.fill('input[type="email"]', uatUsers.customer.email);
    await page.fill('input[type="password"]', uatUsers.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Attempt to access admin route
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be redirected away or shown unauthorized
    expect(page.url()).not.toContain('/admin/dashboard');
  });

  test('Unauthenticated user cannot access Portal or Admin', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/login');

    await page.goto('/portal/dashboard');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/login');
  });

});
