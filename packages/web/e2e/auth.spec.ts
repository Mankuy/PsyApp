import { test, expect } from '@playwright/test'

test('homepage has title and login link', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/PsyApp/)
  await expect(page.locator('text=Empezá gratis')).toBeVisible()
})

test('therapist can login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'facundo.galetta@gmail.com')
  await page.fill('input[type="password"]', 'fafafafa')
  await page.click('button:has-text("Ingresar")')
  await expect(page.locator('text=Panel')).toBeVisible()
})
