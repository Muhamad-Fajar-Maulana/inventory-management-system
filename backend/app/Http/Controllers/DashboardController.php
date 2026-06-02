<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalProducts = Product::count();
        $totalCategories = Category::count();
        $totalSuppliers = Supplier::count();
        
        $totalStock = Product::sum('stock');
        
        // Total asset value = SUM(stock * purchase_price)
        $totalAssetValue = Product::selectRaw('SUM(stock * purchase_price) as total_value')
            ->value('total_value') ?? 0;
            
        $outOfStockCount = Product::where('stock', 0)->count();
        $lowStockCount = Product::where('stock', '>', 0)->where('stock', '<', 10)->count();
        
        // Eager load recent transactions
        $recentTransactions = StockTransaction::with('product')
            ->orderBy('transaction_date', 'desc')
            ->take(5)
            ->get();
            
        // Eager load products with low stock (under 10 items) for warning lists
        $lowStockProducts = Product::with(['category', 'supplier'])
            ->where('stock', '<', 10)
            ->orderBy('stock', 'asc')
            ->take(5)
            ->get();

        // Chart Data: Stock In vs Out for the last 7 days
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayName = now()->subDays($i)->isoFormat('dddd');
            
            $inQty = StockTransaction::where('type', 'in')
                ->whereDate('transaction_date', $date)
                ->sum('quantity');
                
            $outQty = StockTransaction::where('type', 'out')
                ->whereDate('transaction_date', $date)
                ->sum('quantity');
                
            $chartData[] = [
                'date' => $date,
                'day' => $dayName,
                'in' => (int) $inQty,
                'out' => (int) $outQty,
            ];
        }

        return response()->json([
            'total_products' => $totalProducts,
            'total_categories' => $totalCategories,
            'total_suppliers' => $totalSuppliers,
            'total_stock' => (int) $totalStock,
            'total_asset_value' => (float) $totalAssetValue,
            'out_of_stock_count' => $outOfStockCount,
            'low_stock_count' => $lowStockCount,
            'recent_transactions' => $recentTransactions,
            'low_stock_products' => $lowStockProducts,
            'chart_data' => $chartData,
        ]);
    }
}
