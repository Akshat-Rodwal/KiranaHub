import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import Button from '../common/Button.jsx';
import { ROUTES } from '../../constants/index.js';
import { IconShield } from '../../utils/icons.jsx';

/**
 * ProtectedRoute guards routes that require authentication and/or specific roles.
 *
 * @param {Object} props
 * @param {string[]} [props.allowedRoles] - Optional list of authorized roles (e.g. ['admin', 'manager'])
 * @param {React.ReactNode} [props.children] - Optional child elements (defaults to Outlet)
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const { isAuthenticated, isInitializing, user } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
        <LoadingSpinner size="lg" message="Verifying session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-50 text-danger-600 shadow-inner">
            <IconShield className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Access Restricted
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            You do not have administrative permissions to view this page. This section is restricted to store administrators and managers.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button as={Link} to={ROUTES.HOME} variant="primary">
              Return to Store
            </Button>
            <Button as={Link} to={ROUTES.ACCOUNT} variant="outline">
              My Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
}
