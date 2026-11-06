import { describe, expect, test } from '@jest/globals';

import { fetchIngredients, ingredientsSlice } from '../ingredients';

import type { TIngredient } from '@utils-types';

const ingredientsReducer = ingredientsSlice.reducer;

const REQUEST_ID = 'test-request-id';
const ERROR_MESSAGE = 'Не удалось загрузить ингредиенты';

const ingredients: TIngredient[] = [
  {
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
  },
  {
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
  },
];

const initialState = ingredientsSlice.getInitialState();

describe('ingredients reducer', () => {
  test('возвращает начальное состояние при неизвестном экшене', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual({
      ingredients: [],
      isLoading: false,
      error: null,
    });
  });

  test('fetchIngredients.pending включает загрузку и сбрасывает ошибку', () => {
    const prevState = {
      ...initialState,
      error: { message: ERROR_MESSAGE },
    };

    const state = ingredientsReducer(prevState, fetchIngredients.pending(REQUEST_ID));

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.ingredients).toEqual([]);
  });

  test('fetchIngredients.fulfilled сохраняет ингредиенты и выключает загрузку', () => {
    const prevState = { ...initialState, isLoading: true };

    const state = ingredientsReducer(
      prevState,
      fetchIngredients.fulfilled(ingredients, REQUEST_ID)
    );

    expect(state).toEqual({
      ingredients,
      isLoading: false,
      error: null,
    });
  });

  test('fetchIngredients.rejected сохраняет ошибку и выключает загрузку', () => {
    const prevState = { ...initialState, isLoading: true };

    const state = ingredientsReducer(
      prevState,
      fetchIngredients.rejected(new Error(ERROR_MESSAGE), REQUEST_ID)
    );

    expect(state.isLoading).toBe(false);
    expect(state.error?.message).toBe(ERROR_MESSAGE);
    expect(state.ingredients).toEqual([]);
  });
});
