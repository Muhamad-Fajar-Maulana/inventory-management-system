import React, { useState, useEffect } from 'react';
import Modal from './Modal';

export default function ProductsView({ apiBaseUrl }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  
  // Active selected item for Edit / Stock Adjust
  const [currentProduct, setCurrentProduct] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    stock: 0,
    unit: 'pcs',
    purchase_price: '',
    selling_price: '',
    category_id: '',
    supplier_id: ''
  });

  const [adjustData, setAdjustData] = useState({
    type: 'in',
    quantity: 1,
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Build query string
      let productUrl = `${apiBaseUrl}/products?`;
      if (search) productUrl += `search=${encodeURIComponent(search)}&`;
      if (selectedCategory) productUrl += `category_id=${selectedCategory}&`;
      
      const [resProd, resCat, resSup] = await Promise.all([
        fetch(productUrl),
        fetch(`${apiBaseUrl}/categories`),
        fetch(`${apiBaseUrl}/suppliers`)
      ]);

      if (!resProd.ok || !resCat.ok || !resSup.ok) throw new Error('Gagal mengambil data dari API');

      const dataProd = await resProd.json();
      const dataCat = await resCat.json();
      const dataSup = await resSup.json();

      setProducts(dataProd);
      setCategories(dataCat);
      setSuppliers(dataSup);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat daftar produk. Pastikan server backend Laravel berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiBaseUrl, search, selectedCategory]);

  const showFeedback = (msg, isError = false) => {
    setFeedback({ message: msg, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdjustChange = (e) => {
    const { name, value } = e.target;
    setAdjustData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddModal = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      stock: 0,
      unit: 'pcs',
      purchase_price: '',
      selling_price: '',
      category_id: categories[0]?.id || '',
      supplier_id: suppliers[0]?.id || ''
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      stock: product.stock,
      unit: product.unit,
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      category_id: product.category_id || '',
      supplier_id: product.supplier_id || ''
    });
    setIsEditModalOpen(true);
  };

  const openAdjustModal = (product) => {
    setCurrentProduct(product);
    setAdjustData({
      type: 'in',
      quantity: 1,
      notes: ''
    });
    setIsAdjustModalOpen(true);
  };

  // Actions HTTP Calls
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBaseUrl}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal menambahkan barang');
      }

      showFeedback('Barang baru berhasil ditambahkan!');
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBaseUrl}/products/${currentProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal mengubah barang');
      }

      showFeedback('Barang berhasil diperbarui!');
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        product_id: currentProduct.id,
        type: adjustData.type,
        quantity: parseInt(adjustData.quantity),
        notes: adjustData.notes
      };

      const res = await fetch(`${apiBaseUrl}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal memproses transaksi stok');
      }

      showFeedback(`Penyesuaian stok berhasil dicatat!`);
      setIsAdjustModalOpen(false);
      fetchData();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus barang ini secara permanen dari sistem?')) return;
    
    try {
      const res = await fetch(`${apiBaseUrl}/products/${productId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Gagal menghapus barang');

      showFeedback('Barang berhasil dihapus.');
      fetchData();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const formatIDR = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="main-content">
      {/* Title */}
      <div className="view-header">
        <div className="view-title-section">
          <h1>Manajemen Inventaris Barang</h1>
          <p>Kelola semua barang inventaris Anda, lakukan pencatatan stok masuk/keluar, dan atur harga di sini.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Barang
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

      {/* Table Filters & Control */}
      <div className="table-controls">
        <div className="search-input-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="form-control"
            placeholder="Cari nama barang atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Table list */}
      {loading && products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ borderTopColor: 'var(--primary)' }}></div>
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Memuat data produk...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="table-responsive">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <h3>Barang Tidak Ditemukan</h3>
            <p>Belum ada produk yang cocok dengan pencarian Anda atau kategori kosong.</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>SKU / Kode</th>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th>Stok Tersedia</th>
                <th>Harga Beli</th>
                <th>Harga Jual</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => {
                // Stock level status
                let stockBadgeClass = 'badge-success';
                let stockStatus = 'Cukup';
                
                if (prod.stock === 0) {
                  stockBadgeClass = 'badge-danger';
                  stockStatus = 'Habis';
                } else if (prod.stock < 10) {
                  stockBadgeClass = 'badge-warning';
                  stockStatus = 'Kritis';
                }
                
                return (
                  <tr key={prod.id}>
                    <td className="sku-cell">{prod.sku}</td>
                    <td>
                      <span className="product-name-bold">{prod.name}</span>
                      {prod.description && <span className="product-desc-sub">{prod.description}</span>}
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ borderRadius: '6px', fontWeight: 500 }}>
                        {prod.category?.name || 'Tidak ada'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${stockBadgeClass}`} style={{ marginRight: '6px' }}>
                        {prod.stock} {prod.unit}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>
                        {stockStatus}
                      </span>
                    </td>
                    <td>{formatIDR(prod.purchase_price)}</td>
                    <td>{formatIDR(prod.selling_price)}</td>
                    <td className="actions-cell">
                      {/* Stock Adjustment button */}
                      <button
                        className="btn btn-icon-only"
                        title="Sesuaikan Stok"
                        style={{ color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                        onClick={() => openAdjustModal(prod)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                      </button>

                      {/* Edit Button */}
                      <button
                        className="btn btn-icon-only"
                        title="Edit Barang"
                        onClick={() => openEditModal(prod)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        className="btn btn-icon-only"
                        title="Hapus Barang"
                        style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        onClick={() => handleDeleteProduct(prod.id)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
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

      {/* --- ADD PRODUCT MODAL --- */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Tambah Barang Baru">
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nama Barang *</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="form-control"
              placeholder="Masukkan nama barang"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sku">SKU / Kode Produk</label>
              <input
                type="text"
                id="sku"
                name="sku"
                className="form-control"
                placeholder="Auto-generate jika kosong"
                value={formData.sku}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="unit">Satuan Barang *</label>
              <input
                type="text"
                id="unit"
                name="unit"
                required
                className="form-control"
                placeholder="Contoh: pcs, unit, rim"
                value={formData.unit}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="purchase_price">Harga Beli (IDR) *</label>
              <input
                type="number"
                id="purchase_price"
                name="purchase_price"
                required
                min="0"
                className="form-control"
                placeholder="Harga Kulakan"
                value={formData.purchase_price}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="selling_price">Harga Jual (IDR) *</label>
              <input
                type="number"
                id="selling_price"
                name="selling_price"
                required
                min="0"
                className="form-control"
                placeholder="Harga Penjualan"
                value={formData.selling_price}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category_id">Kategori</label>
              <select
                id="category_id"
                name="category_id"
                className="filter-select"
                style={{ width: '100%' }}
                value={formData.category_id}
                onChange={handleInputChange}
              >
                <option value="">Tidak Ada Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="supplier_id">Supplier Asal</label>
              <select
                id="supplier_id"
                name="supplier_id"
                className="filter-select"
                style={{ width: '100%' }}
                value={formData.supplier_id}
                onChange={handleInputChange}
              >
                <option value="">Tidak Ada Supplier</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stok Awal</label>
            <input
              type="number"
              id="stock"
              name="stock"
              min="0"
              className="form-control"
              placeholder="0 jika belum ada stok"
              value={formData.stock}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Deskripsi Barang</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="form-control"
              placeholder="Spesifikasi atau deskripsi produk"
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
              Simpan Barang
            </button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT PRODUCT MODAL --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Barang: ${currentProduct?.name}`}>
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label htmlFor="edit_name">Nama Barang *</label>
            <input
              type="text"
              id="edit_name"
              name="name"
              required
              className="form-control"
              placeholder="Masukkan nama barang"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit_sku">SKU / Kode Produk *</label>
              <input
                type="text"
                id="edit_sku"
                name="sku"
                required
                className="form-control"
                value={formData.sku}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit_unit">Satuan Barang *</label>
              <input
                type="text"
                id="edit_unit"
                name="unit"
                required
                className="form-control"
                value={formData.unit}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit_purchase_price">Harga Beli (IDR) *</label>
              <input
                type="number"
                id="edit_purchase_price"
                name="purchase_price"
                required
                min="0"
                className="form-control"
                value={formData.purchase_price}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit_selling_price">Harga Jual (IDR) *</label>
              <input
                type="number"
                id="edit_selling_price"
                name="selling_price"
                required
                min="0"
                className="form-control"
                value={formData.selling_price}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit_category_id">Kategori</label>
              <select
                id="edit_category_id"
                name="category_id"
                className="filter-select"
                style={{ width: '100%' }}
                value={formData.category_id}
                onChange={handleInputChange}
              >
                <option value="">Tidak Ada Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="edit_supplier_id">Supplier Asal</label>
              <select
                id="edit_supplier_id"
                name="supplier_id"
                className="filter-select"
                style={{ width: '100%' }}
                value={formData.supplier_id}
                onChange={handleInputChange}
              >
                <option value="">Tidak Ada Supplier</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit_stock">Stok Sekarang (Instan)</label>
            <input
              type="number"
              id="edit_stock"
              name="stock"
              min="0"
              className="form-control"
              value={formData.stock}
              onChange={handleInputChange}
            />
            <span className="form-help">Peringatan: Mengedit nilai stok langsung di sini tidak akan terdaftar di histori log.</span>
          </div>

          <div className="form-group">
            <label htmlFor="edit_description">Deskripsi Barang</label>
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
              Perbarui Barang
            </button>
          </div>
        </form>
      </Modal>

      {/* --- QUICK STOCK ADJUST MODAL --- */}
      <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title={`Pencatatan Keluar Masuk: ${currentProduct?.name}`}>
        <form onSubmit={handleAdjustSubmit}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px' }}>Jenis Pemasukan / Pengeluaran</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="type"
                  value="in"
                  checked={adjustData.type === 'in'}
                  onChange={handleAdjustChange}
                  style={{ width: '16px', height: '16px' }}
                />
                Stok Masuk (Pemasukan / Restock)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="type"
                  value="out"
                  checked={adjustData.type === 'out'}
                  onChange={handleAdjustChange}
                  style={{ width: '16px', height: '16px' }}
                />
                Stok Keluar (Penjualan / Rusak)
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adjust_qty">Jumlah Unit ({currentProduct?.unit}) *</label>
            <input
              type="number"
              id="adjust_qty"
              name="quantity"
              required
              min="1"
              className="form-control"
              value={adjustData.quantity}
              onChange={handleAdjustChange}
            />
            <span className="form-help">Stok saat ini: {currentProduct?.stock} {currentProduct?.unit}</span>
          </div>

          <div className="form-group">
            <label htmlFor="adjust_notes">Catatan Transaksi</label>
            <input
              type="text"
              id="adjust_notes"
              name="notes"
              className="form-control"
              placeholder="Contoh: Pembelian grosir, Barang rusak, Penjualan offline..."
              value={adjustData.notes}
              onChange={handleAdjustChange}
            />
          </div>

          <div className="modal-footer" style={{ paddingBottom: 0, paddingRight: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAdjustModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: adjustData.type === 'in' ? 'var(--success)' : 'var(--danger)' }}>
              {adjustData.type === 'in' ? 'Catat Stok Masuk' : 'Catat Stok Keluar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
