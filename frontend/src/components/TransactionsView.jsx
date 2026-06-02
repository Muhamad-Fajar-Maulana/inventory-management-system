import React, { useState, useEffect } from 'react';
import Modal from './Modal';

export default function TransactionsView({ apiBaseUrl }) {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'in',
    quantity: 1,
    notes: ''
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      let txUrl = `${apiBaseUrl}/transactions?`;
      if (typeFilter) txUrl += `type=${typeFilter}&`;

      const [resTx, resProd] = await Promise.all([
        fetch(txUrl),
        fetch(`${apiBaseUrl}/products`)
      ]);

      if (!resTx.ok || !resProd.ok) throw new Error('Gagal memuat data transaksi');

      const dataTx = await resTx.json();
      const dataProd = await resProd.json();

      setTransactions(dataTx);
      setProducts(dataProd);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat log transaksi keluar masuk. Pastikan server backend Laravel berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [apiBaseUrl, typeFilter]);

  const showFeedback = (msg, isError = false) => {
    setFeedback({ message: msg, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({
      product_id: products[0]?.id || '',
      type: 'in',
      quantity: 1,
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBaseUrl}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity)
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal menambahkan transaksi');
      }

      showFeedback('Transaksi stok berhasil dicatat dan stok barang diperbarui!');
      setIsAddModalOpen(false);
      fetchTransactions();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleDeleteTransaction = async (txId) => {
    if (!window.confirm('Menghapus transaksi ini akan mengembalikan stok barang ke jumlah sebelumnya. Apakah Anda yakin?')) return;
    
    try {
      const res = await fetch(`${apiBaseUrl}/transactions/${txId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal menghapus transaksi');
      }

      showFeedback('Transaksi berhasil dihapus dan nilai stok telah disesuaikan kembali.');
      fetchTransactions();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const selectedProductInfo = products.find(p => p.id === parseInt(formData.product_id));

  return (
    <div className="main-content">
      <div className="view-header">
        <div className="view-title-section">
          <h1>Log Keluar Masuk Barang</h1>
          <p>Daftar lengkap riwayat keluar masuknya stok barang di gudang. Hapus transaksi untuk mengembalikan stok.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} disabled={products.length === 0}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Catat Transaksi
        </button>
      </div>

      {/* Alerts */}
      {feedback && (
        <div className={`alert-message ${feedback.isError ? 'alert-message-danger' : 'alert-message-success'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filters */}
      <div className="table-controls" style={{ justifyContent: 'flex-start' }}>
        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Semua Jenis Transaksi</option>
          <option value="in">Stok Masuk (In)</option>
          <option value="out">Stok Keluar (Out)</option>
        </select>
      </div>

      {/* Table list */}
      {loading && transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ borderTopColor: 'var(--primary)' }}></div>
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Memuat riwayat transaksi...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="table-responsive">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <h3>Belum Ada Transaksi</h3>
            <p>Klik tombol di atas untuk mencatat perpindahan stok masuk/keluar secara manual.</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Waktu & Tanggal</th>
                <th>SKU</th>
                <th>Nama Produk</th>
                <th>Jenis</th>
                <th>Jumlah</th>
                <th>Catatan</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const formattedDate = new Date(tx.transaction_date).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                
                return (
                  <tr key={tx.id}>
                    <td>
                      <span style={{ fontWeight: 500 }}>{formattedDate}</span>
                    </td>
                    <td className="sku-cell">{tx.product?.sku || 'N/A'}</td>
                    <td>
                      <strong className="product-name-bold">{tx.product?.name || 'Produk Dihapus'}</strong>
                    </td>
                    <td>
                      <span className={`badge ${tx.type === 'in' ? 'badge-type-in' : 'badge-type-out'}`}>
                        {tx.type === 'in' ? 'Stok Masuk (IN)' : 'Stok Keluar (OUT)'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {tx.type === 'in' ? '+' : '-'}{tx.quantity} {tx.product?.unit || 'unit'}
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>{tx.notes || '-'}</span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn btn-icon-only"
                        title="Batalkan & Hapus Transaksi"
                        style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        onClick={() => handleDeleteTransaction(tx.id)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- ADD TRANSACTION MODAL --- */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Pencatatan Keluar Masuk Stok">
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label htmlFor="product_id">Pilih Barang *</label>
            <select
              id="product_id"
              name="product_id"
              required
              className="filter-select"
              style={{ width: '100%' }}
              value={formData.product_id}
              onChange={handleInputChange}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku}) - Tersedia: {p.stock} {p.unit}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px' }}>Jenis Transaksi</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="type"
                  value="in"
                  checked={formData.type === 'in'}
                  onChange={handleInputChange}
                  style={{ width: '16px', height: '16px' }}
                />
                Stok Masuk (Pemasukan / Restock)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="type"
                  value="out"
                  checked={formData.type === 'out'}
                  onChange={handleInputChange}
                  style={{ width: '16px', height: '16px' }}
                />
                Stok Keluar (Penjualan / Rusak)
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Jumlah Unit *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              required
              min="1"
              className="form-control"
              value={formData.quantity}
              onChange={handleInputChange}
            />
            {selectedProductInfo && (
              <span className="form-help">Stok saat ini: {selectedProductInfo.stock} {selectedProductInfo.unit}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Catatan Transaksi</label>
            <input
              type="text"
              id="notes"
              name="notes"
              className="form-control"
              placeholder="Contoh: Pembelian grosir, Penjualan, Barang rusak, dll."
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <div className="modal-footer" style={{ paddingBottom: 0, paddingRight: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: formData.type === 'in' ? 'var(--success)' : 'var(--danger)' }}>
              {formData.type === 'in' ? 'Catat Stok Masuk' : 'Catat Stok Keluar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
