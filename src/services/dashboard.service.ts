import { api } from './api.service';

export interface DashboardStats {
  totalIncome: number;
  incomeChange: number;
  totalOrders: number;
  orderChange: number;
  totalSelling: number;
  sellingChange: number;
}

export const dashboardService = {
  async getSummaryIncome(): Promise<number> {
    const response = await api.get('/dashboard/summary-income');
    return response.data.totalIncome;
  },

  async getIncomePercentageChange(): Promise<number> {
    const response = await api.get('/dashboard/income-percentage-change');
    return response.data.incomeChange;
  },

  async getTotalOrders(): Promise<number> {
    const response = await api.get('/dashboard/total-orders');
    return response.data.totalOrders;
  },

  async getOrderPercentageChange(): Promise<number> {
    const response = await api.get('/dashboard/order-percentage-change');
    return response.data.orderChange;
  },

  async getTotalSelling(): Promise<number> {
    const response = await api.get('/dashboard/total-selling');
    return response.data.totalSelling;
  },

  async getSellingPercentageChange(): Promise<number> {
    const response = await api.get('/dashboard/selling-percentage-change');
    return response.data.sellingChange;
  },

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
};
