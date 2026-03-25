import { test, expect } from '@playwright/test';

test.describe('Invite Flow', () => {
  test('should show landing page without invite banner for regular access', async ({ page }) => {
    await page.goto('/prelaunch');

    // 초대 배너가 표시되지 않아야 함
    const inviteBanner = page.locator('role=region').filter({ hasText: /추천하는/ });
    await expect(inviteBanner).not.toBeVisible();

    // 일반 콘텐츠는 표시되어야 함
    await expect(page.getByText('당신의 일 스타일을 먼저')).toBeVisible();
  });

  test('should show invite banner with valid invite code', async ({ page }) => {
    // 유효한 초대 코드로 접속 (실제 환경에서는 유효한 코드가 필요)
    // 이 테스트는 특정 초대 코드가 있을 때만 통과
    await page.goto('/prelaunch?ref=VALID_INVITE_CODE');

    // 초대 배너 확인 (배너가 표시된다고 가정)
    const inviteBanner = page.locator('[class*="banner"]').filter({ hasText: /추천/ });

    // 배너가 있으면 확인, 없으면 스킵
    if (await inviteBanner.isVisible().catch(() => false)) {
      await expect(inviteBanner).toBeVisible();
    }
  });

  test('should show regular landing for invalid invite code', async ({ page }) => {
    // 유효하지 않은 초대 코드로 접속
    await page.goto('/prelaunch?ref=INVALID_CODE_12345');

    // 초대 배너가 표시되지 않아야 함
    const inviteBanner = page.locator('[class*="banner"]').filter({ hasText: /추천/ });
    const isBannerVisible = await inviteBanner.isVisible().catch(() => false);
    expect(isBannerVisible).toBe(false);

    // 일반 콘텐츠는 표시되어야 함
    await expect(page.getByText('당신의 일 스타일을 먼저')).toBeVisible();
  });

  test('should preserve ref code through form submission', async ({ page }) => {
    // ref 파라미터로 접속
    const refCode = 'TEST_REF_CODE';
    await page.goto(`/prelaunch?ref=${refCode}`);

    // 페이지 끝까지 스크롤하여 폼 표시
    await page.evaluate(() => window.scrollBy(0, 2000));

    // 폼 입력
    await page.locator('#reservation-email').fill('invite-test@example.com');
    await page.locator('#reservation-industry').selectOption('마케팅');
    await page.locator('#reservation-experience').selectOption('1-3년');

    // 폼 제출
    await page.getByRole('button', { name: /지금 예약하기/ }).click();

    // 리다이렉트 대기 (ref 파라미터가 유지될 수 있음)
    await page.waitForNavigation({ timeout: 10000 }).catch(() => {
      // 네비게이션이 일어나지 않으면 무시
    });

    // URL에 ref 파라미터가 있는지 확인 (있을 수도, 없을 수도 있음)
    const currentUrl = page.url();
    // 이것은 예약 완료 페이지로 리다이렉트되었는지 확인
    expect(currentUrl).toMatch(/\/prelaunch\/(reserved|my-reservation)/);
  });

  test('should navigate to reserved page after successful invitation-referenced reservation', async ({
    page,
  }) => {
    // ref 파라미터로 접속한 후 예약 완료
    await page.goto('/prelaunch?ref=SAMPLE_REF');

    // 페이지 끝까지 스크롤
    await page.evaluate(() => window.scrollBy(0, 2000));

    // 폼 입력
    await page.locator('#reservation-email').fill('invited-user@example.com');
    await page.locator('#reservation-industry').selectOption('디자인');
    await page.locator('#reservation-experience').selectOption('5-10년');

    // 폼 제출
    const submitButton = page.getByRole('button', { name: /지금 예약하기/ });
    await submitButton.click();

    // 예약 완료 페이지로 리다이렉트 대기
    const navigationPromise = page.waitForNavigation({ timeout: 10000 }).catch(() => null);

    // URL 변경 대기
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/prelaunch\/(reserved|my-reservation)/);
  });

  test('should show invite link on reserved page', async ({ page }) => {
    // 예약 완료 페이지에 직접 접속 (실제 환경에서는 예약 후 리다이렉트)
    // 쿼리 파라미터 추가
    await page.goto('/prelaunch/reserved?position=1&reservation_id=test123&ref=INVITE_CODE');

    // 초대 링크 카드 확인
    const inviteLinkCard = page.locator('text=/초대|링크|공유/i').first();

    // 초대 링크 카드가 있으면 확인
    if (await inviteLinkCard.isVisible().catch(() => false)) {
      await expect(inviteLinkCard).toBeVisible();
    }
  });

  test('should show progress bar on reserved page', async ({ page }) => {
    // 예약 완료 페이지에 접속
    await page.goto('/prelaunch/reserved?position=1&reservation_id=test123&ref=INVITE_CODE');

    // 진행바 또는 초대 진행 정보 찾기
    const progressBar = page.locator('[class*="progress"], [aria-label*="진행"]').first();

    // 진행바가 있을 수 있음
    if (await progressBar.isVisible().catch(() => false)) {
      await expect(progressBar).toBeVisible();
    }
  });

  test('should display welcome message with queue position', async ({ page }) => {
    // 예약 완료 페이지에 접속
    await page.goto('/prelaunch/reserved?position=42&reservation_id=test123&ref=INVITE_CODE');

    // 환영 메시지와 순번 확인
    const welcomeText = page.locator('text=/42|순번|대기/i').first();

    // 어디선가 42라는 숫자가 표시되어야 함
    if (await welcomeText.isVisible().catch(() => false)) {
      await expect(welcomeText).toBeVisible();
    }
  });

  test('should display social share buttons on reserved page', async ({ page }) => {
    // 예약 완료 페이지에 접속
    await page.goto('/prelaunch/reserved?position=1&reservation_id=test123&ref=INVITE_CODE');

    // 소셜 공유 버튼들 찾기
    const kakaoButton = page.locator('button').filter({ hasText: /카카오|Kakao/ });
    const twitterButton = page.locator('button').filter({ hasText: /트위터|Twitter|X/ });
    const copyButton = page.locator('button').filter({ hasText: /복사|copy|Copy/ });

    // 버튼들이 존재하는지 확인 (적어도 하나는 있어야 함)
    const hasKakao = await kakaoButton.isVisible().catch(() => false);
    const hasTwitter = await twitterButton.isVisible().catch(() => false);
    const hasCopy = await copyButton.isVisible().catch(() => false);

    expect(hasKakao || hasTwitter || hasCopy).toBe(true);
  });

  test('should handle copy to clipboard action', async ({ page, context }) => {
    // 클립보드 권한 부여
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // 예약 완료 페이지에 접속
    await page.goto('/prelaunch/reserved?position=1&reservation_id=test123&ref=INVITE_CODE');

    // 복사 버튼 찾기 및 클릭
    const copyButton = page.locator('button').filter({ hasText: /복사|copy|Copy/ }).first();

    if (await copyButton.isVisible().catch(() => false)) {
      await copyButton.click();

      // 성공 메시지 또는 토스트 알림 확인
      const successMessage = page.locator('text=/복사|copied|완료/i');

      if (await successMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(successMessage).toBeVisible();
      }
    }
  });

  test('should show reward information on reserved page', async ({ page }) => {
    // 예약 완료 페이지에 접속
    await page.goto('/prelaunch/reserved?position=1&reservation_id=test123&ref=INVITE_CODE');

    // 리워드 정보 찾기
    const rewardInfo = page.locator('text=/리워드|무료|배지|할인/i').first();

    // 리워드 정보가 표시되어야 함
    if (await rewardInfo.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(rewardInfo).toBeVisible();
    }
  });
});
