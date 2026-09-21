import { useNavigate } from 'react-router';

import ProductCard from '../ui/ProductCard.jsx';
import { toast } from '../common/Toast.jsx';
import useCartStore from '../../store/useCartStore.js';
import useWishlistStore from '../../store/useWishlistStore.js';
import { ROUTES } from '../../constants/index.js';

export default function ConnectedProductCard({ product, variant, className }) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const quantityInCart =
    useCartStore((s) => s.items.find((i) => i.id === product.id)?.quantity) ?? 0;
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const handleAddToCart = (delta) => {
    const next = quantityInCart + delta;
    if (next <= 0) {
      updateQuantity(product.id, 0);
      return;
    }
    if (quantityInCart === 0) {
      addItem(product, next);
      toast.success('Added to cart', { description: product.name });
      return;
    }
    updateQuantity(product.id, next);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    if (isInWishlist) {
      toast.info('Removed from wishlist', { description: product.name });
    } else {
      toast.success('Added to wishlist', { description: product.name });
    }
  };

  const handleClick = () => {
    navigate(ROUTES.PRODUCT.replace(':id', product.slug || product.id));
  };

  return (
    <ProductCard
      {...product}
      variant={variant}
      className={className}
      quantityInCart={quantityInCart}
      isInWishlist={isInWishlist}
      onAddToCart={handleAddToCart}
      onToggleWishlist={handleToggleWishlist}
      onClick={handleClick}
    />
  );
}
