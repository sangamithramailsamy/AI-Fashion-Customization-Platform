import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, ImagePlus, Check, AlertCircle } from 'lucide-react';
import { ownerProductService } from '@/services/ownerService';
import { useToast } from '@/context/ToastContext';
import type { OwnerProduct, ProductCategory } from '@/types';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

const CATEGORIES: ProductCategory[] = ['Traditional', 'Ethnic', 'Western', 'Party Wear', 'Casual Wear', 'Boutique Creation'];

type StatusFilter = 'all' | 'active' | 'inactive';

interface ProductForm {
  name: string;
  description: string;
  category: ProductCategory;
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
  category: 'Ethnic',
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
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ownerProductService.list().then(setProducts).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (statusFilter === 'active' && !p.active) return false;
      if (statusFilter === 'inactive' && p.active) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  };

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

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (form.price <= 0) e.price = 'Price must be greater than 0';
    if (form.stock < 0) e.stock = 'Stock cannot be negative';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Please select an image file', 'remove');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('name', form.name.trim());
        formData.append('description', form.description.trim());
        formData.append('category', form.category);
        formData.append('price', String(form.price));
        formData.append('stock', String(form.stock));
        formData.append('sizes', JSON.stringify(form.sizes.split(',').map((s) => s.trim()).filter(Boolean)));
        formData.append('colors', JSON.stringify(form.colors.split(',').map((c) => c.trim()).filter(Boolean)));
        formData.append('customizable', String(form.customizable));
        formData.append('active', String(form.active));
        formData.append('image', imageFile);
        if (editingId !== null) {
          const updated = await ownerProductService.updateWithImage(editingId, formData);
          setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
          notify('Product updated', 'info');
        } else {
          const created = await ownerProductService.createWithImage(formData);
          setProducts((prev) => [created, ...prev]);
          notify('Product added', 'info');
        }
      } else {
        const payload = {
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category,
          price: form.price,
          stock: form.stock,
          sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
          colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
          customizable: form.customizable,
          active: form.active,
          image: form.image || imagePreview || 'https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=900',
          createdAt: new Date().toISOString(),
        };
        if (editingId !== null) {
          const updated = await ownerProductService.update(editingId, payload);
          setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
          notify('Product updated', 'info');
        } else {
          const created = await ownerProductService.create(payload as OwnerProduct);
          setProducts((prev) => [created, ...prev]);
          notify('Product added', 'info');
        }
      }
      setModalOpen(false);
    } catch {
      notify('Unable to save product', 'remove');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ownerProductService.remove(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      notify('Product deleted', 'remove');
    } catch {
      notify('Unable to delete product', 'remove');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Catalog</p>
          <h1 className="font-display text-3xl md:text-4xl text-token">Products</h1>
          <p className="font-body text-sm text-muted mt-2">Manage your boutique catalog.</p>
        </div>
        <button onClick={openAdd} className="btn-primary px-5 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | 'all')}
          className="px-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="mt-6 bg-surface border border-token overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-token">
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Product</th>
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3 hidden md:table-cell">Category</th>
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Price</th>
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3 hidden sm:table-cell">Stock</th>
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Status</th>
              <th className="text-right font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 font-body text-sm text-muted">Loading products…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 font-body text-sm text-muted text-center">No products match your filters.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-token last:border-0 hover:bg-token-alt transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-12 object-cover bg-token-alt shrink-0" />
                      <div className="min-w-0">
                        <p className="font-display text-sm text-token line-clamp-1">{p.name}</p>
                        {p.customizable && <p className="font-body text-[10px]" style={{ color: 'var(--anim-bronze)' }}>Customizable</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-muted hidden md:table-cell">{p.category}</td>
                  <td className="px-4 py-3 font-body text-sm text-token">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 font-body text-sm hidden sm:table-cell">
                    <span style={{ color: p.stock <= 5 ? '#c0392b' : 'var(--text)' }}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-[10px] uppercase tracking-[0.15em] font-body border ${p.active ? 'text-primary border-current' : 'text-muted border-token'}`} style={p.active ? { color: 'var(--anim-olive)', borderColor: 'var(--anim-olive)' } : {}}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} aria-label="Edit product" className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setConfirmDelete(p.id)} aria-label="Delete product" className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[95] flex justify-center items-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-token border border-token shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl text-token">{editingId !== null ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setModalOpen(false)} aria-label="Close" className="h-8 w-8 flex items-center justify-center text-token hover:text-primary"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                {/* Image upload with preview */}
                <div>
                  <label className="font-body text-sm text-token block mb-1.5">Product Image</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video border-2 border-dashed border-token flex flex-col items-center justify-center text-muted cursor-pointer hover:border-primary transition-colors overflow-hidden"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImagePlus size={28} strokeWidth={1.4} />
                        <p className="font-body text-xs mt-2">Click to select an image</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  {imageFile && (
                    <p className="font-body text-xs text-muted mt-1">Selected: {imageFile.name}</p>
                  )}
                </div>

                <FormFieldInput label="Product Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} error={errors.name} />
                <div>
                  <label className="font-body text-sm text-token block mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors resize-none"
                    style={errors.description ? { borderColor: '#c0392b' } : {}}
                  />
                  {errors.description && <p className="flex items-center gap-1 font-body text-xs mt-1" style={{ color: '#c0392b' }}><AlertCircle size={11} /> {errors.description}</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-sm text-token block mb-1.5">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ProductCategory }))}
                      className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <FormFieldInput label="Price (₹)" type="number" value={String(form.price)} onChange={(v) => setForm((f) => ({ ...f, price: Number(v) || 0 }))} error={errors.price} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormFieldInput label="Stock" type="number" value={String(form.stock)} onChange={(v) => setForm((f) => ({ ...f, stock: Number(v) || 0 }))} error={errors.stock} />
                  <FormFieldInput label="Sizes (comma separated)" value={form.sizes} onChange={(v) => setForm((f) => ({ ...f, sizes: v }))} />
                </div>
                <FormFieldInput label="Colors (comma separated)" value={form.colors} onChange={(v) => setForm((f) => ({ ...f, colors: v }))} />

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.customizable} onChange={(e) => setForm((f) => ({ ...f, customizable: e.target.checked }))} className="sr-only peer" />
                    <span className="h-4 w-4 border border-token flex items-center justify-center" style={form.customizable ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
                      {form.customizable && <Check size={11} style={{ color: 'var(--btn-text)' }} />}
                    </span>
                    <span className="font-body text-sm text-token">Customizable</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="sr-only peer" />
                    <span className="h-4 w-4 border border-token flex items-center justify-center" style={form.active ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
                      {form.active && <Check size={11} style={{ color: 'var(--btn-text)' }} />}
                    </span>
                    <span className="font-body text-sm text-token">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? 'Saving…' : (<><Check size={15} /> {editingId !== null ? 'Save Changes' : 'Add Product'}</>)}
                </button>
                <button onClick={() => setModalOpen(false)} className="btn-outline px-6 py-3 text-sm uppercase tracking-[0.2em] font-body">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[95] flex justify-center items-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.3 }} className="relative w-full max-w-sm bg-token border border-token shadow-2xl p-6">
              <h3 className="font-display text-2xl text-token">Delete this product?</h3>
              <p className="font-body text-sm text-muted mt-2">This will remove the product from your catalog. This cannot be undone.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => handleDelete(confirmDelete)} className="btn-primary flex-1 py-3 text-sm uppercase tracking-[0.2em] font-body" style={{ background: '#c0392b', color: '#fff' }}>Delete</button>
                <button onClick={() => setConfirmDelete(null)} className="btn-outline px-6 py-3 text-sm uppercase tracking-[0.2em] font-body">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormFieldInput({ label, value, onChange, error, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; error?: string; type?: string }) {
  return (
    <div>
      <label className="font-body text-sm text-token block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors"
        style={error ? { borderColor: '#c0392b' } : {}}
      />
      {error && <p className="flex items-center gap-1 font-body text-xs mt-1" style={{ color: '#c0392b' }}><AlertCircle size={11} /> {error}</p>}
    </div>
  );
}
