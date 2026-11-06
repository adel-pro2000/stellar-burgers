import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const API_URL_PATTERN = '**/api/**';
const INGREDIENTS_HAR = 'tests/hars/ingredients.har';
const ORDER_HAR = 'tests/hars/order.har';

const ACCESS_TOKEN = 'Bearer test-access-token';
const REFRESH_TOKEN = 'test-refresh-token';
const ORDER_NUMBER = '94215';
const USER_NAME = 'Студент';

const bun = {
  id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
  price: 1255,
};

const anotherBun = {
  id: '643d69a5c3f7b9001cfa093d',
  name: 'Флюоресцентная булка R2-D3',
};

const main = {
  id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  price: 424,
  calories: '4242',
  proteins: '420',
  fat: '142',
  carbohydrates: '242',
};

const sauce = {
  id: '643d69a5c3f7b9001cfa0942',
  name: 'Соус Spicy-X',
  price: 90,
};

const getIngredientCard = (page: Page, id: string): Locator =>
  page.getByTestId(`ingredient-${id}`);

const addIngredient = async (page: Page, id: string): Promise<void> => {
  await getIngredientCard(page, id).getByText('Добавить').click();
};

test.beforeEach(async ({ page }) => {
  // все запросы к бэкенду подменяются ответами из HAR-файлов,
  // запрос, которого нет в HAR-файле, обрывается и до сервера не доходит
  await page.routeFromHAR(INGREDIENTS_HAR, {
    url: API_URL_PATTERN,
    notFound: 'abort',
  });
});

test.describe('add ingredients to constructor works correctly', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(getIngredientCard(page, bun.id)).toBeVisible();
  });

  test('булка добавляется в верхнюю и нижнюю часть конструктора', async ({ page }) => {
    const burgerConstructor = page.getByTestId('burger-constructor');

    await expect(burgerConstructor).toContainText('Выберите булки');

    await addIngredient(page, bun.id);

    await expect(burgerConstructor).toContainText(`${bun.name} (верх)`);
    await expect(burgerConstructor).toContainText(`${bun.name} (низ)`);
    await expect(burgerConstructor).not.toContainText('Выберите булки');
    await expect(burgerConstructor).toContainText(String(bun.price * 2));
  });

  test('начинка и соус добавляются в середину конструктора', async ({ page }) => {
    const burgerConstructor = page.getByTestId('burger-constructor');

    await expect(burgerConstructor).toContainText('Выберите начинку');

    await addIngredient(page, main.id);
    await addIngredient(page, sauce.id);

    await expect(burgerConstructor).toContainText(main.name);
    await expect(burgerConstructor).toContainText(sauce.name);
    await expect(burgerConstructor).not.toContainText('Выберите начинку');
    await expect(burgerConstructor).toContainText(String(main.price + sauce.price));
  });

  test('новая булка заменяет ранее добавленную', async ({ page }) => {
    const burgerConstructor = page.getByTestId('burger-constructor');

    await addIngredient(page, bun.id);
    await addIngredient(page, anotherBun.id);

    await expect(burgerConstructor).toContainText(`${anotherBun.name} (верх)`);
    await expect(burgerConstructor).toContainText(`${anotherBun.name} (низ)`);
    await expect(burgerConstructor).not.toContainText(bun.name);
  });
});

test.describe('ingredient modal works correctly', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await getIngredientCard(page, main.id).getByRole('link').click();
  });

  test('по клику на ингредиент открывается модальное окно с его данными', async ({
    page,
  }) => {
    const modal = page.getByTestId('modal');

    await expect(modal).toBeVisible();
    await expect(page).toHaveURL(`/ingredients/${main.id}`);
    await expect(modal).toContainText('Детали ингредиента');
    await expect(modal).toContainText(main.name);
    await expect(modal).toContainText(main.calories);
    await expect(modal).toContainText(main.proteins);
    await expect(modal).toContainText(main.fat);
    await expect(modal).toContainText(main.carbohydrates);
    await expect(modal).not.toContainText(sauce.name);
  });

  test('модальное окно закрывается по клику на крестик', async ({ page }) => {
    await expect(page.getByTestId('modal')).toBeVisible();

    await page.getByTestId('modal-close').click();

    await expect(page.getByTestId('modal')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('модальное окно закрывается по клику на оверлей', async ({ page }) => {
    await expect(page.getByTestId('modal')).toBeVisible();

    // кликаем в угол оверлея, чтобы не попасть по самому модальному окну
    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });

    await expect(page.getByTestId('modal')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });
});

test.describe('order creation works correctly', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    // фейковые токены авторизации: в приложении accessToken хранится в cookie,
    // refreshToken - в localStorage
    await context.addCookies([
      {
        name: 'accessToken',
        value: encodeURIComponent(ACCESS_TOKEN),
        url: baseURL,
      },
    ]);
    await page.addInitScript((refreshToken) => {
      localStorage.setItem('refreshToken', refreshToken);
    }, REFRESH_TOKEN);

    // данные пользователя и ответ на создание заказа
    await page.routeFromHAR(ORDER_HAR, {
      url: API_URL_PATTERN,
      notFound: 'fallback',
    });

    await page.goto('/');
    await expect(page.getByText(USER_NAME)).toBeVisible();
  });

  test.afterEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('после оформления заказа показывается его номер и очищается конструктор', async ({
    page,
  }) => {
    const burgerConstructor = page.getByTestId('burger-constructor');

    await addIngredient(page, bun.id);
    await addIngredient(page, main.id);
    await addIngredient(page, sauce.id);

    await expect(burgerConstructor).toContainText(`${bun.name} (верх)`);
    await expect(burgerConstructor).toContainText(main.name);
    await expect(burgerConstructor).toContainText(sauce.name);

    const orderRequestPromise = page.waitForRequest(
      (request) => request.url().endsWith('/api/orders') && request.method() === 'POST'
    );

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const orderRequest = await orderRequestPromise;
    expect(orderRequest.headers().authorization).toBe(ACCESS_TOKEN);
    expect(orderRequest.postDataJSON()).toEqual({
      ingredients: [bun.id, main.id, sauce.id, bun.id],
    });

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('order-number')).toHaveText(ORDER_NUMBER);

    await expect(burgerConstructor).toContainText('Выберите булки');
    await expect(burgerConstructor).toContainText('Выберите начинку');
    await expect(burgerConstructor).not.toContainText(bun.name);
    await expect(burgerConstructor).not.toContainText(main.name);
    await expect(burgerConstructor).not.toContainText(sauce.name);

    await page.getByTestId('modal-close').click();

    await expect(modal).toHaveCount(0);
  });
});
