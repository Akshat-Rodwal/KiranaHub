import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, Trash2 } from 'lucide-react';

import adminService from '../../services/admin.service.js';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal, { useModal } from '../../components/common/Modal.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { toast } from '../../components/common/Toast.jsx';
import { resolveCategory3DIcon } from '../../utils/categoryIcons.js';
import {
  IconPlus,
  IconRefresh,
  IconGrid,
} from '../../utils/icons.jsx';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const categoryModal = useModal('admin-category-modal');

  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});

  const {
    data: categoriesRes,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminService.getCategories(),
    staleTime: 60 * 1000,
  });

  const raw =
    categoriesRes?.data?.categories ||
    categoriesRes?.categories ||
    categoriesRes?.data?.items ||
    categoriesRes?.data ||
    categoriesRes ||
    [];
  const categories = Array.isArray(raw) ? raw : [];

  const createCategoryMutation = useMutation({
    mutationFn: (payload) => adminService.createCategory(payload),
    onSuccess: () => {
      toast.success('Category Created', {
        description: 'New grocery category added successfully.',
      });
      categoryModal.close();
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-all'] });
    },
    onError: (err) => {
      toast.error('Creation Failed', {
        description: err?.message || 'Could not create category.',
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ identifier, payload }) => adminService.updateCategory(identifier, payload),
    onSuccess: () => {
      toast.success('Category Updated', {
        description: 'Category details updated successfully.',
      });
      categoryModal.close();
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-all'] });
    },
    onError: (err) => {
      toast.error('Update Failed', {
        description: err?.message || 'Could not update category.',
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (identifier) => adminService.deleteCategory(identifier),
    onSuccess: () => {
      toast.success('Category Deleted', {
        description: 'Category removed successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-all'] });
    },
    onError: (err) => {
      toast.error('Delete Failed', {
        description: err?.message || 'Could not delete category.',
      });
    },
  });

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', image: '', isActive: true });
    setFormErrors({});
    categoryModal.open();
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || '',
      isActive: cat.isActive !== false,
    });
    setFormErrors({});
    categoryModal.open();
  };

  const handleDelete = (cat) => {
    if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      deleteCategoryMutation.mutate(cat.slug || cat._id);
    }
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    if (!editingCategory) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData({ ...formData, name, slug });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Category name is required';
    if (!formData.slug.trim()) errs.slug = 'Category slug is required';

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim(),
      image: formData.image.trim(),
      icon: resolveCategory3DIcon(formData.name, formData.slug, formData.image),
      isActive: formData.isActive,
    };

    if (editingCategory) {
      updateCategoryMutation.mutate({
        identifier: editingCategory.slug || editingCategory._id,
        payload,
      });
    } else {
      createCategoryMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm" className="font-mono uppercase tracking-wider">
              Store Taxonomy
            </Badge>
            <span className="text-xs text-text-muted">Aisle & Department Management</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
            Store Categories
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Organize catalog aisles, departments, and storefront groupings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
              refetch();
            }}
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
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories Grid / Table */}
      <div className="rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="min-h-[30vh] flex items-center justify-center p-12">
            <LoadingSpinner size="lg" message="Loading categories..." />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="font-display font-bold text-base text-text-primary">No categories found</h3>
            <p className="text-xs text-text-muted mt-1">Add your first category or click refresh to load default categories.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft/70 border-b border-border text-text-muted uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Slug Identifier</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Products</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((cat) => (
                  <tr key={cat._id || cat.slug} className="hover:bg-surface-soft/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-white to-[#edf6f2]/80 border border-emerald-100/90 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                          <img
                            src={resolveCategory3DIcon(
                              cat.name,
                              cat.slug,
                              cat.icon || (cat.image?.startsWith('http') ? cat.image : null)
                            )}
                            alt={cat.name}
                            referrerPolicy="no-referrer"
                            className="h-7 w-7 object-contain"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                'https://cdn-icons-png.flaticon.com/512/3081/3081986.png';
                            }}
                          />
                        </div>
                        <span className="font-semibold text-xs text-text-primary">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-text-muted text-[11px]">
                      {cat.slug}
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary truncate max-w-xs">
                      {cat.description || '—'}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-text-muted">
                      {typeof cat.productCount === 'number'
                        ? `${cat.productCount} items`
                        : typeof cat.itemCount === 'number'
                        ? `${cat.itemCount} items`
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={cat.isActive !== false ? 'success' : 'secondary'} size="xs">
                        {cat.isActive !== false ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          disabled={deleteCategoryMutation.isPending}
                          className="p-1.5 text-slate-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        id="admin-category-modal"
        title={editingCategory ? 'Edit Store Category' : 'Add Store Category'}
        description={editingCategory ? 'Update aisle details and visibility.' : 'Create a new grocery department or aisle.'}
        size="md"
        hideFooter
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. Organic Staples & Grains"
              className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
            />
            {formErrors.name && <p className="text-[11px] text-danger-600 mt-0.5">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Slug Identifier *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="organic-staples-grains"
              className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary font-mono focus:border-brand-500 focus:outline-none"
            />
            {formErrors.slug && <p className="text-[11px] text-danger-600 mt-0.5">{formErrors.slug}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://cdn-icons-png.flaticon.com/..."
              className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Smart 3D Icon Auto-Detection Live Preview */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-b from-white to-[#f4faf6] border border-emerald-100/90 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-white border border-emerald-100 flex items-center justify-center shadow-xs shrink-0 p-1.5">
              <img
                src={resolveCategory3DIcon(formData.name, formData.slug, formData.image)}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://cdn-icons-png.flaticon.com/512/3081/3081986.png';
                }}
              />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Smart 2D Icon Auto-Detection</p>
              <p className="text-[11px] text-slate-500">
                {formData.image?.trim()
                  ? 'Using custom image provided above'
                  : 'Auto-detected based on category name/slug keywords. Leave blank to keep 2D icon.'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Description (Optional)
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Fresh organic grains and farm-milled flours..."
              className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cat-is-active"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="cat-is-active" className="text-xs font-medium text-text-primary">
              Active / Visible on Storefront
            </label>
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => categoryModal.close()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
