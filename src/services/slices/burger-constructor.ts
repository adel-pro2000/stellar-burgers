import { createSlice, nanoid } from '@reduxjs/toolkit';

import { createOrder } from './order';

import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@utils-types';

type TMovePayload = {
  fromIndex: number;
  toIndex: number;
};

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

export const burgerConstructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => ({
        payload: { ...ingredient, id: nanoid() },
      }),
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        (ingredient) => ingredient.id !== action.payload
      );
    },
    moveIngredient: (state, action: PayloadAction<TMovePayload>) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedIngredient] = state.ingredients.splice(fromIndex, 1);
      state.ingredients.splice(toIndex, 0, movedIngredient);
    },
    resetConstructor: () => initialState,
  },
  selectors: {
    selectConstructorItems: (state) => state,
  },
  extraReducers: (builder) => {
    // после успешного оформления заказа конструктор очищается
    builder.addCase(createOrder.fulfilled, () => initialState);
  },
});

export const { addIngredient, removeIngredient, moveIngredient, resetConstructor } =
  burgerConstructorSlice.actions;
export const { selectConstructorItems } = burgerConstructorSlice.selectors;
