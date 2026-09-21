import { useNavigate } from 'react-router';

import Container from '../../components/common/Container.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { ROUTES } from '../../constants/index.js';

export default function PlaceholderPage({
  preset = 'generic',
  title,
  description,
  action = 'Back to Home',
}) {
  const navigate = useNavigate();

  return (
    <Container>
      <EmptyState
        preset={preset}
        title={title}
        description={description}
        action={action}
        onAction={() => navigate(ROUTES.HOME)}
        size="md"
      />
    </Container>
  );
}
