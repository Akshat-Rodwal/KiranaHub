import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import adminService from '../../services/admin.service.js';
import productApi from '../../services/product.service.js';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal, { useModal } from '../../components/common/Modal.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { toast } from '../../components/common/Toast.jsx';
import { formatPrice } from '../../utils/index.js';
import {
  IconSearch,
  IconPlus,
  IconRefresh,
  IconPlus as IconStockPlus,
  IconMinus as IconStockMinus,
} from '../../utils/icons.jsx';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL'); // 'ALL' | 'LOW' | 'OUT'
  const [editingStock, setEditingStock] = useState({}); // { [productId]: number }

  const productModal = useModal('admin-product-modal');
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    unit: '1 pc',
    price: '',
    mrp: '',
    stock: 20,
    description: '',
    imageUrl: '',
    brand: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // 1. Fetch Categories for filter & modal dropdown
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => adminService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
  const categories = categoriesRes?.data?.items || categoriesRes?.data || [];

  // 2. Fetch Products
  const {
    data: productsRes,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin-products', { page, search: searchQuery, category: selectedCategory }],
    queryFn: () =>
      productApi.getProducts({
        page,
        limit: 20,
        search: searchQuery,
        category: selectedCategory,
      }),
    staleTime: 15 * 1000,
  });

  const productsPayload = productsRes || {};
  const rawProducts = productsPayload.items || [];
  const pagination = productsPayload.pagination || { page: 1, totalPages: 1, total: rawProducts.length };

  // Filter products by stock alert if selected
  const displayedProducts = rawProducts.filter((prod) => {
    if (stockFilter === 'LOW') return prod.stock < 10 && prod.stock > 0;
    if (stockFilter === 'OUT') return prod.stock === 0;
    return true;
  });

  // 3. Inline Stock Updater Mutation
  const updateStockMutation = useMutation({
    mutationFn: ({ productId, stock }) => adminService.updateProductStock(productId, stock),
    onSuccess: (_data, variables) => {
      toast.success('Inventory Updated', {
        description: `Stock adjusted to ${variables.stock} units.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics-overview'] });
    },
    onError: (err) => {
      toast.error('Stock Update Failed', {
        description: err?.message || 'Could not update stock level.',
      });
    },
  });

  const handleStockChange = (productId, newStock) => {
    const val = parseInt(newStock, 10);
    if (Number.isNaN(val) || val < 0) {
      toast.error('Invalid Stock', { description: 'Stock quantity cannot be negative.' });
      return;
    }
    setEditingStock((prev) => ({ ...prev, [productId]: val }));
    updateStockMutation.mutate({ productId, stock: val });
  };

  // 4. Create / Edit Product Mutation
  const saveProductMutation = useMutation({
    mutationFn: (payload) => {
      if (isEditing && editingProductId) {
        return adminService.updateProduct(editingProductId, payload);
      }
      return adminService.createProduct(payload);
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Product Updated' : 'Product Created', {
        description: 'Catalog inventory updated successfully.',
      });
      productModal.close();
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics-overview'] });
    },
    onError: (err) => {
      toast.error('Operation Failed', {
        description: err?.message || 'Could not save product details.',
      });
    },
  });

  const openAddModal = () => {
    setIsEditing(false);
    setEditingProductId(null);
    setFormData({
      name: '',
      slug: '',
      category: categories[0]?.slug || categories[0]?._id || '',
      unit: '1 pc',
      price: '',
      mrp: '',
      stock: 20,
      description: '',
      imageUrl: '',
      brand: '',
    });
    setFormErrors({});
    productModal.open();
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setEditingProductId(product._id || product.id);
    const catVal = product.category?.slug || product.category?._id || product.category || '';
    setFormData({
      name: product.name,
      slug: product.slug,
      category: catVal,
      unit: product.unit || '1 pc',
      price: product.price,
      mrp: product.mrp,
      stock: product.stock,
      description: product.description || '',
      imageUrl: product.images?.[0]?.url || product.image || '',
      brand: product.brand || '',
    });
    setFormErrors({});
    productModal.open();
  };

  const validateProductForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.category) errs.category = 'Category is required';
    if (!formData.unit.trim()) errs.unit = 'Unit is required';

    const p = parseFloat(formData.price);
    const m = parseFloat(formData.mrp);
    if (Number.isNaN(p) || p < 0) errs.price = 'Valid selling price >= 0 is required';
    if (Number.isNaN(m) || m < 0) errs.mrp = 'Valid MRP >= 0 is required';
    if (!errs.price && !errs.mrp && p > m) {
      errs.price = 'Selling price cannot exceed MRP';
    }

    const s = parseInt(formData.stock, 10);
    if (Number.isNaN(s) || s < 0) errs.stock = 'Stock must be 0 or greater';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!validateProductForm()) return;

    const slug =
      formData.slug.trim() ||
      formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const payload = {
      name: formData.name.trim(),
      slug,
      category: formData.category,
      unit: formData.unit.trim(),
      price: parseFloat(formData.price),
      mrp: parseFloat(formData.mrp),
      stock: parseInt(formData.stock, 10),
      description: formData.description.trim(),
      brand: formData.brand.trim(),
      images: formData.imageUrl.trim() ? [{ url: formData.imageUrl.trim() }] : [],
    };

    saveProductMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm" className="font-mono uppercase tracking-wider">
              Catalog & Stock
            </Badge>
            <span className="text-xs text-text-muted">Real-Time Inventory Control</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
            Products & Inventory
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Monitor real-time grocery inventory, modify stock levels inline, and add new items.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={<IconRefresh className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openAddModal}
            leftIcon={<IconPlus className="h-4 w-4" />}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-3xl border border-border bg-surface p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search products by title or brand..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-2xl border border-border bg-surface-soft pl-10 pr-4 py-2 text-xs sm:text-sm text-text-primary focus:border-brand-500 focus:bg-surface focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="rounded-2xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text-primary focus:border-brand-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter Pills */}
          <div className="flex items-center rounded-2xl border border-border bg-surface-soft p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setStockFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                stockFilter === 'ALL' ? 'bg-surface text-text-primary shadow-xs font-bold' : 'text-text-muted'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('LOW')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                stockFilter === 'LOW' ? 'bg-amber-100 text-amber-800 shadow-xs font-bold' : 'text-text-muted'
              }`}
            >
              Low Stock (&lt;10)
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('OUT')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                stockFilter === 'OUT' ? 'bg-danger-100 text-danger-800 shadow-xs font-bold' : 'text-text-muted'
              }`}
            >
              Out of Stock (0)
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="min-h-[35vh] flex items-center justify-center p-12">
            <LoadingSpinner size="lg" message="Loading catalog inventory..." />
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="font-display font-bold text-base text-text-primary">
              No products found
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Try adjusting search terms or stock filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft/70 border-b border-border text-text-muted uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price / MRP</th>
                  <th className="px-5 py-3">Stock Status</th>
                  <th className="px-5 py-3">Inline Stock Updater</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayedProducts.map((product) => {
                  const currentStock =
                    editingStock[product._id] !== undefined
                      ? editingStock[product._id]
                      : product.stock;
                  const isLowStock = currentStock > 0 && currentStock < 10;
                  const isOutOfStock = currentStock === 0;

                  return (
                    <tr key={product._id} className="hover:bg-surface-soft/40 transition-colors">
                      {/* Product details with thumbnail */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0]?.url || product.image || '/placeholder-grocery.png'}
                            alt={product.name}
                            className="h-10 w-10 rounded-xl object-cover border border-border bg-surface-soft shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=60';
                            }}
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-xs text-text-primary truncate">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-text-muted">
                              {product.unit} {product.brand ? `• ${product.brand}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5 text-text-secondary">
                        {product.category?.name || product.category || 'General'}
                      </td>

                      {/* Price & MRP */}
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-text-primary font-display text-xs">
                          {formatPrice(product.price)}
                        </span>
                        {product.mrp > product.price && (
                          <span className="ml-1 text-[11px] text-text-muted line-through">
                            {formatPrice(product.mrp)}
                          </span>
                        )}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="px-5 py-3.5">
                        {isOutOfStock ? (
                          <Badge variant="danger" size="xs">
                            Out of Stock (0)
                          </Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning" size="xs">
                            Low Stock ({currentStock})
                          </Badge>
                        ) : (
                          <Badge variant="success" size="xs">
                            In Stock ({currentStock})
                          </Badge>
                        )}
                      </td>

                      {/* Inline Stock Updater Controls */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={currentStock <= 0 || updateStockMutation.isPending}
                            onClick={() => handleStockChange(product._id, Math.max(0, currentStock - 1))}
                            className="h-7 w-7 flex items-center justify-center rounded-lg border border-border bg-surface hover:bg-surface-soft disabled:opacity-40"
                          >
                            <IconStockMinus className="h-3 w-3" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={currentStock}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                              setEditingStock((prev) => ({ ...prev, [product._id]: val }));
                            }}
                            onBlur={(e) => {
                              const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                              handleStockChange(product._id, val);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                                handleStockChange(product._id, val);
                              }
                            }}
                            className="w-14 text-center font-bold rounded-lg border border-border py-1 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
                          />

                          <button
                            type="button"
                            disabled={updateStockMutation.isPending}
                            onClick={() => handleStockChange(product._id, currentStock + 1)}
                            className="h-7 w-7 flex items-center justify-center rounded-lg border border-border bg-surface hover:bg-surface-soft"
                          >
                            <IconStockPlus className="h-3 w-3" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => openEditModal(product)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-text-muted">
              Page {page} of {pagination.totalPages} ({pagination.total} catalog items)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="xs"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        id="admin-product-modal"
        title={isEditing ? 'Edit Catalog Product' : 'Add New Grocery Product'}
        description="Enter product attributes, pricing, and initial stock."
        size="lg"
        hideFooter
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 pt-2">
          {/* Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Amul Pure Ghee 1L"
                className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
              />
              {formErrors.name && <p className="text-[11px] text-danger-600 mt-0.5">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
              >
                <option value="" disabled>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.slug} value={cat.slug || cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <p className="text-[11px] text-danger-600 mt-0.5">{formErrors.category}</p>
              )}
            </div>
          </div>

          {/* Pricing & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="249"
                className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
              />
              {formErrors.price && <p className="text-[11px] text-danger-600 mt-0.5">{formErrors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                MRP (₹) *
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                placeholder="280"
                className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
              />
              {formErrors.mrp && <p className="text-[11px] text-danger-600 mt-0.5">{formErrors.mrp}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Unit / Pack Size *
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g. 500 g, 1 kg, 1 pc"
                className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
              />
              {formErrors.unit && <p className="text-[11px] text-danger-600 mt-0.5">{formErrors.unit}</p>}
            </div>
          </div>

          {/* Stock & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="20"
                className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
              />
              {formErrors.stock && <p className="text-[11px] text-danger-600 mt-0.5">{formErrors.stock}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Amul, Nestle, Fortune"
                className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Image URL & Live Preview */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Product Image URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/... or click Upload"
                className="flex-1 rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
              />
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition-colors shrink-0">
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      toast.loading('Uploading product image...', { id: 'prod-upload' });
                      const res = await adminService.uploadImage(file);
                      const url = res.data?.url || res.url;
                      setFormData((prev) => ({ ...prev, imageUrl: url }));
                      toast.success('Image Uploaded', { id: 'prod-upload' });
                    } catch (err) {
                      toast.error('Upload Failed', { id: 'prod-upload', description: err?.message });
                    }
                  }}
                />
              </label>
              {formData.imageUrl && (
                <div className="w-10 h-10 shrink-0 rounded-lg border border-border bg-stone-50 overflow-hidden flex items-center justify-center p-0.5">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Direct HTTPS link to realistic product packaging photo (Unsplash, Cloudinary, etc.)
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Short Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Fresh farm produce or pure dairy essentials..."
              className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => productModal.close()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saveProductMutation.isPending}
            >
              {isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
