import { test, expect } from '@playwright/test';
import { loginData } from '../test-data/login.data';
import { PulpitPage } from '../pages/pulpit.page';

test.describe('Pulpit tests', () => {
  test.beforeEach(async ({ page }) => {
    const userId = loginData.userId;
    const userPassword = loginData.userPassword;

    await page.goto('/');
    await page.getByTestId('login-input').fill(userId);
    await page.getByTestId('password-input').fill(userPassword);
    await page.getByTestId('login-button').click();
  });

  test('quick payment with correct data', async ({ page }) => {
    // Arrange
    const receiverId = '2';
    const transferAmount = '150';
    const transferTitle = 'pizza';
    const expectedTransferReceiver = 'Chuck Demobankowy';

    // Act
    const pulpitPage = new PulpitPage(page)
    await pulpitPage.transferReceiverInput.selectOption(receiverId);
    await pulpitPage.transferTitleInput.fill(transferAmount);
    await pulpitPage.transferTitleInput.fill(transferTitle);

    await pulpitPage.transferButton.click();
    await pulpitPage.actionCloseButton.click();

    // Assert
    await expect(pulpitPage.messageText).toHaveText(
      `Przelew wykonany! ${expectedTransferReceiver} - ${transferAmount},00PLN - ${transferTitle}`
    );
  });

  test('successful mobile top-up', async ({ page }) => {
    // Arrange
    const topUpReceiver = '500 xxx xxx';
    const topUpAmount = '50';
    const expectedMessage = `Doładowanie wykonane! ${topUpAmount},00PLN na numer ${topUpReceiver}`;

    // Act
    const pulpitPage = new PulpitPage(page);
    await pulpitPage.topUpReceiverInput.selectOption(topUpReceiver);
    await pulpitPage.topUpAmountInput.fill(topUpAmount);
    await pulpitPage.topUpAgreementCheckbox.click();

    await pulpitPage.topUpExecuteButton.click();
    await pulpitPage.actionCloseButton.click();

    // Assert
    await expect(pulpitPage.messageText).toHaveText(expectedMessage);
  });

  test('correct balance after successful mobile top-up', async ({ page }) => {
    // Arrange
    const pulpitPage = new PulpitPage(page);
    const topUpReceiver = '500 xxx xxx';
    const topUpAmount = '50';
    const initialBalance = await pulpitPage.moneyValueText.innerText();
    const expectedBalance = Number(initialBalance) - Number(topUpAmount);

    // Act
    await pulpitPage.topUpReceiverInput.selectOption(topUpReceiver);
    await pulpitPage.topUpAmountInput.fill(topUpAmount);
    await pulpitPage.topUpAgreementCheckbox.click();

    await pulpitPage.topUpExecuteButton.click();
    await pulpitPage.actionCloseButton.click();

    // Assert
    await expect(pulpitPage.moneyValueText).toHaveText(`${expectedBalance}`);
  });
});
