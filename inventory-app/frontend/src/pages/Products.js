import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import { productsAPI } from '../utils/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const INIT = { name: '', sku: '', description: '', price: '', quantity: '', category: '' };

function ProductForm({ initial = INIT, onSubmit, loading }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.price || isNaN(form.price) || +form.price < 0) e.price = 'Valid price required';
    if (form.quantity === '' || isNaN(form.quantity) || +form.quantity < 0) e.quantity = 'Valid quantity required';
    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({ ...form, price: +form.price, quantity: +form.quantity });
  };

  return (
    <form onSubmit={submit}>
      <div className="form-grid" style={{ gap: 16 }}>
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input className={`form-input${errors.name ? ' error' : ''}`} value={form.name}
              onChange={e => set('name', e.target.value)} placeholder="e.g. Wireless Mouse" />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">SKU / Code *</label>
            <input className={`form-input${errors.sku ? ' error' : ''}`} value={form.sku}
              onChange={e => set('sku', e.target.value)} placeholder="e.g. WM-001" />
            {errors.sku && <span className="form-error">{errors.sku}</span>}
          </div>
        </div>
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label">Price ($) *</label>
            <input type="number" step="0.01" min="0" className={`form-input${errors.price ? ' error' : ''}`}
              value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
            {errors.price && <span className="form-error">{errors.price}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input type="number" min="0" className={`form-input${errors.quantity ? ' error' : ''}`}
              value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="0" />
            {errors.quantity && <span className="form-error">{errors.quantity}</span>}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <input className="form-input" value={form.category}
            onChange={e => set('category', e.target.value)} placeholder="e.g. Electronics" />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={3} value={form.description}
            onChange={e => set('description', e.target.value)} placeholder="Optional product description..." />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </form>
  );
}

const getStockColor = (qty) => {
  if (qty === 0) return 'var(--accent-danger)';
  if (qty <= 5) return 'var(--accent-danger)';
  if (qty <= 10) return 'var(--accent-warning)';
  return 'var(--accent-success)';
};
function ProductCard({
  product,
  onEdit,
  onDelete
}) {

  const stockStatus =
    product.quantity === 0
      ? "Out of Stock"
      : product.quantity <= 10
      ? "Low Stock"
      : "In Stock";

  const stockColor =
    product.quantity === 0
      ? "var(--accent-danger)"
      : product.quantity <= 10
      ? "var(--accent-warning)"
      : "var(--accent-success)";

  return (
    <div className="product-card">

      <div className="product-card-top">

        <span className="product-category">
          {product.category || "General"}
        </span>

        <div className="product-actions">

          <button
            className="btn btn-ghost btn-icon"
            onClick={() => onEdit(product)}
          >
            <Pencil size={15} />
          </button>

          <button
            className="btn btn-ghost btn-icon"
            onClick={() => onDelete(product)}
          >
            <Trash2 size={15} />
          </button>

        </div>

      </div>

      <h3 className="product-name">
        {product.name}
      </h3>

      <div className="product-sku">
        {product.sku}
      </div>

      <p className="product-description">
        {product.description ||
          "No description available"}
      </p>

      <div className="product-footer">

        <div>

          <div className="product-price">
            ${product.price.toFixed(2)}
          </div>

          <div
            style={{
              color: stockColor,
              fontSize: 13
            }}
          >
            {stockStatus}
          </div>

        </div>

        <div className="product-stock-circle">
          {product.quantity}
        </div>

      </div>

    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = () => {
    setLoading(true);
    productsAPI.getAll().then(r => setProducts(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (data) => {
    setSaving(true);
    try {
      await productsAPI.create(data);
      toast.success('Product created successfully');
      setShowAdd(false);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally { setSaving(false); }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await productsAPI.update(editing.id, data);
      toast.success('Product updated successfully');
      setEditing(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await productsAPI.delete(deleting.id);
      toast.success('Product deleted');
      setDeleting(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally { setDeleteLoading(false); }
  };

  return (
    <div>
      <div className="products-hero">

  <div>

    <div className="hero-badge">
      INVENTORY MANAGEMENT
    </div>

    <h1>
      Products.
      <br />
      Organized Beautifully.
    </h1>

    <p>
      Manage stock, pricing,
      inventory levels and
      categories in one place.
    </p>

  </div>

</div>
      <div className="page-header">
        <div>
          <div className="page-title">Inventry</div>
          <div className="page-subtitle">Manage products across your business.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Add Product
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper">
            <Search size={15} />
            <input className="form-input search-input" placeholder="Search products..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="topbar-badge">{filtered.length} results</span>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Package size={40} />
              <h3>No products found</h3>
              <p>{search ? 'Try a different search term' : 'Add your first product to get started'}</p>
            </div>
          ) : (
            <div className="products-grid">

  {filtered.map(product => (

    <ProductCard
      key={product.id}
      product={product}
      onEdit={setEditing}
      onDelete={setDeleting}
    />

  ))}

</div>
          )}
        </div>
      </div>

      {showAdd && (
        <Modal title="Add New Product" onClose={() => setShowAdd(false)}>
          <ProductForm onSubmit={handleAdd} loading={saving} />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Product" onClose={() => setEditing(null)}>
          <ProductForm
            initial={{ name: editing.name, sku: editing.sku, description: editing.description || '',
              price: editing.price, quantity: editing.quantity, category: editing.category || '' }}
            onSubmit={handleUpdate} loading={saving} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete Product"
          message={`Are you sure you want to delete "${deleting.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
