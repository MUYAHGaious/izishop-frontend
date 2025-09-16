import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import api from '../../../services/api';
import { showToast } from '../../../components/ui/Toast';

const EarningsTab = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    commissionPaid: 0,
    netProfit: 0,
    monthlyGrowth: 0
  });
  const [orderStats, setOrderStats] = useState({
    total_orders: 0,
    total_revenue: 0,
    completed_orders: 0,
    pending_orders: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartsData, setChartsData] = useState({
    earningsData: [],
    monthlyEarnings: []
  });

  // Load earnings data from API
  const loadEarnings = useCallback(async () => {
    try {
      setLoading(true);

      // Get order statistics
      const stats = await api.getShopOwnerOrderStats();
      console.log('Order stats:', stats);
      setOrderStats(stats);

      // Get actual orders for transaction history
      const ordersData = await api.getShopOwnerOrders({ limit: 50 });
      console.log('Orders data:', ordersData);
      setOrders(ordersData);

      // Get user analytics (includes revenue data)
      let analytics = null;
      try {
        analytics = await api.request('/api/analytics/user-stats');
        console.log('Analytics data:', analytics);
      } catch (analyticsError) {
        console.warn('Analytics not available:', analyticsError);
      }

      // Transform data for earnings display
      const totalRevenue = stats.total_revenue || 0;
      const commissionRate = 0.1; // 10% commission rate
      const commission = totalRevenue * commissionRate;
      const netEarnings = totalRevenue - commission;

      // Calculate pending payouts from actual pending orders
      const pendingOrders = ordersData.filter(order =>
        order.status === 'pending' || order.status === 'processing'
      );
      const pendingRevenue = pendingOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      setEarnings({
        totalEarnings: totalRevenue,
        pendingPayouts: pendingRevenue,
        commissionPaid: commission,
        netProfit: netEarnings,
        monthlyGrowth: analytics?.data?.overview?.revenue_this_month || 0
      });

      // Generate charts data from real orders
      const weeklyData = generateWeeklyDataFromOrders(ordersData);
      const monthlyData = generateMonthlyDataFromOrders(ordersData);

      setChartsData({
        earningsData: weeklyData,
        monthlyEarnings: monthlyData
      });

      // Convert real orders to transaction format
      const transactionHistory = convertOrdersToTransactions(ordersData);
      setTransactions(transactionHistory);

    } catch (error) {
      console.error('Error loading earnings:', error);
      showToast({
        type: 'error',
        message: 'Failed to load earnings data.',
        duration: 3000
      });

      // Set empty state for new businesses
      setEarnings({
        totalEarnings: 0,
        pendingPayouts: 0,
        commissionPaid: 0,
        netProfit: 0,
        monthlyGrowth: 0
      });
      setOrderStats({
        total_orders: 0,
        total_revenue: 0,
        completed_orders: 0,
        pending_orders: 0
      });
      setOrders([]);
      setTransactions([]);
      setChartsData({
        earningsData: [],
        monthlyEarnings: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate weekly earnings data from real orders
  const generateWeeklyDataFromOrders = (ordersData) => {
    if (!ordersData || ordersData.length === 0) return [];

    const weeks = {};
    const now = new Date();

    // Initialize 4 weeks
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now - (i * 7 * 24 * 60 * 60 * 1000));
      const weekKey = `Week ${4 - i}`;
      weeks[weekKey] = { name: weekKey, gross: 0, commission: 0, net: 0 };
    }

    // Aggregate orders by week
    ordersData.forEach(order => {
      if (order.status === 'delivered' || order.status === 'completed') {
        const orderDate = new Date(order.created_at || order.orderDate);
        const daysDiff = Math.floor((now - orderDate) / (24 * 60 * 60 * 1000));

        if (daysDiff < 28) { // Last 4 weeks
          const weekIndex = Math.floor(daysDiff / 7);
          const weekKey = `Week ${4 - weekIndex}`;

          if (weeks[weekKey]) {
            const gross = order.total || order.total_amount || 0;
            const commission = gross * 0.1;
            const net = gross - commission;

            weeks[weekKey].gross += gross;
            weeks[weekKey].commission += commission;
            weeks[weekKey].net += net;
          }
        }
      }
    });

    return Object.values(weeks).map(week => ({
      ...week,
      gross: Math.round(week.gross),
      commission: Math.round(week.commission),
      net: Math.round(week.net)
    }));
  };

  // Generate monthly earnings data from real orders
  const generateMonthlyDataFromOrders = (ordersData) => {
    if (!ordersData || ordersData.length === 0) return [];

    const months = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthNames[month.getMonth()];
      months[monthKey] = { month: monthKey, earnings: 0 };
    }

    // Aggregate orders by month
    ordersData.forEach(order => {
      if (order.status === 'delivered' || order.status === 'completed') {
        const orderDate = new Date(order.created_at || order.orderDate);
        const monthKey = monthNames[orderDate.getMonth()];

        if (months[monthKey]) {
          const earnings = order.total || order.total_amount || 0;
          months[monthKey].earnings += earnings;
        }
      }
    });

    return Object.values(months).map(month => ({
      ...month,
      earnings: Math.round(month.earnings)
    }));
  };

  // Convert real orders to transaction format
  const convertOrdersToTransactions = (ordersData) => {
    if (!ordersData || ordersData.length === 0) return [];

    const transactions = [];

    // Convert completed orders to sale transactions
    ordersData.forEach(order => {
      if (order.status === 'delivered' || order.status === 'completed') {
        const amount = order.total || order.total_amount || 0;
        const commission = Math.round(amount * 0.1);

        transactions.push({
          id: order.id,
          type: "sale",
          description: `Order ${order.id.slice(-8)} - ${order.items?.length || 0} item(s)`,
          amount: amount,
          commission: commission,
          net: amount - commission,
          date: order.created_at || order.orderDate,
          status: "completed"
        });
      } else if (order.status === 'pending' || order.status === 'processing') {
        const amount = order.total || order.total_amount || 0;
        const commission = Math.round(amount * 0.1);

        transactions.push({
          id: order.id,
          type: "sale",
          description: `Order ${order.id.slice(-8)} - ${order.items?.length || 0} item(s)`,
          amount: amount,
          commission: commission,
          net: amount - commission,
          date: order.created_at || order.orderDate,
          status: "pending"
        });
      } else if (order.status === 'cancelled') {
        const amount = -(order.total || order.total_amount || 0);

        transactions.push({
          id: order.id,
          type: "refund",
          description: `Refund for Order ${order.id.slice(-8)}`,
          amount: amount,
          commission: 0,
          net: amount,
          date: order.updated_at || order.created_at || order.orderDate,
          status: "completed"
        });
      }
    });

    // Sort by date (newest first) and limit to recent transactions
    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  };

  // Load earnings data on component mount
  useEffect(() => {
    loadEarnings();
  }, [loadEarnings, timeRange]);

  // Check if user is new (no revenue)
  const isNewUser = () => {
    return earnings.totalEarnings === 0 && orderStats.total_orders === 0;
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'sale':
        return { icon: 'ArrowUp', color: 'text-success' };
      case 'refund':
        return { icon: 'ArrowDown', color: 'text-destructive' };
      case 'payout':
        return { icon: 'ArrowRight', color: 'text-primary' };
      default:
        return { icon: 'Circle', color: 'text-text-secondary' };
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: 'Completed', color: 'text-success bg-success/10' },
      pending: { label: 'Pending', color: 'text-warning bg-warning/10' },
      failed: { label: 'Failed', color: 'text-destructive bg-destructive/10' }
    };

    const config = statusConfig[status] || { label: status, color: 'text-text-secondary bg-muted' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEarningsCards = () => {
    const newUser = isNewUser();

    return [
      {
        title: 'Total Earnings',
        value: newUser ? '0 XAF' : `${earnings.totalEarnings.toLocaleString()} XAF`,
        change: newUser ? 'No sales yet' : `From ${orderStats.completed_orders} completed orders`,
        changeType: newUser ? 'neutral' : 'positive',
        icon: 'DollarSign',
        color: 'text-success',
        bgColor: 'bg-success/10'
      },
      {
        title: 'Pending Payouts',
        value: newUser ? '0 XAF' : `${earnings.pendingPayouts.toLocaleString()} XAF`,
        change: newUser ? 'No pending orders' : `${orderStats.pending_orders} pending orders`,
        changeType: newUser ? 'neutral' : 'positive',
        icon: 'Clock',
        color: 'text-warning',
        bgColor: 'bg-warning/10'
      },
      {
        title: 'Platform Commission',
        value: newUser ? '0 XAF' : `${earnings.commissionPaid.toLocaleString()} XAF`,
        change: newUser ? '10% platform fee' : '10% of total sales',
        changeType: newUser ? 'neutral' : 'neutral',
        icon: 'Percent',
        color: 'text-primary',
        bgColor: 'bg-primary/10'
      },
      {
        title: 'Net Profit',
        value: newUser ? '0 XAF' : `${earnings.netProfit.toLocaleString()} XAF`,
        change: newUser ? 'No profit yet' : `After platform commission`,
        changeType: newUser ? 'neutral' : 'positive',
        icon: 'TrendingUp',
        color: 'text-success',
        bgColor: 'bg-success/10'
      }
    ];
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Earnings Overview</h2>
          <p className="text-text-secondary">Track your revenue and payouts</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            options={timeRangeOptions}
            value={timeRange}
            onChange={setTimeRange}
            className="w-40"
          />
          <Button
            variant="outline"
            iconName="RefreshCw"
            iconPosition="left"
            onClick={loadEarnings}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Alert for new users */}
      {!loading && isNewUser() && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Info" size={20} className="text-primary" />
            <h3 className="font-medium text-primary">Welcome to Your Earnings Dashboard!</h3>
          </div>
          <p className="text-sm text-primary/80">
            Your earnings will appear here once customers start purchasing your products. Set up your shop and add products to get started!
          </p>
        </div>
      )}

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {loading ? (
          // Loading skeleton for cards
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="w-16 h-4 bg-muted rounded"></div>
              </div>
              <div className="w-24 h-8 bg-muted rounded mb-1"></div>
              <div className="w-20 h-4 bg-muted rounded"></div>
            </div>
          ))
        ) : (
          getEarningsCards().map((card, index) => (
            <div key={index} className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon name={card.icon} size={24} className={card.color} />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  card.changeType === 'positive' ? 'text-success' :
                  card.changeType === 'negative' ? 'text-destructive' : 'text-gray-500'
                }`}>
                  <Icon
                    name={
                      card.changeType === 'positive' ? 'ArrowUp' :
                      card.changeType === 'negative' ? 'ArrowDown' : 'Minus'
                    }
                    size={16}
                  />
                  <span>{card.change}</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-text-primary mb-1">{card.value}</h3>
                <p className="text-text-secondary text-sm">{card.title}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Earnings Breakdown */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Weekly Earnings Breakdown</h3>
          {loading ? (
            <div className="w-full h-80 bg-muted animate-pulse rounded-lg"></div>
          ) : chartsData.earningsData.length > 0 ? (
            <div className="w-full h-80" aria-label="Earnings Breakdown Chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.earningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString()} XAF`, '']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="gross" fill="#1E40AF" name="Gross Revenue" />
                  <Bar dataKey="commission" fill="#EF4444" name="Commission" />
                  <Bar dataKey="net" fill="#10B981" name="Net Earnings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full h-80 flex items-center justify-center text-center">
              <div>
                <Icon name="BarChart" size={48} className="text-muted mx-auto mb-4" />
                <p className="text-text-secondary">No earnings data available yet</p>
                <p className="text-sm text-text-secondary">Charts will appear when you have sales</p>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Monthly Earnings Trend</h3>
          {loading ? (
            <div className="w-full h-80 bg-muted animate-pulse rounded-lg"></div>
          ) : chartsData.monthlyEarnings.length > 0 ? (
            <div className="w-full h-80" aria-label="Monthly Earnings Trend Chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartsData.monthlyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString()} XAF`, 'Earnings']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#1E40AF"
                    strokeWidth={3}
                    dot={{ fill: '#1E40AF', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full h-80 flex items-center justify-center text-center">
              <div>
                <Icon name="TrendingUp" size={48} className="text-muted mx-auto mb-4" />
                <p className="text-text-secondary">No trend data available yet</p>
                <p className="text-sm text-text-secondary">Monthly trends will show after some sales activity</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real Transaction History */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Recent Transactions</h3>
          <Button variant="outline" size="sm" iconName="ArrowRight" iconPosition="right">
            View All Orders
          </Button>
        </div>
        {loading ? (
          // Loading skeleton for transactions
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-4 bg-muted rounded"></div>
                  <div className="w-32 h-3 bg-muted rounded"></div>
                </div>
                <div className="w-24 h-6 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const iconConfig = getTransactionIcon(transaction.type);
              return (
                <div key={transaction.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                    <Icon name={iconConfig.icon} size={20} className={iconConfig.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-primary truncate">{transaction.description}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-text-secondary">{transaction.id.slice(-12)}</p>
                      <p className="text-sm text-text-secondary">{formatDate(transaction.date)}</p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      transaction.amount > 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} XAF
                    </div>
                    {transaction.commission > 0 && (
                      <div className="text-sm text-text-secondary">
                        Commission: {transaction.commission.toLocaleString()} XAF
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="CreditCard" size={48} className="text-muted mx-auto mb-4" />
            <h4 className="text-lg font-medium text-text-primary mb-2">No transactions yet</h4>
            <p className="text-text-secondary">
              {isNewUser()
                ? "Transactions will appear here when customers purchase your products"
                : "Your transaction history will show here"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsTab;