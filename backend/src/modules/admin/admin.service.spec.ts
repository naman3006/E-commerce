import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { DashboardStats } from '../analytics/analytics.service';

describe('AdminService', () => {
  let service: AdminService;
  let analyticsService: AnalyticsService;

  const mockDashboardStats: DashboardStats = {
    totalRevenue: 1000,
    totalOrders: 10,
    totalProducts: 5,
    totalCustomers: 2,
    revenueGrowth: 0,
    ordersGrowth: 0,
    averageOrderValue: 100,
    topSellingProducts: [],
    recentOrders: [],
    revenueByMonth: [],
    ordersByStatus: [],
    customersByMonth: [],
  };

  const mockAnalyticsService = {
    getDashboardStats: jest.fn().mockResolvedValue(mockDashboardStats),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return dashboard stats from analytics service', async () => {
      const result = await service.getDashboard();
      expect(analyticsService.getDashboardStats).toHaveBeenCalled();
      expect(result).toEqual(mockDashboardStats);
    });
  });
});
