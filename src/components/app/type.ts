import type { SerializedError } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils-types';
import type { ReactNode } from 'react';

export type AppContentProps = {
  ingredients: TIngredient[];
  isLoading: boolean;
  error: SerializedError | null;
};

export type TDetailPageProps = {
  title: string;
  isDigitsTitle?: boolean;
  children: ReactNode;
};
