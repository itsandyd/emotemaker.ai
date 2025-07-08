"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Eye, 
  Users, 
  Calendar,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  Plus,
  BarChart3,
  PieChart,
  Download
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "sonner";

interface SalesData {
  totalEarnings: number;
  totalSales: number;
  monthlyEarnings: number;
  monthlySales: number;
  totalEmotes: number;
  totalPacks: number;
  conversionRate: number;
  averageRating: number;
  topSellingEmotes: Array<{
    id: string;
    name: string;
    sales: number;
    earnings: number;
    imageUrl: string;
  }>;
  recentTransactions: Array<{
    id: string;
    type: 'emote' | 'pack';
    name: string;
    amount: number;
    date: string;
    buyerName: string;
  }>;
  monthlyData: Array<{
    month: string;
    sales: number;
    earnings: number;
  }>;
}

interface SellerDashboardProps {
  userId: string;
}

export default function SellerDashboard({ userId }: SellerDashboardProps) {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  useEffect(() => {
    fetchSalesData();
  }, [userId, selectedPeriod]);

  const fetchSalesData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/seller/dashboard?period=${selectedPeriod}`);
      setSalesData(response.data);
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
      // Mock data for demonstration
      setSalesData({
        totalEarnings: 1250.50,
        totalSales: 45,
        monthlyEarnings: 320.75,
        monthlySales: 12,
        totalEmotes: 28,
        totalPacks: 5,
        conversionRate: 12.5,
        averageRating: 4.8,
        topSellingEmotes: [
          { id: '1', name: 'Cute Cat Pack', sales: 15, earnings: 225.00, imageUrl: '/placeholder.png' },
          { id: '2', name: 'Gaming Vibes', sales: 12, earnings: 180.00, imageUrl: '/placeholder.png' },
          { id: '3', name: 'Kawaii Bundle', sales: 8, earnings: 120.00, imageUrl: '/placeholder.png' },
        ],
        recentTransactions: [
          { id: '1', type: 'pack', name: 'Cute Cat Pack', amount: 15.00, date: '2024-01-15', buyerName: 'StreamerPro' },
          { id: '2', type: 'emote', name: 'Happy Face', amount: 5.00, date: '2024-01-14', buyerName: 'GamerGirl123' },
          { id: '3', type: 'pack', name: 'Gaming Vibes', amount: 20.00, date: '2024-01-13', buyerName: 'TwitchMaster' },
        ],
        monthlyData: [
          { month: 'Jan', sales: 12, earnings: 320.75 },
          { month: 'Dec', sales: 18, earnings: 450.00 },
          { month: 'Nov', sales: 15, earnings: 380.25 },
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await axios.get('/api/seller/export-data', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-data-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Sales data exported successfully!');
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No sales data available</p>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, change, changeType }: {
    title: string;
    value: string;
    icon: any;
    change?: string;
    changeType?: 'up' | 'down';
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className={`flex items-center text-sm ${
                changeType === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeType === 'up' ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                {change}
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Seller Dashboard</h2>
          <p className="text-gray-600">Track your sales performance and earnings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            List New Emote
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Earnings"
          value={`$${salesData.totalEarnings.toFixed(2)}`}
          icon={DollarSign}
          change="+12.5%"
          changeType="up"
        />
        <StatCard
          title="Total Sales"
          value={salesData.totalSales.toString()}
          icon={ShoppingCart}
          change="+8.3%"
          changeType="up"
        />
        <StatCard
          title="This Month"
          value={`$${salesData.monthlyEarnings.toFixed(2)}`}
          icon={Calendar}
          change="+15.2%"
          changeType="up"
        />
        <StatCard
          title="Conversion Rate"
          value={`${salesData.conversionRate}%`}
          icon={Target}
          change="+2.1%"
          changeType="up"
        />
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Monthly Goal</span>
                    <span>$500.00</span>
                  </div>
                  <Progress value={(salesData.monthlyEarnings / 500) * 100} className="h-2" />
                  <p className="text-xs text-gray-600">
                    ${salesData.monthlyEarnings.toFixed(2)} of $500.00 goal
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{salesData.totalEmotes}</p>
                    <p className="text-sm text-gray-600">Total Emotes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{salesData.totalPacks}</p>
                    <p className="text-sm text-gray-600">Total Packs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Selling Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Selling Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salesData.topSellingEmotes.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.sales} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">${item.earnings.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.monthlyData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.month}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{data.sales} sales</span>
                        <span className="text-sm font-bold">${data.earnings.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Sales Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Individual Emotes</span>
                    </div>
                    <span className="text-sm font-medium">60%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Emote Packs</span>
                    </div>
                    <span className="text-sm font-medium">40%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {salesData.topSellingEmotes.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${item.earnings.toFixed(2)}</p>
                      <Badge variant="outline" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {salesData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {transaction.type === 'pack' ? (
                          <Package className="h-5 w-5 text-primary" />
                        ) : (
                          <Eye className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.name}</p>
                        <p className="text-sm text-gray-600">
                          Sold to {transaction.buyerName} • {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        +${transaction.amount.toFixed(2)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 