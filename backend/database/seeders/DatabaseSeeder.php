<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create a Test User
        User::factory()->create([
            'name' => 'Admin Gudang',
            'email' => 'admin@inventory.com',
            'password' => bcrypt('password'),
        ]);

        // 2. Create Categories
        $catElectronics = Category::create([
            'name' => 'Elektronik',
            'description' => 'Gawai, komputer, komponen, dan perlengkapan elektronik lainnya.',
        ]);

        $catOffice = Category::create([
            'name' => 'Alat Kantor',
            'description' => 'Alat tulis kantor (ATK), meja, kursi, kertas, dan perlengkapan kerja.',
        ]);

        $catAccessories = Category::create([
            'name' => 'Aksesoris',
            'description' => 'Aksesoris gawai, mouse pad, keyboard bag, dan aksesoris lainnya.',
        ]);

        // 3. Create Suppliers
        $supSinar = Supplier::create([
            'name' => 'PT. Sinar Jaya Abadi',
            'contact_name' => 'Budi Santoso',
            'phone' => '081234567890',
            'email' => 'sales@sinarjaya.com',
            'address' => 'Jl. Industri Raya No. 45, Jakarta Pusat',
        ]);

        $supMegah = Supplier::create([
            'name' => 'CV. Megah Utama',
            'contact_name' => 'Siti Aminah',
            'phone' => '085777666555',
            'email' => 'info@megahutama.co.id',
            'address' => 'Ruko Maspion Blok B-12, Surabaya',
        ]);

        $supGlobal = Supplier::create([
            'name' => 'PT. Global Tech Indonesia',
            'contact_name' => 'Kevin Wijaya',
            'phone' => '082199887766',
            'email' => 'kevin@globaltech.com',
            'address' => 'Soma Tower Lt. 15, Bandung',
        ]);

        // 4. Create Products and initial Stocks
        $prodLaptop = Product::create([
            'sku' => 'PRD-ASUSROG',
            'name' => 'Laptop ASUS ROG Strix G16',
            'description' => 'Laptop gaming Intel i7 Gen 13, RAM 16GB, SSD 512GB, RTX 4060.',
            'stock' => 15,
            'unit' => 'unit',
            'purchase_price' => 16500000.00,
            'selling_price' => 19999000.00,
            'category_id' => $catElectronics->id,
            'supplier_id' => $supGlobal->id,
        ]);

        $prodMouse = Product::create([
            'sku' => 'PRD-LOGIG502',
            'name' => 'Mouse Logitech G502 X Plus',
            'description' => 'Mouse gaming wireless sensor HERO 25K, RGB lightsync.',
            'stock' => 8,
            'unit' => 'pcs',
            'purchase_price' => 1400000.00,
            'selling_price' => 1950000.00,
            'category_id' => $catAccessories->id,
            'supplier_id' => $supSinar->id,
        ]);

        $prodKeyboard = Product::create([
            'sku' => 'PRD-KEYMECH',
            'name' => 'Keyboard Mechanical Noir N1',
            'description' => 'Keyboard mechanical layout 65%, Gateron Yellow Switch, Hotswappable.',
            'stock' => 3,
            'unit' => 'pcs',
            'purchase_price' => 850000.00,
            'selling_price' => 1250000.00,
            'category_id' => $catAccessories->id,
            'supplier_id' => $supSinar->id,
        ]);

        $prodKertas = Product::create([
            'sku' => 'PRD-PAPERHVS',
            'name' => 'Kertas PaperOne HVS A4 80gr',
            'description' => 'Kertas fotokopi berkualitas tinggi ukuran A4, ketebalan 80 gram.',
            'stock' => 50,
            'unit' => 'rim',
            'purchase_price' => 48000.00,
            'selling_price' => 58000.00,
            'category_id' => $catOffice->id,
            'supplier_id' => $supMegah->id,
        ]);

        $prodMeja = Product::create([
            'sku' => 'PRD-ERGODESK',
            'name' => 'Meja Kerja Ergonomis Adjustable',
            'description' => 'Meja kantor yang tingginya bisa disesuaikan secara elektrik (dual motor).',
            'stock' => 0,
            'unit' => 'unit',
            'purchase_price' => 2800000.00,
            'selling_price' => 3750000.00,
            'category_id' => $catOffice->id,
            'supplier_id' => $supMegah->id,
        ]);

        // 5. Create Stock Transactions (History) to fill charts over the last few days
        // Asus Laptop Transactions
        StockTransaction::create([
            'product_id' => $prodLaptop->id,
            'type' => 'in',
            'quantity' => 20,
            'notes' => 'Stok awal dari supplier PT. Global Tech',
            'transaction_date' => now()->subDays(5),
        ]);
        StockTransaction::create([
            'product_id' => $prodLaptop->id,
            'type' => 'out',
            'quantity' => 5,
            'notes' => 'Penjualan ke PT. Sentosa Utama',
            'transaction_date' => now()->subDays(2),
        ]);

        // Logitech Mouse Transactions
        StockTransaction::create([
            'product_id' => $prodMouse->id,
            'type' => 'in',
            'quantity' => 10,
            'notes' => 'Restock berkala dari PT. Sinar Jaya',
            'transaction_date' => now()->subDays(4),
        ]);
        StockTransaction::create([
            'product_id' => $prodMouse->id,
            'type' => 'out',
            'quantity' => 2,
            'notes' => 'Penjualan e-commerce',
            'transaction_date' => now()->subDays(1),
        ]);

        // Keyboard Transactions
        StockTransaction::create([
            'product_id' => $prodKeyboard->id,
            'type' => 'in',
            'quantity' => 5,
            'notes' => 'Pemasukan barang baru',
            'transaction_date' => now()->subDays(3),
        ]);
        StockTransaction::create([
            'product_id' => $prodKeyboard->id,
            'type' => 'out',
            'quantity' => 2,
            'notes' => 'Penjualan Tokopedia',
            'transaction_date' => now()->subDays(1),
        ]);

        // HVS Paper Transactions
        StockTransaction::create([
            'product_id' => $prodKertas->id,
            'type' => 'in',
            'quantity' => 60,
            'notes' => 'Restock grosir dari CV. Megah Utama',
            'transaction_date' => now()->subDays(6),
        ]);
        StockTransaction::create([
            'product_id' => $prodKertas->id,
            'type' => 'out',
            'quantity' => 10,
            'notes' => 'Keperluan operasional divisi HRD',
            'transaction_date' => now()->subDays(3),
        ]);

        // Ergonomic Desk Transactions
        StockTransaction::create([
            'product_id' => $prodMeja->id,
            'type' => 'in',
            'quantity' => 3,
            'notes' => 'Pemesanan awal',
            'transaction_date' => now()->subDays(4),
        ]);
        StockTransaction::create([
            'product_id' => $prodMeja->id,
            'type' => 'out',
            'quantity' => 3,
            'notes' => 'Penjualan lunas ke Kantor Akuntan Publik',
            'transaction_date' => now(),
        ]);
    }
}
