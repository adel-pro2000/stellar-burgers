import { selectIsAuthChecked, selectUser } from '@slices/user';
import { Preloader } from '@ui';
import { Navigate, useLocation } from 'react-router-dom';

import { useSelector } from '@services/store';

import type { TProtectedRouteProps } from './type';
import type { TLocationState } from '@utils-types';

export const ProtectedRoute = ({
  onlyUnAuth = false,
  children,
}: TProtectedRouteProps): React.JSX.Element => {
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const user = useSelector(selectUser);
  const location = useLocation();

  // пока не знаем, авторизован ли пользователь - показываем лоадер
  if (!isAuthChecked) {
    return <Preloader />;
  }

  // неавторизованного пользователя отправляем на логин и запоминаем, куда он шёл
  if (!onlyUnAuth && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // авторизованного пользователя не пускаем на страницы логина/регистрации
  if (onlyUnAuth && user) {
    const from = (location.state as TLocationState | null)?.from ?? { pathname: '/' };
    return <Navigate to={from} replace />;
  }

  return children;
};
