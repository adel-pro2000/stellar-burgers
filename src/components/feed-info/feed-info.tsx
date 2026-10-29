import { selectFeed } from '@slices/feed';
import { FeedInfoUI } from '@ui';

import { useSelector } from '@services/store';

import type { TOrder } from '@utils-types';

const MAX_ORDERS_IN_COLUMN = 20;

const getOrders = (orders: TOrder[], status: string): number[] =>
  orders
    .filter((item) => item.status === status)
    .map((item) => item.number)
    .slice(0, MAX_ORDERS_IN_COLUMN);

export const FeedInfo = (): React.JSX.Element => {
  const feed = useSelector(selectFeed);
  const { orders } = feed;

  const readyOrders = getOrders(orders, 'done');

  const pendingOrders = getOrders(orders, 'pending');

  return (
    <FeedInfoUI readyOrders={readyOrders} pendingOrders={pendingOrders} feed={feed} />
  );
};
