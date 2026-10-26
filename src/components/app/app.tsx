import {
  AppHeader,
  IngredientDetails,
  Modal,
  OrderInfo,
  ProtectedRoute,
} from '@components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import {
  fetchIngredients,
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading,
} from '@slices/ingredients';
import { Preloader } from '@ui';
import { clsx } from 'clsx';
import { useEffect } from 'react';
import { Routes, Route, useLocation, useMatch, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { AppContentProps, TDetailPageProps } from './type';
import type { TLocationState } from '@utils-types';

import '../../index.css';

import styles from './app.module.css';

const ORDER_NUMBER_LENGTH = 6;
const INGREDIENT_DETAILS_TITLE = 'Детали ингредиента';

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const ingredients = useSelector(selectIngredients);
  const isIngredientsLoading = useSelector(selectIngredientsLoading);
  const ingredientsError = useSelector(selectIngredientsError);

  useEffect(() => {
    void dispatch(fetchIngredients());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppContent
        ingredients={ingredients}
        isLoading={isIngredientsLoading}
        error={ingredientsError}
      />
    </div>
  );
};

export default App;

/* Маршруты показываются только когда ингредиенты загружены: без них не
   отрисовать ни конструктор, ни состав заказа. */
const AppContent = ({
  ingredients,
  isLoading,
  error,
}: AppContentProps): React.JSX.Element => {
  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className={clsx(styles.message, 'text text_type_main-medium')}>
        Не удалось загрузить ингредиенты
        {error.message ? `: ${error.message}` : '.'}
      </p>
    );
  }

  if (!ingredients.length) {
    return (
      <p className={clsx(styles.message, 'text text_type_main-medium')}>
        Нет ингредиентов
      </p>
    );
  }

  return <RouteComponent />;
};

/* Страница с подробной информацией, которая открывается при прямом переходе
   по ссылке (без модального окна) */
const DetailPage = ({
  title,
  isDigitsTitle = false,
  children,
}: TDetailPageProps): React.JSX.Element => (
  <div className={styles.detailPageWrap}>
    <h3
      className={clsx(
        styles.detailHeader,
        'text',
        isDigitsTitle ? 'text_type_digits-default' : 'text_type_main-large'
      )}
    >
      {title}
    </h3>
    {children}
  </div>
);

const RouteComponent = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const background = (location.state as TLocationState | null)?.background;

  const feedOrderMatch = useMatch('/feed/:number');
  const profileOrderMatch = useMatch('/profile/orders/:number');
  const orderNumber =
    feedOrderMatch?.params.number ?? profileOrderMatch?.params.number ?? '';
  const orderTitle = `#${orderNumber.padStart(ORDER_NUMBER_LENGTH, '0')}`;

  const handleModalClose = (): void => {
    void navigate(-1);
  };

  return (
    <>
      <Routes location={background ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route
          path="/feed/:number"
          element={
            <DetailPage title={orderTitle} isDigitsTitle>
              <OrderInfo />
            </DetailPage>
          }
        />
        <Route
          path="/ingredients/:id"
          element={
            <DetailPage title={INGREDIENT_DETAILS_TITLE}>
              <IngredientDetails />
            </DetailPage>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders/:number"
          element={
            <ProtectedRoute>
              <DetailPage title={orderTitle} isDigitsTitle>
                <OrderInfo />
              </DetailPage>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {background && (
        <Routes>
          <Route
            path="/feed/:number"
            element={
              <Modal title={orderTitle} onClose={handleModalClose}>
                <OrderInfo />
              </Modal>
            }
          />
          <Route
            path="/ingredients/:id"
            element={
              <Modal title={INGREDIENT_DETAILS_TITLE} onClose={handleModalClose}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <Modal title={orderTitle} onClose={handleModalClose}>
                  <OrderInfo />
                </Modal>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
};
