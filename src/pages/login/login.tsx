import { loginUser, selectLoginError } from '@slices/user';
import { LoginUI } from '@ui-pages';
import { type SyntheticEvent, useState } from 'react';

import { useDispatch, useSelector } from '@services/store';

export const Login = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const loginError = useSelector(selectLoginError);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    void dispatch(loginUser({ email, password }));
  };

  return (
    <LoginUI
      errorText={loginError}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
