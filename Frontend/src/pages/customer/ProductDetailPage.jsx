import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import Container from '../../components/common/Container.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ProductSection from '../../components/product/ProductSection.jsx';
import { toast } from '../../components/common/Toast.jsx';
import useCartStore from '../../store/useCartStore.js';
import { ROUTES } from '../../constants/index.js';
import { useProduct } from '../../hooks/useProduct.js';
import { useRelatedProducts } from '../../hooks/useRelatedProducts.js';
import { formatPrice, calculateDiscount, classNames } from '../../utils/index.js';
import {
  IconStar,
  IconLeaf,
  IconShield,
  IconTruck,
  IconPlus,
  IconMinus,
} from '../../utils/icons.jsx';

export default function ProductDetailPage() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const lookupKey = slug || id;

  const productQuery = useProduct(lookupKey);
  const product = productQuery.data;

  // Image gallery active index
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Related products query using slug
  const relatedQuery = useRelatedProducts(
    product?.slug,
    6,
    { enabled: Boolean(product?.slug) }
  );

  if (productQuery.isLoading) {
    return (
      <section className="py-6 lg:py-10">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="skeleton aspect-square w-full rounded-3xl" />
            <div className="flex flex-col space-y-4">
              <div className="skeleton h-4 w-24 rounded-md" />
              <div className="skeleton h-8 w-3/4 rounded-lg" />
              <div className="skeleton h-5 w-32 rounded-md" />
              <div className="skeleton h-10 w-44 rounded-lg" />
              <div className="skeleton h-24 w-full rounded-xl" />
              <div className="skeleton h-12 w-48 rounded-xl" />
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <section className="section">
        <Container>
          <EmptyState
            preset="search"
            title="Product not found"
            description="The product you are looking for doesn't exist or was removed from our catalog."
            action="Browse Products"
            onAction={() => navigate(ROUTES.PRODUCTS)}
          />
        </Container>
      </section>
    );
  }

  const effectiveSellingPrice = product.sellingPrice ?? product.price ?? 0;
  const effectiveOriginalPrice = product.originalPrice ?? product.mrp ?? effectiveSellingPrice;
  const discount = calculateDiscount(effectiveOriginalPrice, effectiveSellingPrice);
  const savings = Math.max(0, effectiveOriginalPrice - effectiveSellingPrice);

  // Gallery images list
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image].filter(Boolean);

  const activeImage = galleryImages[selectedImageIndex] || product.image;

  const related = (relatedQuery.data ?? []).filter(
    (p) => (p.slug || p.id) !== (product.slug || product.id)
  );

  return (
    <>
      <section className="py-6 lg:py-10">
        <Container>
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-text-muted">
            <button
              type="button"
              onClick={() => navigate(ROUTES.HOME)}
              className="hover:text-brand-600 transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => navigate(ROUTES.PRODUCTS)}
              className="hover:text-brand-600 transition-colors"
            >
              Products
            </button>
            {product.category && (
              <>
                <span>/</span>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      product.categorySlug
                        ? ROUTES.CATEGORY.replace(':slug', product.categorySlug)
                        : ROUTES.PRODUCTS
                    )
                  }
                  className="hover:text-brand-600 transition-colors capitalize"
                >
                  {typeof product.category === 'object' ? product.category.name : product.category}
                </button>
              </>
            )}
            <span>/</span>
            <span className="truncate text-text-primary font-semibold max-w-[200px]">
              {product.name}
            </span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Gallery Column */}
            <div className="flex flex-col gap-4">
              <div className="relative overflow-hidden rounded-3xl border border-border-light bg-surface-muted aspect-square flex items-center justify-center p-8 group">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  src={activeImage}
                  alt={product.name}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />

                {discount > 0 && (
                  <Badge
                    variant="discount"
                    size="lg"
                    className="absolute left-4 top-4 shadow-sm"
                  >
                    {discount}% OFF
                  </Badge>
                )}

                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-surface/70 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="rounded-2xl bg-danger-600 px-4 py-2 font-display text-sm font-bold text-white shadow-lg">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {galleryImages.map((imgUrl, idx) => {
                    const isSelected = selectedImageIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 p-1 transition-all ${
                          isSelected
                            ? 'border-brand-600 shadow-brand ring-2 ring-brand-100'
                            : 'border-border-light bg-surface-muted hover:border-border'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${product.name} preview ${idx + 1}`}
                          className="h-full w-full object-contain"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Details Column */}
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {product.category && (
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                    {typeof product.category === 'object' ? product.category.name : product.category}
                    {product.brand && (
                      <span className="ml-1 font-normal text-text-muted">
                        · {product.brand}
                      </span>
                    )}
                  </span>
                )}

                {/* Stock Status Badge */}
                {product.stock <= 0 ? (
                  <Badge variant="danger" size="sm">
                    Out of Stock
                  </Badge>
                ) : (product.stock - (product.reservedStock || 0)) <= 5 ? (
                  <Badge variant="warning" size="sm" className="bg-rose-50 text-rose-700 border-rose-200 font-bold">
                    ⚡ Only {Math.max(1, product.stock - (product.reservedStock || 0))} left in store!
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm">
                    In Stock
                  </Badge>
                )}
              </div>

              <h1 className="headline mt-2 text-2xl text-text-primary sm:text-3xl font-bold">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-2">
                <span className="flex items-center gap-0.5 text-accent-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar
                      key={i}
                      className={classNames(
                        'h-4 w-4',
                        i < Math.round(product.rating || 0)
                          ? 'fill-current'
                          : 'text-neutral-300'
                      )}
                    />
                  ))}
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  {(product.rating || 0).toFixed(1)}
                </span>
                <span className="text-sm text-text-muted">
                  ({product.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="mt-5 rounded-2xl border border-border-light bg-surface p-4 shadow-sm">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-extrabold text-text-primary">
                    {formatPrice(effectiveSellingPrice)}
                  </span>
                  {effectiveOriginalPrice > effectiveSellingPrice && (
                    <span className="text-lg text-text-muted line-through">
                      {formatPrice(effectiveOriginalPrice)}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="rounded-lg bg-success-50 px-2 py-0.5 text-xs font-bold text-success-700">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                  <span>Inclusive of all taxes</span>
                  {savings > 0 && (
                    <span className="font-bold text-success-600">
                      You save {formatPrice(savings)}
                    </span>
                  )}
                </div>

                {/* Unit / Pack Size */}
                <div className="mt-3 pt-3 border-t border-border-light flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-text-muted tracking-wider">
                    Pack Size / Unit:
                  </span>
                  <span className="rounded-lg border border-border bg-surface-muted px-2.5 py-1 text-xs font-bold text-text-primary">
                    {product.unit}
                  </span>
                </div>
              </div>

              {/* Short / Detailed Description */}
              <div className="mt-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  About this item
                </h2>
                <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                  {product.description ||
                    product.shortDescription ||
                    `Quality-guaranteed ${product.name.toLowerCase()} from ${product.brand || 'KiranaHub'}. Sourced fresh and delivered quickly to your doorstep.`}
                </p>
              </div>

              {/* Add to Cart Quantity Controller */}
              <div className="mt-6 pt-4">
                <DetailAddToCart product={product} />
              </div>

              {/* Trust Badges */}
              <ul className="mt-8 grid gap-3 text-sm text-text-secondary sm:grid-cols-3 border-t border-border-light pt-6">
                <li className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <IconTruck className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs font-medium">Fast Local Delivery</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <IconLeaf className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs font-medium">Fresh Quality Checked</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <IconShield className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs font-medium">100% Genuine Items</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Similar / Related Products */}
      {related.length > 0 && (
        <ProductSection
          title="Similar Products"
          subtitle={`Explore more items in ${typeof product.category === 'object' ? product.category.name : product.category || 'this category'}`}
          products={related}
          to={
            product.categorySlug
              ? ROUTES.CATEGORY.replace(':slug', product.categorySlug)
              : ROUTES.PRODUCTS
          }
          dense
        />
      )}
    </>
  );
}

function DetailAddToCart({ product }) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const productId = product.slug || product.id || product._id;

  const cartItem = items.find(
    (i) => i.id === productId || i.slug === product.slug || i.id === product.id
  );
  const quantity = cartItem?.quantity || 0;

  if (product.stock <= 0) {
    return (
      <Button size="lg" fullWidth disabled>
        Out of Stock
      </Button>
    );
  }

  if (quantity === 0) {
    return (
      <Button
        size="lg"
        fullWidth
        onClick={() => {
          addItem(product, 1);
          toast.success('Added to cart', {
            description: `${product.name} (1 ${product.unit})`,
          });
        }}
      >
        Add to Cart
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Stepper Controller */}
      <div className="flex items-center rounded-2xl border-2 border-brand-600 bg-surface p-1 shadow-sm">
        <button
          type="button"
          onClick={() => {
            if (quantity <= 1) {
              removeItem(cartItem.id);
              toast.info('Item removed from cart');
            } else {
              updateQuantity(cartItem.id, quantity - 1);
            }
          }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
          aria-label="Decrease quantity"
        >
          <IconMinus className="h-4 w-4" />
        </button>
        <span className="w-14 text-center font-display text-base font-bold text-text-primary">
          {quantity}
        </span>
        <button
          type="button"
          disabled={quantity >= product.stock}
          onClick={() => {
            updateQuantity(cartItem.id, quantity + 1);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Increase quantity"
        >
          <IconPlus className="h-4 w-4" />
        </button>
      </div>

      <div className="text-xs text-text-muted">
        <div className="font-semibold text-text-primary">
          {quantity} × {formatPrice(product.sellingPrice || product.price)}
        </div>
        <div>In your basket</div>
      </div>
    </div>
  );
}
