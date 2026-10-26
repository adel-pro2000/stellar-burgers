import { logoutUser } from '@slices/user';
import { ProfileMenuUI } from '@ui';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch } from '@services/store';

export const ProfileMenu = (): React.JSX.Element => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    void dispatch(logoutUser())
      .unwrap()
      .then(() => navigate('/login', { replace: true }))
      .catch(() => {
        // если запрос не прошёл - пользователь остаётся в личном кабинете
      });
  };

  return <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />;
};
