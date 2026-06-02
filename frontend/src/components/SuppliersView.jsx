import React, { useState, useEffect } from 'react';
import Modal from './Modal';

export default function SuppliersView({ apiBaseUrl }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Selection
  const [currentSupplier, setCurrentSupplier] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    phone: '',
    email: '',
    address: ''
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/suppliers`);
      if (!res.ok) throw new Error('Gagal memuat data supplier');
      const data = await res.json();
      setSuppliers(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat daftar supplier. Pastikan server backend Laravel berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [apiBaseUrl]);

  const showFeedback = (msg, isError = false) => {
    setFeedback({ message: msg, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({ name: '', contact_name: '', phone: '', email: '', address: '' });
    setIsAddModalOpen(true);
  };

  const openEditModal = (sup) => {
    setCurrentSupplier(sup);
    setFormData({
      name: sup.name,
      contact_name: sup.contact_name || '',
      phone: sup.phone || '',
      email: sup.email || '',
      address: sup.address || ''
    });
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBaseUrl}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal menambahkan supplier');
      }

      showFeedback('Supplier baru berhasil ditambahkan!');
      setIsAddModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBaseUrl}/suppliers/${currentSupplier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal mengubah supplier');
      }

      showFeedback('Supplier berhasil diperbarui!');
      setIsEditModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleDeleteSupplier = async (supId) => {
    if (!window.confirm('Menghapus supplier tidak akan menghapus barang terkait, namun informasi supplier pada barang tersebut akan dikosongkan. Lanjutkan?')) return;
    
    try {
      const res = await fetch(`${apiBaseUrl}/suppliers/${supId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Gagal menghapus supplier');

      showFeedback('Supplier berhasil dihapus.');
      fetchSuppliers();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  return (
    <div className="main-content">
      <div className="view-header">
        <div className="view-title-section">
          <h1>Pemasok / Supplier</h1>
          <p>Kelola kontak pemasok barang untuk mempermudah pemesanan ulang dan restock inventaris gudang.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Supplier
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

      {loading && suppliers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ borderTopColor: 'var(--primary)' }}></div>
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Memuat data supplier...</p>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="table-responsive">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            </svg>
            <h3>Belum Ada Supplier</h3>
            <p>Klik tombol di atas untuk mendaftarkan supplier baru.</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Nama Perusahaan</th>
                <th>PIC / Kontak</th>
                <th>No. Telepon</th>
                <th>Email</th>
                <th>Alamat</th>
                <th>Jumlah Barang</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((sup) => (
                <tr key={sup.id}>
                  <td>
                    <strong className="product-name-bold">{sup.name}</strong>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {sup.contact_name || '-'}
                    </span>
                  </td>
                  <td>{sup.phone || '-'}</td>
                  <td>{sup.email || '-'}</td>
                  <td>
                    <span className="product-desc-sub" style={{ maxWidth: '200px' }}>
                      {sup.address || 'Tidak ada alamat'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {sup.products_count} barang disuplai
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-icon-only"
                      title="Edit Supplier"
                      onClick={() => openEditModal(sup)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="btn btn-icon-only"
                      title="Hapus Supplier"
                      style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                      onClick={() => handleDeleteSupplier(sup.id)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- ADD SUPPLIER MODAL --- */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Tambah Supplier Baru">
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nama Perusahaan / Supplier *</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="form-control"
              placeholder="Contoh: PT. Sinar Abadi"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contact_name">Nama PIC (Kontak Personal)</label>
              <input
                type="text"
                id="contact_name"
                name="contact_name"
                className="form-control"
                placeholder="Contoh: Budi Santoso"
                value={formData.contact_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">No. Telepon / HP</label>
              <input
                type="text"
                id="phone"
                name="phone"
                className="form-control"
                placeholder="Contoh: 0812xxxxxx"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Alamat Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Contoh: sales@perusahaan.com"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Alamat Fisik</label>
            <textarea
              id="address"
              name="address"
              rows="3"
              className="form-control"
              placeholder="Tulis alamat kantor atau gudang supplier..."
              style={{ resize: 'vertical' }}
              value={formData.address}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="modal-footer" style={{ paddingBottom: 0, paddingRight: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Supplier
            </button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT SUPPLIER MODAL --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Supplier: ${currentSupplier?.name}`}>
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label htmlFor="edit_name">Nama Perusahaan / Supplier *</label>
            <input
              type="text"
              id="edit_name"
              name="name"
              required
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit_contact_name">Nama PIC</label>
              <input
                type="text"
                id="edit_contact_name"
                name="contact_name"
                className="form-control"
                value={formData.contact_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit_phone">No. Telepon</label>
              <input
                type="text"
                id="edit_phone"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit_email">Alamat Email</label>
            <input
              type="email"
              id="edit_email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit_address">Alamat Fisik</label>
            <textarea
              id="edit_address"
              name="address"
              rows="3"
              className="form-control"
              style={{ resize: 'vertical' }}
              value={formData.address}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="modal-footer" style={{ paddingBottom: 0, paddingRight: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Perbarui Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
