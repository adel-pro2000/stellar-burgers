import { selectFeedOrders } from '@slices/feed';
import { selectIngredients } from '@slices/ingredients';
import { fetchOrderByNumber, selectOrderInfo } from '@slices/order-info';
import { selectProfileOrders } from '@slices/profile-orders';
import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { TIngredient } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { number } = useParams();
  const orderNumber = Number(number);

  const ingredients = useSelector(selectIngredients);
  const feedOrders = useSelector(selectFeedOrders);
  const profileOrders = useSelector(selectProfileOrders);
  const loadedOrder = useSelector(selectOrderInfo);

  /* сначала ищем заказ среди уже загруженных (лента / история),
     если не нашли (например, прямой переход по ссылке) - запрашиваем с сервера */
  const orderData =
    feedOrders.find((order) => order.number === orderNumber) ??
    profileOrders.find((order) => order.number === orderNumber) ??
    (loadedOrder?.number === orderNumber ? loadedOrder : null);

  useEffect(() => {
    if (!orderData) {
      void dispatch(fetchOrderByNumber(orderNumber));
    }
  }, [dispatch, orderNumber]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
