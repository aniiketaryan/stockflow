import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Users, Mail, Phone } from 'lucide-react';
import { customersAPI } from '../utils/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const INIT = { full_name: '', email: '', phone: '', address: '' };

function CustomerForm({ onSubmit, loading }) {
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form);
  };

  return (
  <div>

    {/* HERO SECTION */}
    <div className="customers-hero">
      <div>
        <div className="hero-badge">
          CUSTOMER RELATIONSHIP MANAGEMENT
        </div>

        <h1>
          Customers.
          <br />
          Built Around People.
        </h1>

        <p>
          Manage customer relationships, contact information,
          and business interactions from one beautiful workspace.
        </p>
      </div>
    </div>

    <div className="page-header">
      <div>
        <div className="page-title">
          People.
        </div>

        <div className="page-subtitle">
          {customers.length} active customer profiles
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={() => setShowAdd(true)}
      >
        <Plus size={15} />
        Add Customer
      </button>
    </div>

    <div className="card">

      <div className="card-header">

        <div className="search-wrapper">
          <Search size={15} />

          <input
            className="form-input search-input"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span className="topbar-badge">
          {filtered.length} results
        </span>

      </div>

      <div className="card-body">

        {loading ? (

          <div className="loading-spinner">
            <div className="spinner" />
          </div>

        ) : filtered.length === 0 ? (

          <div className="empty-state">
            <Users size={42} />
            <h3>No customers found</h3>
            <p>
              {search
                ? 'Try a different search term'
                : 'Add your first customer to get started'}
            </p>
          </div>

        ) : (

          <div className="customers-grid">

            {filtered.map((customer) => (

              <div
                key={customer.id}
                className="customer-card"
              >

                <div className="customer-top">

                  <div className="customer-avatar">
                    {customer.full_name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setDeleting(customer)}
                    style={{
                      color: 'var(--accent-danger)'
                    }}
                  >
                    <Trash2 size={15} />
                  </button>

                </div>

                <h3 className="customer-name">
                  {customer.full_name}
                </h3>

                <div className="customer-meta">

                  <div className="customer-info">
                    <Mail size={14} />
                    {customer.email}
                  </div>

                  {customer.phone && (
                    <div className="customer-info">
                      <Phone size={14} />
                      {customer.phone}
                    </div>
                  )}

                </div>

                {customer.address && (
                  <div className="customer-address">
                    {customer.address}
                  </div>
                )}

                <div className="customer-footer">

                  <span className="customer-date">
                    Joined{" "}
                    {customer.created_at
                      ? new Date(
                          customer.created_at
                        ).toLocaleDateString()
                      : "Recently"}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

    {showAdd && (
      <Modal
        title="Add New Customer"
        onClose={() => setShowAdd(false)}
      >
        <CustomerForm
          onSubmit={handleAdd}
          loading={saving}
        />
      </Modal>
    )}

    {deleting && (
      <ConfirmDialog
        title="Delete Customer"
        message={`Delete "${deleting.full_name}"? Their order history will also be removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    )}

  </div>
);
}
function CustomerCard({ customer, onDelete }) {
  const initials = customer.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="customer-card">

      <div className="customer-top">

        <div className="customer-avatar">
          {initials}
        </div>

        <button
          className="btn btn-ghost btn-icon"
          onClick={() => onDelete(customer)}
          style={{ color: 'var(--accent-danger)' }}
        >
          <Trash2 size={15} />
        </button>

      </div>

      <h3 className="customer-name">
        {customer.full_name}
      </h3>

      <div className="customer-meta">

        <div className="customer-info">
          <Mail size={14} />
          {customer.email}
        </div>

        {customer.phone && (
          <div className="customer-info">
            <Phone size={14} />
            {customer.phone}
          </div>
        )}

      </div>

      {customer.address && (
        <div className="customer-address">
          {customer.address}
        </div>
      )}

      <div className="customer-footer">

        <span className="customer-date">
          Joined{" "}
          {customer.created_at
            ? new Date(customer.created_at).toLocaleDateString()
            : "Recently"}
        </span>

      </div>

    </div>
  );
}
export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = () => {
    setLoading(true);
    customersAPI.getAll().then(r => setCustomers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  const handleAdd = async (data) => {
    setSaving(true);
    try {
      await customersAPI.create(data);
      toast.success('Customer added successfully');
      setShowAdd(false);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await customersAPI.delete(deleting.id);
      toast.success('Customer deleted');
      setDeleting(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally { setDeleteLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Customers</div>
          <div className="page-subtitle">{customers.length} registered customers</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Add Customer
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper">
            <Search size={15} />
            <input className="form-input search-input" placeholder="Search customers..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="topbar-badge">{filtered.length} results</span>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Users size={40} />
              <h3>No customers found</h3>
              <p>{search ? 'Try a different search term' : 'Add your first customer to get started'}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0
                        }}>
                          {c.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="td-primary">{c.full_name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-accent)', fontSize: 13 }}>
                        <Mail size={12} /> {c.email}
                      </div>
                    </td>
                    <td>
                      {c.phone
                        ? <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><Phone size={12} /> {c.phone}</div>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ maxWidth: 180 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {c.address ? c.address.substring(0, 40) + (c.address.length > 40 ? '...' : '') : '—'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-icon" title="Delete"
                        onClick={() => setDeleting(c)}
                        style={{ color: 'var(--accent-danger)' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAdd && (
        <Modal title="Add New Customer" onClose={() => setShowAdd(false)}>
          <CustomerForm onSubmit={handleAdd} loading={saving} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete Customer"
          message={`Delete "${deleting.full_name}"? Their order history will also be removed.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
