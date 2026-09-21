import { useNavigate } from 'react-router';

import Container from '../components/common/Container.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { ROUTES } from '../constants/index.js';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container>
      <EmptyState
        title="Page not found"
        description="The page you're looking for doesn't exist or was moved."
        action="Back to Home"
        onAction={() => navigate(ROUTES.HOME)}
      />
    </Container>
  );
}
