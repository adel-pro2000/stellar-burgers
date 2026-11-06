import { describe, expect, test } from '@jest/globals';

import {
  addIngredient,
  burgerConstructorSlice,
  moveIngredient,
  removeIngredient,
} from '../burger-constructor';
import { createOrder } from '../order';

import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
  TOrder,
} from '@utils-types';

const constructorReducer = burgerConstructorSlice.reducer;

const REQUEST_ID = 'test-request-id';

const bun: TIngredient = {
  _id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'https://code.s3.yandex.net/react/code/bun-02.png',
  image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
};

const anotherBun: TIngredient = {
  ...bun,
  _id: '643d69a5c3f7b9001cfa093d',
  name: 'Флюоресцентная булка R2-D3',
  price: 988,
};

const main: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'https://code.s3.yandex.net/react/code/meat-01.png',
  image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
};

const sauce: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0942',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'https://code.s3.yandex.net/react/code/sauce-02.png',
  image_large: 'https://code.s3.yandex.net/react/code/sauce-02-large.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/sauce-02-mobile.png',
};

const constructorBun: TConstructorIngredient = { ...bun, id: 'bun-1' };
const constructorMain: TConstructorIngredient = { ...main, id: 'main-1' };
const constructorSauce: TConstructorIngredient = { ...sauce, id: 'sauce-1' };
const anotherConstructorMain: TConstructorIngredient = { ...main, id: 'main-2' };

const emptyState: TConstructorState = {
  bun: null,
  ingredients: [],
};

const filledState: TConstructorState = {
  bun: constructorBun,
  ingredients: [constructorMain, constructorSauce, anotherConstructorMain],
};

const order: TOrder = {
  _id: '690cd2f1a64177001b31d7e2',
  status: 'done',
  name: 'Краторный spicy био-марсианский бургер',
  createdAt: '2026-11-06T17:47:29.402Z',
  updatedAt: '2026-11-06T17:47:30.188Z',
  number: 94215,
  ingredients: [bun._id, main._id, sauce._id, bun._id],
};

const orderIngredientIds = order.ingredients;

describe('burgerConstructor reducer', () => {
  test('возвращает начальное состояние при неизвестном экшене', () => {
    const state = constructorReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(emptyState);
  });

  describe('addIngredient', () => {
    test('добавляет булку', () => {
      const state = constructorReducer(emptyState, addIngredient(bun));

      expect(state.bun).toEqual({ ...bun, id: expect.any(String) });
      expect(state.ingredients).toEqual([]);
    });

    test('заменяет ранее добавленную булку новой', () => {
      const state = constructorReducer(filledState, addIngredient(anotherBun));

      expect(state.bun).toEqual({ ...anotherBun, id: expect.any(String) });
      expect(state.ingredients).toEqual(filledState.ingredients);
    });

    test('добавляет начинку и соус в конец списка', () => {
      const stateWithMain = constructorReducer(emptyState, addIngredient(main));
      const state = constructorReducer(stateWithMain, addIngredient(sauce));

      expect(state.bun).toBeNull();
      expect(state.ingredients).toEqual([
        { ...main, id: expect.any(String) },
        { ...sauce, id: expect.any(String) },
      ]);
    });

    test('каждому добавленному ингредиенту присваивается уникальный id', () => {
      const stateWithMain = constructorReducer(emptyState, addIngredient(main));
      const state = constructorReducer(stateWithMain, addIngredient(main));
      const [firstMain, secondMain] = state.ingredients;

      expect(state.ingredients).toHaveLength(2);
      expect(firstMain.id).not.toBe(secondMain.id);
    });
  });

  describe('removeIngredient', () => {
    test('удаляет ингредиент по id и не трогает остальные', () => {
      const state = constructorReducer(
        filledState,
        removeIngredient(constructorSauce.id)
      );

      expect(state.bun).toEqual(constructorBun);
      expect(state.ingredients).toEqual([constructorMain, anotherConstructorMain]);
    });

    test('не меняет список, если ингредиента с таким id нет', () => {
      const state = constructorReducer(filledState, removeIngredient('unknown-id'));

      expect(state).toEqual(filledState);
    });
  });

  describe('moveIngredient', () => {
    test('перемещает ингредиент вниз', () => {
      const state = constructorReducer(
        filledState,
        moveIngredient({ fromIndex: 0, toIndex: 1 })
      );

      expect(state.ingredients).toEqual([
        constructorSauce,
        constructorMain,
        anotherConstructorMain,
      ]);
    });

    test('перемещает ингредиент вверх', () => {
      const state = constructorReducer(
        filledState,
        moveIngredient({ fromIndex: 2, toIndex: 1 })
      );

      expect(state.ingredients).toEqual([
        constructorMain,
        anotherConstructorMain,
        constructorSauce,
      ]);
    });
  });

  describe('createOrder', () => {
    test('createOrder.pending не меняет конструктор', () => {
      const state = constructorReducer(
        filledState,
        createOrder.pending(REQUEST_ID, orderIngredientIds)
      );

      expect(state).toEqual(filledState);
    });

    test('createOrder.rejected не меняет конструктор', () => {
      const state = constructorReducer(
        filledState,
        createOrder.rejected(
          new Error('Ошибка оформления заказа'),
          REQUEST_ID,
          orderIngredientIds
        )
      );

      expect(state).toEqual(filledState);
    });

    test('createOrder.fulfilled очищает конструктор', () => {
      const state = constructorReducer(
        filledState,
        createOrder.fulfilled(order, REQUEST_ID, orderIngredientIds)
      );

      expect(state).toEqual(emptyState);
    });
  });
});
