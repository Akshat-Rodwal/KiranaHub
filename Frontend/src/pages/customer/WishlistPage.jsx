import { useNavigate } from 'react-router-dom';

import Container from '../../components/common/Container.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConnectedProductCard from '../../components/product/ConnectedProductCard.jsx';
import useWishlistStore from '../../store/useWishlistStore.js';
import { ROUTES } from '../../constants/index.js';

export default function WishlistPage() {
  const navigate = useNavigate();
  const items = useWishlistStore((s) => s.items);

  if (items.length === 0) {
    return (
      <Container>
        <EmptyState
          preset="wishlist"
          onAction={() => navigate(ROUTES.PRODUCTS)}
        />
      </Container>
    );
  }

  return (
    <section className="section">
      <Container>
        <h1 className="headline text-2xl text-text-primary sm:text-3xl">
          Your Wishlist
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {items.length} saved item{items.length === 1 ? '' : 's'}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((product) => (
            <ConnectedProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
