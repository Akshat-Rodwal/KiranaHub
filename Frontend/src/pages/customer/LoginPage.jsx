import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../../store/useAuthStore.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Container from '../../components/common/Container.jsx';
import { ROUTES } from '../../constants/index.js';
import { toast } from '../../components/common/Toast.jsx';
import {
  IconShoppingBag,
  IconLock,
  IconMail,
  IconEye,
  IconEyeOff,
} from '../../utils/icons.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, isAuthenticated, user, isLoading, error, clearError } =
    useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const resolveTargetDestination = useCallback(
    (targetUser) => {
      if (targetUser?.role === 'admin' || targetUser?.role === 'manager') {
        return ROUTES.ADMIN?.ROOT || '/admin';
      }
      return location.state?.from?.pathname || ROUTES.HOME;
    },
    [location.state]
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate(resolveTargetDestination(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate, resolveTargetDestination]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const validate = () => {
    const errs = {};
    if (!identifier.trim()) {
      errs.identifier = 'Please enter your email or 10-digit phone number';
    }
    if (!password) {
      errs.password = 'Please enter your password';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const loggedInUser = await login({
        identifier: identifier.trim(),
        password,
      });

      const isAdminOrManager = loggedInUser?.role === 'admin' || loggedInUser?.role === 'manager';

      toast.success(`Welcome back, ${loggedInUser.name}!`, {
        description: isAdminOrManager
          ? 'Signed in with Administrative Access.'
          : 'Successfully signed in to your KiranaHub account.',
      });

      navigate(resolveTargetDestination(loggedInUser), { replace: true });
    } catch {
      // Error is set in store and rendered in error banner
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google Sign-In token was not provided');
      return;
    }

    try {
      const { user: googleUser, isNewUser } = await loginWithGoogle(
        credentialResponse.credential
      );
      const isAdminOrManager =
        googleUser?.role === 'admin' || googleUser?.role === 'manager';

      toast.success(`Welcome, ${googleUser.name}!`, {
        description: isNewUser
          ? 'Account created and signed in with Google.'
          : isAdminOrManager
            ? 'Signed in with Administrative Access.'
            : 'Successfully signed in with Google.',
      });

      navigate(resolveTargetDestination(googleUser), { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Google Sign-In was unsuccessful.');
    }
  };

  return (
    <div className="min-h-[75vh] py-12 flex items-center justify-center">
      <Container size="sm">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto max-w-md"
        >
          {/* Brand header */}
          <div className="text-center mb-8">
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-2.5 mb-3 group"
            >
              <span className="gradient-crimson flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-brand transition-transform group-hover:scale-105">
                <IconShoppingBag className="h-6 w-6" />
              </span>
              <span className="font-display text-2xl font-black tracking-tight text-text-primary">
                Kirana<span className="text-brand-600">Hub</span>
              </span>
            </Link>
            <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Enter your credentials to access your account, orders and saved items.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-border-light bg-surface p-6 shadow-sm sm:p-8">
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-danger-200 bg-danger-50 p-4 text-danger-800">
                <svg
                  className="h-5 w-5 shrink-0 text-danger-500 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1 text-sm font-medium">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="identifier"
                label="Email or Phone Number"
                type="text"
                placeholder="name@example.com or 9876543210"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (validationErrors.identifier) {
                    setValidationErrors((prev) => ({ ...prev, identifier: '' }));
                  }
                }}
                error={validationErrors.identifier}
                leftIcon={<IconMail className="h-4 w-4" />}
                autoComplete="username"
                disabled={isLoading}
              />

              <Input
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) {
                    setValidationErrors((prev) => ({ ...prev, password: '' }));
                  }
                }}
                error={validationErrors.password}
                leftIcon={<IconLock className="h-4 w-4" />}
                rightIcon={
                  showPassword ? (
                    <IconEyeOff className="h-4 w-4" />
                  ) : (
                    <IconEye className="h-4 w-4" />
                  )
                }
                onRightIconClick={() => setShowPassword(!showPassword)}
                autoComplete="current-password"
                disabled={isLoading}
              />

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-secondary">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Sign In
                </Button>
              </div>
            </form>

            {/* Divider: Or continue with */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border-light" />
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Or continue with
              </span>
              <div className="h-px flex-1 bg-border-light" />
            </div>

            {/* Google OAuth 2.0 Sign-In Button */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Sign-In was unsuccessful')}
                useOneTap
                theme="outline"
                shape="pill"
                text="continue_with"
                width="100%"
              />
            </div>

            <div className="mt-6 border-t border-border-light pt-5 text-center">
              <p className="text-sm text-text-secondary">
                Don&apos;t have an account?{' '}
                <Link
                  to={ROUTES.REGISTER}
                  className="font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
