import { test, expect } from '@playwright/test';

test('catalog to COD works with AI disabled', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.variant-card').first()).toBeVisible();

  await page
    .locator('.variant-card')
    .filter({ hasText: 'Còn hàng' })
    .first()
    .getByRole('link', { name: /Xem cấu hình|Chi tiết/i })
    .click();

  await expect(page.getByRole('link', { name: /Chọn mua COD|Mua COD/i })).toBeVisible();
  await page.getByRole('link', { name: /Chọn mua COD|Mua COD/i }).click();

  await page.getByLabel('Họ và tên').fill('Nguyen Van A');
  await page.getByLabel('Số điện thoại').fill('0912345678');
  await page.getByLabel('Địa chỉ giao hàng').fill('123 Nguyen Trai, Phuong Thuong Dinh, Ha Noi');
  await page.getByRole('button', { name: 'Xem trước đơn COD' }).click();

  await expect(page.getByText('Chưa giữ tồn kho.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Xác nhận đặt COD' }).click();
  await expect(page.getByText('CONFIRMED_COD')).toBeVisible();
});

test('AI disabled leaves direct purchase available alongside chat drawer', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: /Tư vấn AI|Chat/i })
    .first()
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');

  await page
    .locator('.variant-card')
    .filter({ hasText: 'Còn hàng' })
    .first()
    .getByRole('link', { name: /Xem cấu hình|Chi tiết/i })
    .click();
  await expect(page.getByRole('link', { name: /Chọn mua COD|Mua COD/i })).toBeVisible();
});

test('admin routes redirect unauthenticated visitors and allow login', async ({ page }) => {
  await page.goto('/admin/catalog');
  await expect(page).toHaveURL(/\/admin\/login$/);

  test.skip(
    !process.env.E2E_ADMIN_USERNAME || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_USERNAME and E2E_ADMIN_PASSWORD to run authenticated admin E2E.'
  );

  await page.getByLabel('Tên đăng nhập').fill(process.env.E2E_ADMIN_USERNAME!);
  await page.getByLabel('Mật khẩu').fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: /Đăng nhập/i }).click();

  await expect(page).toHaveURL(/\/admin/);
  await page.goto('/admin/catalog');
  await expect(page).toHaveURL(/\/admin\/catalog/);
  await page.goto('/admin/chat');
  await expect(page).toHaveURL(/\/admin\/chat/);
});

test('admin claim, reply and release are reflected in guest chat', async ({ page, browser }) => {
  test.skip(
    !process.env.E2E_ADMIN_USERNAME || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_USERNAME and E2E_ADMIN_PASSWORD to run HITL E2E.'
  );

  await page.goto('/');
  await page
    .getByRole('button', { name: /Tư vấn AI|Chat/i })
    .first()
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();

  const humanBtn = page.getByRole('button', { name: /Gặp nhân viên/i }).first();
  await expect(humanBtn).toBeEnabled();
  await humanBtn.click();

  const sessionId = await page.evaluate(async () => {
    const response = await fetch('/api/v1/chat/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    });
    return ((await response.json()) as { session_id: string }).session_id;
  });

  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  try {
    await admin.goto('/admin/login');
    await admin.getByLabel('Tên đăng nhập').fill(process.env.E2E_ADMIN_USERNAME!);
    await admin.getByLabel('Mật khẩu').fill(process.env.E2E_ADMIN_PASSWORD!);
    await admin.getByRole('button', { name: /Đăng nhập/i }).click();

    await admin.goto('/admin/chat');
    await admin.getByRole('button', { name: new RegExp(sessionId.slice(0, 8)) }).click();
    await admin.getByRole('button', { name: /Nhận phiên/i }).click();

    await admin.getByLabel(/Trả lời/i).fill('Nhân viên đang hỗ trợ bạn.');
    await admin.getByRole('button', { name: 'Gửi', exact: true }).click();
    await expect(page.getByText('Nhân viên đang hỗ trợ bạn.')).toBeVisible({ timeout: 12_000 });

    await admin.getByRole('button', { name: /Trả về AI/i }).click();
  } finally {
    await adminContext.close();
  }
});
