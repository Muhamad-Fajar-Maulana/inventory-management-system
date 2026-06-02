import React, { useState, useEffect } from 'react';
import Modal from './Modal';

export default function CategoriesView({ apiBaseUrl }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Selection
  const [currentCategory, setCurrentCategory] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/categories`);
      if (!res.ok) throw new Error('Gagal memuat kategori');
      const data = await res.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat daftar kategori. Pastikan server backend Laravel berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
    setFormData({ name: '', description: '' });
    setIsAddModalOpen(true);
  };

  const openEditModal = (cat) => {
    setCurrentCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBaseUrl}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal menambahkan kategori');
      }

      showFeedback('Kategori baru berhasil ditambahkan!');
      setIsAddModalOpen(false);
      fetchCategories();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBaseUrl}/categories/${currentCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal mengubah kategori');
      }

      showFeedback('Kategori berhasil diperbarui!');
      setIsEditModalOpen(false);
      fetchCategories();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Menghapus kategori ini tidak akan menghapus barang terkait, tetapi kategori barang tersebut akan dikosongkan. Apakah Anda yakin?')) return;
    
    try {
      const res = await fetch(`${apiBaseUrl}/categories/${catId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Gagal menghapus kategori');

      showFeedback('Kategori berhasil dihapus.');
      fetchCategories();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  return (
    <div className="main-content">
      <div className="view-header">
        <div className="view-title-section">
          <h1>Kategori Barang</h1>
          <p>Klasifikasikan produk Anda ke dalam kategori agar lebih terstruktur dan mudah dikelola.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Kategori
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

      {loading && categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ borderTopColor: 'var(--primary)' }}></div>
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Memuat data kategori...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="table-responsive">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            </svg>
            <h3>Belum Ada Kategori</h3>
            <p>Klik tombol di atas untuk membuat kategori baru.</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Nama Kategori</th>
                <th>Deskripsi</th>
                <th>Jumlah Barang</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>#{cat.id}</td>
                  <td>
                    <strong className="product-name-bold">{cat.name}</strong>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {cat.description || 'Tidak ada deskripsi'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {cat.products_count} jenis barang
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-icon-only"
                      title="Edit Kategori"
                      onClick={() => openEditModal(cat)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="btn btn-icon-only"
                      title="Hapus Kategori"
                      style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                      onClick={() => handleDeleteCategory(cat.id)}
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

      {/* --- ADD CATEGORY MODAL --- */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Tambah Kategori Baru">
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nama Kategori *</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="form-control"
              placeholder="Contoh: Elektronik, ATK, Makanan"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Deskripsi</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="form-control"
              placeholder="Tulis penjelasan singkat kategori di sini..."
              style={{ resize: 'vertical' }}
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="modal-footer" style={{ paddingBottom: 0, paddingRight: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Kategori
            </button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT CATEGORY MODAL --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Kategori: ${currentCategory?.name}`}>
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label htmlFor="edit_name">Nama Kategori *</label>
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

          <div className="form-group">
            <label htmlFor="edit_description">Deskripsi</label>
            <textarea
              id="edit_description"
              name="description"
              rows="3"
              className="form-control"
              style={{ resize: 'vertical' }}
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="modal-footer" style={{ paddingBottom: 0, paddingRight: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Perbarui Kategori
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
