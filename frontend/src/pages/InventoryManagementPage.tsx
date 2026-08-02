import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Check, AlertCircle, ImagePlus, AlertTriangle } from 'lucide-react';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const;
const COLOR_OPTIONS = ['Red', 'Blue', 'Black', 'White', 'Green', 'Pink', 'Yellow', 'Maroon', 'Gold', 'Silver', 'Purple', 'Orange'] as const;
import { ownerProductService } from '@/services/ownerService';
import { useCatalog } from '@/context/CatalogContext';
import { useToast } from '@/context/ToastContext';
import type { OwnerProduct, ProductCategory } from '@/types';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

const CATEGORIES: ProductCategory[] = ['Traditional', 'Ethnic', 'Western', 'Party Wear', 'Casual Wear', 'Boutique Creation'];
const LOW_STOCK_THRESHOLD = 5;

type StatusFilter = 'all' | 'active' | 'inactive' | 'low';

interface ProductForm {
  name: string;
  description: string;
  category: ProductCategory;
  collection: string;
  price: number;
  stock: number;
  sizes: string[];
  colors: string[];
  customizable: boolean;
  active: boolean;
  image: string;
}

const EMPTY_FORM: ProductForm = {
  name: '', description: '', category: 'Ethnic', collection: 'ethnic',
  price: 0, stock: 0, sizes: [], colors: [],
  customizable: false, active: true, image: '',
};

