import { AppHeaderUI } from '@ui';
import { useLocation } from 'react-router-dom';

export const AppHeader = (): React.JSX.Element => {
  const { pathname } = useLocation();
  /* TODO: Получите имя пользователя из хранилища */
  const userName = undefined;

  return <AppHeaderUI userName={userName} pathname={pathname} />;
};
