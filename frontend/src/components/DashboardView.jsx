import React, { useState, useEffect } from 'react';

export default function DashboardView({ apiBaseUrl, setActiveView }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/dashboard/stats`);
      if (!res.ok) throw new Error('Gagal mengambil data dasbor');
      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data statistik dasbor. Pastikan server backend Laravel berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [apiBaseUrl]);

  const formatIDR = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="main-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)' }}></div>
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Memuat data statistik dasbor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="alert-message alert-message-danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <h4 style={{ fontWeight: 600 }}>Terjadi Kesalahan</h4>
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={fetchStats} style={{ marginTop: '12px' }}>Coba Lagi</button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate high value representing max in daily transactions to scale columns correctly
  const maxQty = stats ? Math.max(...stats.chart_data.map(d => Math.max(d.in, d.out)), 1) : 1;

  return (
    <div className="main-content">
      <div className="view-header">
        <div className="view-title-section">
          <h1>Dashboard Analitik</h1>
          <p>Tinjauan statistik stok gudang dan operasional barang secara langsung.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchStats}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          Segarkan
        </button>
      </div>

      {/* Cards Metrik */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrapper icon-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            </svg>
          </div>
          <div className="metric-info">
            <h3>Total Jenis Barang</h3>
            <div className="metric-value">{stats?.total_products || 0}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper icon-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="metric-info">
            <h3>Total Aset Inventaris</h3>
            <div className="metric-value" style={{ fontSize: '20px', marginTop: '6px' }}>{formatIDR(stats?.total_asset_value || 0)}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper icon-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            </svg>
          </div>
          <div className="metric-info">
            <h3>Total Unit Stok</h3>
            <div className="metric-value">{stats?.total_stock || 0}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper icon-danger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="metric-info">
            <h3>Habis / Kritis</h3>
            <div className="metric-value">
              <span className="text-danger">{stats?.out_of_stock_count || 0}</span>
              <span style={{ fontSize: '14px', color: 'var(--text-light)', marginLeft: '6px', fontWeight: 500 }}>
                / {stats?.low_stock_count || 0} menipis
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Dashboard Panels */}
      <div className="dashboard-grid">
        {/* Bagan Aktivitas */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2>Grafik Transaksi Stok (7 Hari Terakhir)</h2>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color in"></div>
                <span>Stok Masuk</span>
              </div>
              <div className="legend-item">
                <div className="legend-color out"></div>
                <span>Stok Keluar</span>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <div className="bar-chart">
              {stats?.chart_data.map((dayData, idx) => {
                // Calculate height percentage relative to max quantity
                const inHeight = `${(dayData.in / maxQty) * 100}%`;
                const outHeight = `${(dayData.out / maxQty) * 100}%`;
                
                return (
                  <div key={idx} className="bar-column">
                    <div className="bar-group">
                      <div
                        className="bar in"
                        style={{ height: inHeight }}
                        data-value={dayData.in}
                      ></div>
                      <div
                        className="bar out"
                        style={{ height: outHeight }}
                        data-value={dayData.out}
                      ></div>
                    </div>
                    <span className="bar-label">{dayData.day.substring(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Peringatan Stok Menipis */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2>Stok Menipis (&lt; 10)</h2>
            <span className="badge badge-warning">{stats?.low_stock_products.length || 0} item</span>
          </div>

          {stats?.low_stock_products.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <h3 style={{ fontSize: '14px' }}>Semua Aman</h3>
              <p style={{ fontSize: '12px' }}>Stok seluruh barang terpenuhi dengan baik.</p>
            </div>
          ) : (
            <div className="low-stock-panel-list">
              {stats?.low_stock_products.map((prod) => (
                <div key={prod.id} className="low-stock-item">
                  <div className="low-stock-item-info">
                    <h4>{prod.name}</h4>
                    <span>SKU: {prod.sku}</span>
                  </div>
                  <div>
                    <span className={`badge ${prod.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                      {prod.stock} {prod.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Baris Aktivitas Terakhir */}
      <div className="dashboard-panel" style={{ width: '100%' }}>
        <div className="panel-header">
          <h2>Riwayat Aktivitas Terakhir</h2>
          <button className="btn btn-secondary" onClick={() => setActiveView('transactions')} style={{ padding: '6px 12px', fontSize: '12px' }}>
            Lihat Semua
          </button>
        </div>

        {stats?.recent_transactions.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h3>Belum Ada Transaksi</h3>
            <p>Transaksi stok masuk atau keluar belum tercatat.</p>
          </div>
        ) : (
          <div className="recent-activities-list">
            {stats?.recent_transactions.map((tx) => {
              const formattedDate = new Date(tx.transaction_date).toLocaleString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });
              
              return (
                <div key={tx.id} className="activity-item">
                  <div className={`activity-badge ${tx.type}`}></div>
                  <div className="activity-content">
                    <span className="activity-title">
                      {tx.type === 'in' ? 'Stok Masuk' : 'Stok Keluar'}: <strong>{tx.quantity} {tx.product?.unit}</strong> dari <strong>{tx.product?.name}</strong>
                    </span>
                    {tx.notes && <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>{tx.notes}</p>}
                    <div className="activity-meta">{formattedDate}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