export default function InventoryManagementPage() {
  const { notify } = useToast();
  const { collections } = useCatalog();
  const [products, setProducts] = useState<OwnerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [collectionFilter, setCollectionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    ownerProductService.list().then(setProducts).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (collectionFilter !== 'all') {
        const prodCollection = collections.find((c) => c.name === p.category)?.slug ?? '';
        if (prodCollection !== collectionFilter) return false;
      }
      if (statusFilter === 'active' && !p.active) return false;
      if (statusFilter === 'inactive' && p.active) return false;
      if (statusFilter === 'low' && p.stock > LOW_STOCK_THRESHOLD) return false;
      return true;
    });
  }, [products, search, categoryFilter, collectionFilter, statusFilter]);

  const lowStockCount = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const inventoryValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setErrors({}); setModalOpen(true); };
  const openEdit = (p: OwnerProduct) => {
    setForm({
      name: p.name, description: p.description, category: p.category,
      collection: collections.find((c) => c.name === p.category)?.slug ?? 'ethnic',
      price: p.price, stock: p.stock, sizes: p.sizes, colors: p.colors,
      customizable: p.customizable, active: p.active, image: p.image,
    });
    setEditingId(p.id); setErrors({}); setModalOpen(true);
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

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(), description: form.description.trim(), category: form.category,
      price: form.price, stock: form.stock,
      sizes: form.sizes,
      colors: form.colors,
      customizable: form.customizable, active: form.active,
      image: form.image || 'https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=900',
      createdAt: new Date().toISOString(),
    };
    try {
      if (editingId !== null) {
        const updated = await ownerProductService.update(editingId, payload);
        setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        notify('Product updated', 'info');
      } else {
        const created = await ownerProductService.create(payload as OwnerProduct);
        setProducts((prev) => [created, ...prev]);
        notify('Product added', 'info');
      }
      setModalOpen(false);
    } catch { notify('Unable to save product', 'remove'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await ownerProductService.remove(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      notify('Product deleted', 'remove');
    } catch { notify('Unable to delete product', 'remove'); }
    finally { setConfirmDelete(null); }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Inventory</p>
          <h1 className="font-display text-3xl md:text-4xl text-token">Inventory Management</h1>
          <p className="font-body text-sm text-muted mt-2">Track stock levels and manage your catalog.</p>
        </div>
        <button onClick={openAdd} className="btn-primary px-5 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-surface border border-token p-4">
          <p className="font-display text-2xl text-token">{products.length}</p>
          <p className="font-body text-xs text-muted uppercase tracking-[0.1em] mt-0.5">Products</p>
        </div>
        <div className="bg-surface border border-token p-4">
          <p className="font-display text-2xl text-token">{totalStock}</p>
          <p className="font-body text-xs text-muted uppercase tracking-[0.1em] mt-0.5">Units in Stock</p>
        </div>
        <div className="bg-surface border border-token p-4">
          <p className="font-display text-2xl" style={{ color: lowStockCount > 0 ? '#c0392b' : 'var(--text)' }}>{lowStockCount}</p>
          <p className="font-body text-xs text-muted uppercase tracking-[0.1em] mt-0.5">Low Stock</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="w-full pl-10 pr-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | 'all')} className="px-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors">
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={collectionFilter} onChange={(e) => setCollectionFilter(e.target.value)} className="px-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors">
          <option value="all">All Collections</option>
          {collections.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="px-4 py-2.5 bg-surface border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="low">Low Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="mt-6 bg-surface border border-token overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-token">
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Product</th>
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3 hidden md:table-cell">Category</th>
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3 hidden lg:table-cell">Collection</th>
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Price</th>
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Stock</th>
              <th className="text-left font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Status</th>
              <th className="text-right font-body text-xs uppercase tracking-[0.15em] text-muted px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 font-body text-sm text-muted">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 font-body text-sm text-muted text-center">No products match your filters.</td></tr>
            ) : (
              filtered.map((p) => {
                const collectionName = collections.find((c) => c.slug === (collections.find((col) => col.name === p.category)?.slug ?? ''))?.name ?? p.category;
                const isLow = p.stock <= LOW_STOCK_THRESHOLD;
                return (
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
                    <td className="px-4 py-3 font-body text-sm text-muted hidden lg:table-cell">{collectionName}</td>
                    <td className="px-4 py-3 font-body text-sm text-token">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-body text-sm font-medium ${isLow ? 'flex items-center gap-1' : ''}`} style={{ color: isLow ? '#c0392b' : 'var(--text)' }}>
                        {isLow && <AlertTriangle size={12} />}{p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-[10px] uppercase tracking-[0.15em] font-body border" style={p.active ? { color: 'var(--anim-olive)', borderColor: 'var(--anim-olive)' } : { color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} aria-label="Edit" className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors"><Edit2 size={15} /></button>
                        <button onClick={() => setConfirmDelete(p.id)} aria-label="Delete" className="h-8 w-8 flex items-center justify-center text-muted hover:text-primary transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[95] flex justify-center items-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.3 }} className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-token border border-token shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl text-token">{editingId !== null ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setModalOpen(false)} aria-label="Close" className="h-8 w-8 flex items-center justify-center text-token hover:text-primary"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div className="aspect-video border-2 border-dashed border-token flex flex-col items-center justify-center text-muted">
                  {form.image ? <img src={form.image} alt="Preview" className="w-full h-full object-cover" /> : (
                    <><ImagePlus size={28} strokeWidth={1.4} /><p className="font-body text-xs mt-2">Image upload (Cloudinary later)</p></>
                  )}
                </div>
                <FormInput label="Product Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} error={errors.name} />
                <div>
                  <label className="font-body text-sm text-token block mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors resize-none" style={errors.description ? { borderColor: '#c0392b' } : {}} />
                  {errors.description && <p className="flex items-center gap-1 font-body text-xs mt-1" style={{ color: '#c0392b' }}><AlertCircle size={11} /> {errors.description}</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-sm text-token block mb-1.5">Category</label>
                    <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ProductCategory }))} className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors">
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-body text-sm text-token block mb-1.5">Collection</label>
                    <select value={form.collection} onChange={(e) => setForm((f) => ({ ...f, collection: e.target.value }))} className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors">
                      {collections.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormInput label="Price (₹)" type="number" value={String(form.price)} onChange={(v) => setForm((f) => ({ ...f, price: Number(v) || 0 }))} error={errors.price} />
                  <FormInput label="Stock Quantity" type="number" value={String(form.stock)} onChange={(v) => setForm((f) => ({ ...f, stock: Number(v) || 0 }))} error={errors.stock} />
                </div>
                <div>
                  <label className="font-body text-sm text-token block mb-1.5">Sizes</label>
                  <ChipMultiSelect
                    options={[...SIZE_OPTIONS]}
                    selected={form.sizes}
                    onToggle={(v) => setForm((f) => ({ ...f, sizes: f.sizes.includes(v) ? f.sizes.filter((s) => s !== v) : [...f.sizes, v] }))}
                  />
                </div>
                <div>
                  <label className="font-body text-sm text-token block mb-1.5">Colors</label>
                  <ChipMultiSelect
                    options={[...COLOR_OPTIONS]}
                    selected={form.colors}
                    onToggle={(v) => setForm((f) => ({ ...f, colors: f.colors.includes(v) ? f.colors.filter((c) => c !== v) : [...f.colors, v] }))}
                  />
                </div>
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
              <p className="font-body text-sm text-muted mt-2">This will remove the product from your inventory. This cannot be undone.</p>
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

function FormInput({ label, value, onChange, error, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; error?: string; type?: string }) {
  return (
    <div>
      <label className="font-body text-sm text-token block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3 bg-token-alt border border-token font-body text-sm text-token outline-none focus:border-primary transition-colors" style={error ? { borderColor: '#c0392b' } : {}} />
      {error && <p className="flex items-center gap-1 font-body text-xs mt-1" style={{ color: '#c0392b' }}><AlertCircle size={11} /> {error}</p>}
    </div>
  );
}

function ChipMultiSelect({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className="px-3 py-2 font-body text-xs uppercase tracking-[0.1em] border transition-colors"
            style={
              active
                ? { background: 'var(--primary)', borderColor: 'var(--primary)', color: 'var(--btn-text)' }
                : { background: 'var(--bg-alt)', borderColor: 'var(--border)', color: 'var(--text-muted)' }
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
