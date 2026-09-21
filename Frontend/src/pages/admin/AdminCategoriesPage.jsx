import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import adminService from '../../services/admin.service.js';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal, { useModal } from '../../components/common/Modal.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { toast } from '../../components/common/Toast.jsx';
import {
  IconPlus,
  IconRefresh,
  IconGrid,
} from '../../utils/icons.jsx';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const categoryModal = useModal('admin-category-modal');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
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

  const categories = categoriesRes?.data?.items || categoriesRes?.data || [];

  const createCategoryMutation = useMutation({
    mutationFn: (payload) => adminService.createCategory(payload),
    onSuccess: () => {
      toast.success('Category Created', {
        description: 'New grocery category added successfully.',
      });
      categoryModal.close();
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-all'] });
    },
    onError: (err) => {
      toast.error('Creation Failed', {
        description: err?.message || 'Could not create category.',
      });
    },
  });

  const openAddModal = () => {
    setFormData({ name: '', slug: '', description: '', image: '' });
    setFormErrors({});
    categoryModal.open();
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData({ ...formData, name, slug });
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

    createCategoryMutation.mutate({
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim(),
      image: formData.image.trim(),
    });
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
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft/70 border-b border-border text-text-muted uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Slug Identifier</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((cat) => (
                  <tr key={cat._id || cat.slug} className="hover:bg-surface-soft/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="h-9 w-9 rounded-xl object-cover border border-border bg-surface-soft shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                            <IconGrid className="h-4 w-4" />
                          </div>
                        )}
                        <span className="font-semibold text-xs text-text-primary">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-text-muted text-[11px]">
                      {cat.slug}
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary truncate max-w-sm">
                      {cat.description || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={cat.isActive !== false ? 'success' : 'secondary'} size="xs">
                        {cat.isActive !== false ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      <Modal
        id="admin-category-modal"
        title="Add Store Category"
        description="Create a new grocery department or aisle."
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
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-border px-3 py-2 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
            />
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
              isLoading={createCategoryMutation.isPending}
            >
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
