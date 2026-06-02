<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockTransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StockTransaction::with('product');

        if ($request->has('type') && in_array($request->type, ['in', 'out'])) {
            $query->where('type', $request->type);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->get();
        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:in,out',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:255',
            'transaction_date' => 'nullable|date',
        ]);

        if (empty($validated['transaction_date'])) {
            $validated['transaction_date'] = now();
        }

        return DB::transaction(function () use ($validated) {
            $product = Product::findOrFail($validated['product_id']);
            
            if ($validated['type'] === 'out') {
                if ($product->stock < $validated['quantity']) {
                    return response()->json([
                        'message' => 'Stok tidak mencukupi untuk melakukan pengeluaran barang.',
                        'errors' => ['quantity' => ['Stok saat ini hanya tersedia ' . $product->stock . ' ' . $product->unit]]
                    ], 422);
                }
                $product->decrement('stock', $validated['quantity']);
            } else {
                $product->increment('stock', $validated['quantity']);
            }

            $transaction = StockTransaction::create($validated);
            return response()->json($transaction->load('product'), 201);
        });
    }

    public function show(StockTransaction $transaction): JsonResponse
    {
        return response()->json($transaction->load('product'));
    }

    public function destroy(StockTransaction $transaction): JsonResponse
    {
        return DB::transaction(function () use ($transaction) {
            $product = Product::findOrFail($transaction->product_id);
            
            if ($transaction->type === 'in') {
                // If it was an inward transaction, deleting it means reducing the stock
                // Check if reducing it now would make stock negative
                if ($product->stock < $transaction->quantity) {
                    return response()->json([
                        'message' => 'Tidak dapat menghapus transaksi ini karena stok produk akan bernilai negatif.'
                    ], 422);
                }
                $product->decrement('stock', $transaction->quantity);
            } else {
                // If it was an outward transaction, deleting it means returning the stock
                $product->increment('stock', $transaction->quantity);
            }

            $transaction->delete();
            return response()->json(['message' => 'Transaction deleted and stock adjusted successfully']);
        });
    }
}
