import { api } from './api.service';

export interface DashboardStats {
  totalIncome: number;
  incomeChange: number;
  totalOrders: number;
  orderChange: number;
  totalSelling: number;
  sellingChange: number;
}

export interface BestSellingProduct {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  totalSold: number;
}

export interface SalesTrend {
  date: string;
  sales: number;
}

export const dashboardService = {
  // DAILY ENDPOINTS
  async getSummaryIncome(): Promise<number> {
    const response = await api.get('/dashboard/summary-income-daily');
    return Number(response.data) || 0;
  },

  async getIncomePercentageChange(): Promise<number> {
    const response = await api.get('/dashboard/income-percentage-change-daily');
    return Number(response.data.incomeChange) || 0;
  },

  async getTotalOrders(): Promise<number> {
    const response = await api.get('/dashboard/total-orders-daily');
    return Number(response.data) || 0;
  },

  async getOrderPercentageChange(): Promise<number> {
    const response = await api.get('/dashboard/order-percentage-change-daily');
    return Number(response.data.orderChange) || 0;
  },

  async getTotalSelling(): Promise<number> {
    const response = await api.get('/dashboard/total-selling-daily');
    return Number(response.data) || 0;
  },

  async getSellingPercentageChange(): Promise<number> {
    const response = await api.get('/dashboard/selling-percentage-change-daily');
    return Number(response.data.sellingChange) || 0;
  },

  // 30 DAYS ENDPOINTS
  async getSummaryIncome30Days(): Promise<number> {
    const response = await api.get('/dashboard/summary-income-30days');
    return Number(response.data) || 0;
  },

  async getIncomePercentageChange30Days(): Promise<number> {
    const response = await api.get('/dashboard/income-percentage-change-30days');
    return Number(response.data.incomeChange) || 0;
  },

  async getTotalOrders30Days(): Promise<number> {
    const response = await api.get('/dashboard/total-orders-30days');
    return Number(response.data) || 0;
  },

  async getOrderPercentageChange30Days(): Promise<number> {
    const response = await api.get('/dashboard/order-percentage-change-30days');
    return Number(response.data.orderChange) || 0;
  },

  async getTotalSelling30Days(): Promise<number> {
    const response = await api.get('/dashboard/total-selling-30days');
    return Number(response.data) || 0;
  },

  async getSellingPercentageChange30Days(): Promise<number> {
    const response = await api.get('/dashboard/selling-percentage-change-30days');
    return Number(response.data.sellingChange) || 0;
  },

  // BEST SELLING PRODUCTS
  async getBestSellingProductDaily(): Promise<BestSellingProduct[]> {
    const response = await api.get('/dashboard/best-product-in-day');
    return response.data.bestProduct || [];
  },

  async getBestSellingProduct30Days(): Promise<BestSellingProduct[]> {
    const response = await api.get('/dashboard/best-product-in-30days');
    return response.data.bestProduct || [];
  },

  // SALES TREND
  async getSalesTrend30Days(): Promise<SalesTrend[]> {
    const response = await api.get('/dashboard/trend');
    return response.data.trend || [];
  },

  // COMBINED STATS (Daily)
  async getAllStats(): Promise<DashboardStats> {
    const [
      totalIncome,
      incomeChange,
      totalOrders,
      orderChange,
      totalSelling,
      sellingChange,
    ] = await Promise.all([
      this.getSummaryIncome(),
      this.getIncomePercentageChange(),
      this.getTotalOrders(),
      this.getOrderPercentageChange(),
      this.getTotalSelling(),
      this.getSellingPercentageChange(),
    ]);

    return {
      totalIncome,
      incomeChange,
      totalOrders,
      orderChange,
      totalSelling,
      sellingChange,
    };
  },

  // COMBINED STATS (30 Days)
  async getAllStats30Days(): Promise<DashboardStats> {
    const [
      totalIncome,
      incomeChange,
      totalOrders,
      orderChange,
      totalSelling,
      sellingChange,
    ] = await Promise.all([
      this.getSummaryIncome30Days(),
      this.getIncomePercentageChange30Days(),
      this.getTotalOrders30Days(),
      this.getOrderPercentageChange30Days(),
      this.getTotalSelling30Days(),
      this.getSellingPercentageChange30Days(),
    ]);

    return {
      totalIncome,
      incomeChange,
      totalOrders,
      orderChange,
      totalSelling,
      sellingChange,
    };
  },
};
