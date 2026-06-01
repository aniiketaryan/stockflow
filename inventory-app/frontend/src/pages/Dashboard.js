import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { dashboardAPI } from '../utils/api';

const StatCard = ({ label, value, icon: Icon, color, prefix = '' }) => (
  <div className="stat-card" style={{ '--stat-color': color }}>
    <div className="stat-icon"><Icon size={18} /></div>
    <div className="stat-value">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const statusBadge = (status) => {
  const map = {
    pending: 'badge-yellow',
    completed: 'badge-green',
    cancelled: 'badge-red',
    processing: 'badge-blue',
  };
  return map[status] || 'badge-gray';
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardAPI.getStats()
      .then((r) => setStats(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "var(--accent-danger)",
        }}
      >
        <AlertTriangle
          size={32}
          style={{ marginBottom: 12 }}
        />
        <div>
          Failed to load dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* HERO SECTION */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-badge">
            INVENTORY OPERATING SYSTEM
          </div>

          <h1>
            StockFlow.
            <br />
            Built For Growth.
          </h1>

          <p>
            Track inventory, customers,
            revenue and orders from a
            single intelligent workspace.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="stats-grid">

        <StatCard
          label="Products"
          value={stats.total_products}
          icon={Package}
          color="var(--accent-primary)"
        />

        <StatCard
          label="Customers"
          value={stats.total_customers}
          icon={Users}
          color="var(--accent-success)"
        />

        <StatCard
          label="Orders"
          value={stats.total_orders}
          icon={ShoppingCart}
          color="var(--accent-warning)"
        />

        <StatCard
          label="Revenue"
          value={stats.total_revenue.toFixed(2)}
          prefix="$"
          icon={DollarSign}
          color="var(--accent-primary)"
        />

      </div>

      {/* CONTENT GRID */}
      <div className="dashboard-grid">

        {/* LOW STOCK */}
        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <div className="panel-label">
                Inventory
              </div>

              <h3>
                Low Stock Alerts
              </h3>
            </div>

            <Link
              to="/products"
              className="panel-link"
            >
              View All
            </Link>

          </div>

          {stats.low_stock_products.length === 0 ? (
            <div className="dashboard-empty">
              <div className="success-dot" />
              Everything is fully stocked.
            </div>
          ) : (
            <div className="dashboard-list">

              {stats.low_stock_products.map((p) => (
                <div
                  key={p.id}
                  className="dashboard-item"
                >
                  <div>
                    <div className="item-title">
                      {p.name}
                    </div>

                    <div className="item-sub">
                      {p.sku}
                    </div>
                  </div>

                  <span
                    className={`badge ${
                      p.quantity === 0
                        ? "badge-red"
                        : "badge-yellow"
                    }`}
                  >
                    {p.quantity === 0
                      ? "Out"
                      : `${p.quantity} left`}
                  </span>
                </div>
              ))}

            </div>
          )}

        </div>

        {/* RECENT ORDERS */}
        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <div className="panel-label">
                Activity
              </div>

              <h3>
                Recent Orders
              </h3>

            </div>

            <Link
              to="/orders"
              className="panel-link"
            >
              View All
            </Link>

          </div>

          {stats.recent_orders.length === 0 ? (
            <div className="dashboard-empty">
              No orders yet.
            </div>
          ) : (
            <div className="dashboard-list">

              {stats.recent_orders.map((o) => (
                <div
                  key={o.id}
                  className="dashboard-item"
                >

                  <div>

                    <div className="item-title">
                      {o.customer?.full_name ||
                        "Unknown"}
                    </div>

                    <div className="item-sub">
                      Order #
                      {String(o.id).padStart(
                        4,
                        "0"
                      )}
                    </div>

                  </div>

                  <div
                    style={{
                      textAlign: "right",
                    }}
                  >

                    <div
                      style={{
                        fontWeight: 700,
                        color: "white",
                      }}
                    >
                      $
                      {o.total_amount.toFixed(2)}
                    </div>

                    <span
                      className={`badge ${statusBadge(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}