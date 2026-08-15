import { useEffect, useState, useMemo, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  ImagePlus,
  Check,
  AlertCircle,
} from 'lucide-react';

import apiClient from '@/services/apiClient';
import { ownerProductService } from '@/services/ownerService';
import { useToast } from '@/context/ToastContext';
import type { OwnerProduct } from '@/types';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

type StatusFilter = 'all' | 'active' | 'inactive';

interface ProductForm {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  sizes: string;
  colors: string;
  customizable: boolean;
  active: boolean;
  image: string;
}

const EMPTY_FORM: ProductForm = {
  name: '',
  description: '',
  category: '',
  price: 0,
  stock: 0,
  sizes: 'XS, S, M, L, XL',
  colors: 'Cream, Olive',
  customizable: false,
  active: true,
  image: '',
};

export default function OwnerProductsPage() {
  const { notify } = useToast();

  const [products, setProducts] = useState<OwnerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Categories are loaded from Django
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] =
    useState<string>('all');
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<ProductForm>(EMPTY_FORM);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] =
    useState<number | null>(null);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string>('');

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  // --------------------------------------------------
  // LOAD PRODUCTS + CATEGORIES
  // --------------------------------------------------

  useEffect(() => {
  const loadData = async () => {
    try {
      // Load products separately
      try {
        const productsData = await ownerProductService.list();
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to load products:', error);
      }

      // Load collection sections separately
      // Load product categories separately
try {
  const categoriesRes = await apiClient.get(
    '/catalog/sections/'
  );

  const categoriesData = Array.isArray(categoriesRes.data)
    ? categoriesRes.data
    : categoriesRes.data.results ?? [];

  console.log(
    'CATEGORIES FROM API:',
    categoriesData
  );

  const categoryNames = categoriesData
    .filter((category: any) => category.is_active)
    .map((category: any) => category.name);

  console.log(
    'PRODUCT CATEGORY OPTIONS:',
    categoryNames
  );

  setCategories(categoryNames);

  if (categoryNames.length > 0) {
    setForm((prev) => ({
      ...prev,
      category:
        prev.category || categoryNames[0],
    }));
  }
} catch (error) {
  console.error(
    'Failed to load product categories:',
    error
  );
  setCategories([]);
}
    } finally {
      setLoading(false);
      setCategoriesLoading(false);
    }
  };

  loadData();
}, []);

  // --------------------------------------------------
  // FILTER PRODUCTS
  // --------------------------------------------------

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (
        search &&
        !p.name
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false;
      }

      if (
        categoryFilter !== 'all' &&
        p.category !== categoryFilter
      ) {
        return false;
      }

      if (
        statusFilter === 'active' &&
        !p.active
      ) {
        return false;
      }

      if (
        statusFilter === 'inactive' &&
        p.active
      ) {
        return false;
      }

      return true;
    });
  }, [
    products,
    search,
    categoryFilter,
    statusFilter,
  ]);

  // --------------------------------------------------
  // OPEN ADD PRODUCT
  // --------------------------------------------------

  const openAdd = () => {
    setForm({
      ...EMPTY_FORM,
      category: categories[0] ?? '',
    });

    setEditingId(null);
    setErrors({});
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  };

  // --------------------------------------------------
  // OPEN EDIT PRODUCT
  // --------------------------------------------------

  const openEdit = (p: OwnerProduct) => {
    setForm({
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      stock: p.stock,
      sizes: p.sizes.join(', '),
      colors: p.colors.join(', '),
      customizable: p.customizable,
      active: p.active,
      image: p.image,
    });

    setEditingId(p.id);
    setErrors({});
    setImageFile(null);
    setImagePreview(p.image);
    setModalOpen(true);
  };

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.name.trim()) {
      e.name = 'Product name is required';
    }

    if (!form.description.trim()) {
      e.description =
        'Description is required';
    }

    if (!form.category.trim()) {
      e.category =
        'Please select a category';
    }

    if (form.price <= 0) {
      e.price =
        'Price must be greater than 0';
    }

    if (form.stock < 0) {
      e.stock =
        'Stock cannot be negative';
    }

    const sizes = form.sizes
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const allowedSizes = [
      'XS',
      'S',
      'M',
      'L',
      'XL',
      'XXL',
    ];

    if (sizes.length === 0) {
      e.sizes =
        'At least one size is required';
    } else {
      const invalidSizes = sizes.filter(
        (size) =>
          !allowedSizes.includes(size)
      );

      if (invalidSizes.length > 0) {
        e.sizes =
          `Invalid size: ${invalidSizes.join(
            ', '
          )}. Use XS, S, M, L, XL or XXL.`;
      }
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  // --------------------------------------------------
  // IMAGE SELECT
  // --------------------------------------------------

  const handleImageSelect = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify(
        'Please select an image file',
        'remove'
      );
      return;
    }

    setImageFile(file);

    const reader = new FileReader();

    reader.onload = () =>
      setImagePreview(
        reader.result as string
      );

    reader.readAsDataURL(file);
  };

  // --------------------------------------------------
  // SAVE PRODUCT
  // --------------------------------------------------

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append(
        'name',
        form.name.trim()
      );

      formData.append(
        'description',
        form.description.trim()
      );

      formData.append(
        'section',
      form.category
      );

      formData.append(
        'price',
        String(form.price)
      );

      formData.append(
        'stock',
        String(form.stock)
      );

      // Send sizes as JSON array
      const sizes = form.sizes
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      formData.append(
        'sizes',
        JSON.stringify(sizes)
      );

      // Send colors as JSON array
      const colors = form.colors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      formData.append(
        'colors',
        JSON.stringify(colors)
      );

      formData.append(
        'customizable',
        String(form.customizable)
      );

      formData.append(
        'active',
        String(form.active)
      );

      // New products are automatically shown in New Arrivals
      if (editingId === null) {
      formData.append('newArrival', 'true');
      }

      // Only send image when a new file is selected
      if (imageFile) {
        formData.append(
          'image',
          imageFile
        );
      }

      // --------------------------------------------------
      // UPDATE
      // --------------------------------------------------

      if (editingId !== null) {
        const updated =
          await ownerProductService.updateWithImage(
            editingId,
            formData
          );

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? updated
              : p
          )
        );

        notify(
          'Product updated',
          'info'
        );
      }

      // --------------------------------------------------
      // CREATE
      // --------------------------------------------------

      else {
        const created =
          await ownerProductService.createWithImage(
            formData
          );

        setProducts((prev) => [
          created,
          ...prev,
        ]);

        notify(
          'Product added',
          'info'
        );
      }

      setModalOpen(false);
      setImageFile(null);
      setImagePreview('');
      setErrors({});
    } catch (error: any) {
      console.error(
        'PRODUCT SAVE ERROR:',
        error
      );

      console.error(
        'SERVER RESPONSE:',
        error?.response?.data
      );

      const serverMessage =
        error?.response?.data?.category ||
        error?.response?.data?.detail;

      notify(
        serverMessage ||
          'Unable to save product',
        'remove'
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE PRODUCT
  // --------------------------------------------------

  const handleDelete = async (
    id: number
  ) => {
    try {
      await ownerProductService.remove(id);

      setProducts((prev) =>
        prev.filter(
          (p) => p.id !== id
        )
      );

      notify(
        'Product deleted',
        'remove'
      );
    } catch (error) {
      console.error(
        'DELETE PRODUCT ERROR:',
        error
      );

      notify(
        'Unable to delete product',
        'remove'
      );
    } finally {
      setConfirmDelete(null);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">
            Catalog
          </p>

          <h1 className="font-display text-3xl md:text-4xl text-token">
            Products
          </h1>

          <p className="font-body text-sm text-muted mt-2">
            Manage your boutique catalog.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="btn-primary px-5 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2"
        >
          <Plus size={14} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search products…"
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(
              e.target.value
            )
          }
          disabled={categoriesLoading}
          className="px-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors"
        >
          <option value="all">
            All Categories
          </option>

          {categories.map(
            (category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            )
          )}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value as StatusFilter
            )
          }
          className="px-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors"
        >
          <option value="all">
            All Status
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>
      </div>

      {/* Product Table */}
      <div className="mt-6 bg-surface border border-token overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-token">
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">
                Product
              </th>

              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3 hidden md:table-cell">
                Category
              </th>

              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">
                Price
              </th>

              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3 hidden sm:table-cell">
                Stock
              </th>

              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">
                Status
              </th>

              <th className="text-right font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 font-body text-sm text-muted"
                >
                  Loading products…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 font-body text-sm text-muted text-center"
                >
                  No products match your
                  filters.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-token last:border-0 hover:bg-token-alt transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-12 object-cover bg-token-alt shrink-0"
                      />

                      <div className="min-w-0">
                        <p className="font-display text-sm text-token line-clamp-1">
                          {p.name}
                        </p>

                        {p.customizable && (
                          <p
                            className="font-body text-[10px]"
                            style={{
                              color:
                                'var(--anim-bronze)',
                            }}
                          >
                            Customizable
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-body text-sm text-muted hidden md:table-cell">
                    {p.category}
                  </td>

                  <td className="px-4 py-3 font-body text-sm text-token">
                    {formatPrice(
                      p.price
                    )}
                  </td>

                  <td className="px-4 py-3 font-body text-sm hidden sm:table-cell">
                    <span
                      style={{
                        color:
                          p.stock <= 5
                            ? '#c0392b'
                            : 'var(--text)',
                      }}
                    >
                      {p.stock}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-[10px] uppercase tracking-[0.15em] font-body border ${
                        p.active
                          ? 'text-primary border-current'
                          : 'text-muted border-token'
                      }`}
                      style={
                        p.active
                          ? {
                              color:
                                'var(--anim-olive)',
                              borderColor:
                                'var(--anim-olive)',
                            }
                          : {}
                      }
                    >
                      {p.active
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() =>
                          openEdit(p)
                        }
                        aria-label="Edit product"
                        className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors"
                      >
                        <Edit2
                          size={15}
                        />
                      </button>

                      <button
                        onClick={() =>
                          setConfirmDelete(
                            p.id
                          )
                        }
                        aria-label="Delete product"
                        className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="fixed inset-0 z-[95] flex justify-center items-center px-4"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() =>
                setModalOpen(false)
              }
            />

            <motion.div
              initial={{
                y: 20,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: 20,
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
              }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-token border border-token shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl text-token">
                  {editingId !== null
                    ? 'Edit Product'
                    : 'Add Product'}
                </h2>

                <button
                  onClick={() =>
                    setModalOpen(false)
                  }
                  aria-label="Close"
                  className="h-8 w-8 flex items-center justify-center text-token hover:text-primary"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Image */}
                <div>
                  <label className="font-body text-sm text-token block mb-1.5">
                    Product Image
                  </label>

                  <div
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="aspect-video border-2 border-dashed border-token flex flex-col items-center justify-center text-muted cursor-pointer hover:border-primary transition-colors overflow-hidden"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <ImagePlus
                          size={28}
                          strokeWidth={1.4}
                        />

                        <p className="font-body text-xs mt-2">
                          Click to select an image
                        </p>
                      </>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageSelect
                    }
                    className="hidden"
                  />

                  {imageFile && (
                    <p className="font-body text-xs text-muted mt-1">
                      Selected:{' '}
                      {imageFile.name}
                    </p>
                  )}
                </div>

                {/* Product Name */}
                <FormFieldInput
                  label="Product Name"
                  value={form.name}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      name: v,
                    }))
                  }
                  error={errors.name}
                />

                {/* Description */}
                <div>
                  <label className="font-body text-sm text-token block mb-1.5">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        description:
                          e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors resize-none"
                    style={
                      errors.description
                        ? {
                            borderColor:
                              '#c0392b',
                          }
                        : {}
                    }
                  />

                  {errors.description && (
                    <p
                      className="flex items-center gap-1 font-body text-xs mt-1"
                      style={{
                        color:
                          '#c0392b',
                      }}
                    >
                      <AlertCircle
                        size={11}
                      />

                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Category + Price */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-sm text-token block mb-1.5">
                      Category
                    </label>

                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          category:
                            e.target.value,
                        }))
                      }
                      disabled={
                        categoriesLoading
                      }
                      className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors"
                      style={
                        errors.category
                          ? {
                              borderColor:
                                '#c0392b',
                            }
                          : {}
                      }
                    >
                      {categoriesLoading ? (
                        <option value="">
                          Loading categories...
                        </option>
                      ) : categories.length ===
                        0 ? (
                        <option value="">
                          No categories available
                        </option>
                      ) : (
                        categories.map(
                          (category) => (
                            <option
                              key={
                                category
                              }
                              value={
                                category
                              }
                            >
                              {category}
                            </option>
                          )
                        )
                      )}
                    </select>

                    {errors.category && (
                      <p
                        className="flex items-center gap-1 font-body text-xs mt-1"
                        style={{
                          color:
                            '#c0392b',
                        }}
                      >
                        <AlertCircle
                          size={11}
                        />

                        {errors.category}
                      </p>
                    )}
                  </div>

                  <FormFieldInput
                    label="Price (₹)"
                    type="number"
                    value={String(
                      form.price
                    )}
                    onChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        price:
                          Number(v) || 0,
                      }))
                    }
                    error={errors.price}
                  />
                </div>

                {/* Stock + Sizes */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormFieldInput
                    label="Stock"
                    type="number"
                    value={String(
                      form.stock
                    )}
                    onChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        stock:
                          Number(v) || 0,
                      }))
                    }
                    error={errors.stock}
                  />

                  <FormFieldInput
                    label="Sizes (comma separated)"
                    value={form.sizes}
                    onChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        sizes: v,
                      }))
                    }
                    error={errors.sizes}
                  />
                </div>

                {/* Colors */}
                <FormFieldInput
                  label="Colors (comma separated)"
                  value={form.colors}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      colors: v,
                    }))
                  }
                />

                {/* Checkboxes */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        form.customizable
                      }
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          customizable:
                            e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />

                    <span
                      className="h-4 w-4 border border-token flex items-center justify-center"
                      style={
                        form.customizable
                          ? {
                              background:
                                'var(--primary)',
                              borderColor:
                                'var(--primary)',
                            }
                          : {}
                      }
                    >
                      {form.customizable && (
                        <Check
                          size={11}
                          style={{
                            color:
                              'var(--btn-text)',
                          }}
                        />
                      )}
                    </span>

                    <span className="font-body text-sm text-token">
                      Customizable
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        form.active
                      }
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          active:
                            e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />

                    <span
                      className="h-4 w-4 border border-token flex items-center justify-center"
                      style={
                        form.active
                          ? {
                              background:
                                'var(--primary)',
                              borderColor:
                                'var(--primary)',
                            }
                          : {}
                      }
                    >
                      {form.active && (
                        <Check
                          size={11}
                          style={{
                            color:
                              'var(--btn-text)',
                          }}
                        />
                      )}
                    </span>

                    <span className="font-body text-sm text-token">
                      Active
                    </span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    'Saving…'
                  ) : (
                    <>
                      <Check size={15} />

                      {editingId !==
                      null
                        ? 'Save Changes'
                        : 'Add Product'}
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    setModalOpen(false)
                  }
                  className="btn-outline px-6 py-3 text-sm uppercase tracking-[0.2em] font-body"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="fixed inset-0 z-[95] flex justify-center items-center px-4"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() =>
                setConfirmDelete(null)
              }
            />

            <motion.div
              initial={{
                y: 20,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: 20,
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
              }}
              className="relative w-full max-w-sm bg-token border border-token shadow-2xl p-6"
            >
              <h3 className="font-display text-2xl text-token">
                Delete this product?
              </h3>

              <p className="font-body text-sm text-muted mt-2">
                This will remove the
                product from your
                catalog. This cannot
                be undone.
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() =>
                    handleDelete(
                      confirmDelete
                    )
                  }
                  className="btn-primary flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body"
                  style={{
                    background:
                      '#c0392b',
                    color: '#fff',
                  }}
                >
                  Delete
                </button>

                <button
                  onClick={() =>
                    setConfirmDelete(
                      null
                    )
                  }
                  className="btn-outline px-6 py-3 text-sm uppercase tracking-[0.2em] font-body"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --------------------------------------------------
// FORM FIELD
// --------------------------------------------------

function FormFieldInput({
  label,
  value,
  onChange,
  error,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="font-body text-sm text-token block mb-1.5">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors"
        style={
          error
            ? {
                borderColor:
                  '#c0392b',
              }
            : {}
        }
      />

      {error && (
        <p
          className="flex items-center gap-1 font-body text-xs mt-1"
          style={{
            color: '#c0392b',
          }}
        >
          <AlertCircle
            size={11}
          />

          {error}
        </p>
      )}
    </div>
  );
}