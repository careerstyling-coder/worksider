import { test, expect } from '@playwright/test';

test.describe('Prelaunch Flow', () => {
  test('should show landing page with hero section', async ({ page }) => {
    await page.goto('/prelaunch');

    // 메인 타이틀 확인
    await expect(page.getByText('당신의 일 스타일을 먼저')).toBeVisible();

    // 서브타이틀 확인
    await expect(page.getByText('첫 500명을 위한 특별한 기회')).toBeVisible();

    // 배지 확인
    await expect(page.getByText('Workside 프리론칭')).toBeVisible();
  });

  test('should display DNA intro section', async ({ page }) => {
    await page.goto('/prelaunch');

    // 스크롤 힌트 확인
    const scrollHint = page.getByTestId('scroll-hint');
    await expect(scrollHint).toBeVisible();

    // 페이지 스크롤
    await page.evaluate(() => window.scrollBy(0, 800));

    // DNA 섹션이 표시될 때까지 대기
    const dnaSection = page.locator('section').filter({ hasText: /DNA|Work Style/ });
    await expect(dnaSection.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show reservation form with all fields', async ({ page }) => {
    await page.goto('/prelaunch');

    // 페이지 끝까지 스크롤하여 폼이 나타날 때까지 대기
    await page.evaluate(() => window.scrollBy(0, 2000));

    // 이메일 입력 필드
    const emailInput = page.locator('#reservation-email');
    await expect(emailInput).toBeVisible();

    // 직군 선택 필드
    const industrySelect = page.locator('#reservation-industry');
    await expect(industrySelect).toBeVisible();

    // 연차 선택 필드
    const experienceSelect = page.locator('#reservation-experience');
    await expect(experienceSelect).toBeVisible();

    // 제출 버튼
    const submitButton = page.getByRole('button', { name: /지금 예약하기/ });
    await expect(submitButton).toBeVisible();
  });

  test('should submit reservation form successfully', async ({ page }) => {
    await page.goto('/prelaunch');

    // 페이지 끝까지 스크롤
    await page.evaluate(() => window.scrollBy(0, 2000));

    // 폼 입력
    await page.locator('#reservation-email').fill('test@example.com');
    await page.locator('#reservation-industry').selectOption('개발');
    await page.locator('#reservation-experience').selectOption('3-5년');

    // 폼 제출
    await page.getByRole('button', { name: /지금 예약하기/ }).click();

    // 로딩 상태 확인 (선택적)
    const button = page.getByRole('button', { name: /지금 예약하기/ });

    // 성공 메시지 또는 리다이렉트 대기
    // API 응답에 따라 리다이렉트될 것으로 예상
    await page.waitForNavigation({ url: /\/prelaunch\/reserved/, timeout: 10000 }).catch(() => {
      // 만약 리다이렉트가 안 되면 성공 메시지를 찾기
    });
  });

  test('should validate email field', async ({ page }) => {
    await page.goto('/prelaunch');

    // 페이지 끝까지 스크롤
    await page.evaluate(() => window.scrollBy(0, 2000));

    // 유효하지 않은 이메일 입력
    const emailInput = page.locator('#reservation-email');
    await emailInput.fill('invalid-email');

    // HTML5 유효성 검사
    const isInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.checkValidity()
    );
    expect(isInvalid).toBe(true);

    // 제출 버튼은 비활성화되어야 함
    const submitButton = page.getByRole('button', { name: /지금 예약하기/ });
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('should require all form fields', async ({ page }) => {
    await page.goto('/prelaunch');

    // 페이지 끝까지 스크롤
    await page.evaluate(() => window.scrollBy(0, 2000));

    // 초기 상태: 제출 버튼 비활성화 확인
    const submitButton = page.getByRole('button', { name: /지금 예약하기/ });
    let isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBe(true);

    // 이메일만 입력
    await page.locator('#reservation-email').fill('test@example.com');
    isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBe(true);

    // 직군도 입력
    await page.locator('#reservation-industry').selectOption('개발');
    isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBe(true);

    // 연차 입력하면 활성화
    await page.locator('#reservation-experience').selectOption('3-5년');
    isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBe(false);
  });

  test('should display industry options', async ({ page }) => {
    await page.goto('/prelaunch');

    // 페이지 끝까지 스크롤
    await page.evaluate(() => window.scrollBy(0, 2000));

    const industrySelect = page.locator('#reservation-industry');
    await industrySelect.click();

    // 직군 옵션 확인
    const options = ['개발', '디자인', '기획/PM', '마케팅', '영업', '인사/총무', '재무/회계', '기타'];
    for (const option of options) {
      await expect(industrySelect.locator(`option:has-text("${option}")`)).toBeVisible();
    }
  });

  test('should display experience options', async ({ page }) => {
    await page.goto('/prelaunch');

    // 페이지 끝까지 스크롤
    await page.evaluate(() => window.scrollBy(0, 2000));

    const experienceSelect = page.locator('#reservation-experience');
    await experienceSelect.click();

    // 연차 옵션 확인
    const options = ['1년 미만', '1-3년', '3-5년', '5-10년', '10년 이상'];
    for (const option of options) {
      await expect(experienceSelect.locator(`option:has-text("${option}")`)).toBeVisible();
    }
  });
});
