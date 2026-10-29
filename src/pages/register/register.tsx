import { registerUser, selectRegisterError } from '@slices/user';
import { RegisterUI } from '@ui-pages';
import { type SyntheticEvent, useState } from 'react';

import { useDispatch, useSelector } from '@services/store';

export const Register = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const registerError = useSelector(selectRegisterError);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    void dispatch(registerUser({ name: userName, email, password }));
  };

  return (
    <RegisterUI
      errorText={registerError}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
