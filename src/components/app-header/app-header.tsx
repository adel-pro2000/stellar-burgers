import { selectUser } from '@slices/user';
import { AppHeaderUI } from '@ui';
import { useLocation } from 'react-router-dom';

import { useSelector } from '@services/store';

export const AppHeader = (): React.JSX.Element => {
  const { pathname } = useLocation();
  const user = useSelector(selectUser);

  return <AppHeaderUI userName={user?.name} pathname={pathname} />;
};
