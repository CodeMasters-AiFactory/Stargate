/**
 * Custom Report Builder Service
 * Phase 3.5: Advanced Analytics - Drag-and-drop report designer
 */

import * as fs from 'fs';
import * as path from 'path';
import { getDashboardMetrics } from './dashboardService';
import { getEvents } from './eventTracker';

export interface ReportChart {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'table' | 'metric' | 'funnel';
  title: string;
  dataSource: {
    metric: string;
    dimension?: string;
    filters?: Record<string, any>;
  };
  position: { x: number; y: number; width: number; height: number };
  config?: Record<string, any>;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
}

export interface CustomReport {
  id: string;
  websiteId: string;
  name: string;
  description?: string;
  dateRange: {
    start: Date;
    end: Date;
    preset?: '24h' | '7d' | '30d' | '90d' | 'custom';
  };
  charts: ReportChart[];
  filters: ReportFilter[];
  createdAt: Date;
  updatedAt: Date;
  lastGenerated?: Date;
}

/**
 * Get reports directory
 */
function getReportsDir(websiteId: string): string {
  const projectDir = path.join(process.cwd(), 'website_projects', websiteId);
  const reportsDir = path.join(projectDir, 'analytics', 'reports');
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  return reportsDir;
}

/**
 * Report Management
 */

export async function getReports(websiteId: string): Promise<CustomReport[]> {
  const reportsDir = getReportsDir(websiteId);
  const reportsPath = path.join(reportsDir, 'reports.json');
  
  if (!fs.existsSync(reportsPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(reportsPath, 'utf-8');
    const reports: CustomReport[] = JSON.parse(content);
    return reports.map(r => ({
      ...r,
      dateRange: {
        ...r.dateRange,
        start: new Date(r.dateRange.start),
        end: new Date(r.dateRange.end),
      },
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
      lastGenerated: r.lastGenerated ? new Date(r.lastGenerated) : undefined,
    }));
  } catch (error) {
    console.error(`[Report Builder] Failed to load reports for ${websiteId}:`, error);
    return [];
  }
}

export async function getReport(websiteId: string, reportId: string): Promise<CustomReport | null> {
  const reports = await getReports(websiteId);
  return reports.find(r => r.id === reportId) || null;
}

export async function saveReport(websiteId: string, report: CustomReport): Promise<void> {
  const reportsDir = getReportsDir(websiteId);
  const reportsPath = path.join(reportsDir, 'reports.json');
  
  const reports = await getReports(websiteId);
  const existingIndex = reports.findIndex(r => r.id === report.id);
  
  if (existingIndex >= 0) {
    reports[existingIndex] = { ...report, updatedAt: new Date() };
  } else {
    reports.push({ ...report, createdAt: new Date(), updatedAt: new Date() });
  }
  
  fs.writeFileSync(reportsPath, JSON.stringify(reports, null, 2), 'utf-8');
  console.log(`[Report Builder] Saved report: ${report.name} (${report.id}) for ${websiteId}`);
}

export async function deleteReport(websiteId: string, reportId: string): Promise<void> {
  const reportsDir = getReportsDir(websiteId);
  const reportsPath = path.join(reportsDir, 'reports.json');
  
  const reports = await getReports(websiteId);
  const filtered = reports.filter(r => r.id !== reportId);
  
  fs.writeFileSync(reportsPath, JSON.stringify(filtered, null, 2), 'utf-8');
  console.log(`[Report Builder] Deleted report: ${reportId} for ${websiteId}`);
}

/**
 * Generate report data
 */
export async function generateReportData(report: CustomReport): Promise<Record<string, any>> {
  // Get dashboard metrics for the date range
  const preset = report.dateRange.preset || 'custom';
  const metrics = await getDashboardMetrics(
    report.websiteId,
    preset as any,
    report.dateRange.start,
    report.dateRange.end
  );
  
  // Generate data for each chart
  const chartData: Record<string, any> = {};
  
  for (const chart of report.charts) {
    chartData[chart.id] = await generateChartData(chart, metrics, report);
  }
  
  return chartData;
}

/**
 * Generate data for a specific chart
 */
async function generateChartData(
  chart: ReportChart,
  metrics: any,
  report: CustomReport
): Promise<any> {
  const { dataSource, type } = chart;
  
  switch (dataSource.metric) {
    case 'visitors':
      if (type === 'line' || type === 'area') {
        return metrics.trends.timeSeries.map((point: any) => ({
          date: point.date,
          value: point.visitors,
        }));
      } else if (type === 'metric') {
        return {
          value: metrics.visitors.total,
          change: metrics.visitors.change,
        };
      }
      break;
      
    case 'pageViews':
      if (type === 'line' || type === 'area') {
        return metrics.trends.timeSeries.map((point: any) => ({
          date: point.date,
          value: point.pageViews,
        }));
      } else if (type === 'table') {
        return metrics.pageViews.topPages.map((page: any) => ({
          page: page.path,
          views: page.views,
          uniqueViews: page.uniqueViews,
          change: page.change,
        }));
      } else if (type === 'metric') {
        return {
          value: metrics.pageViews.total,
          change: metrics.pageViews.change,
        };
      }
      break;
      
    case 'trafficSources':
      if (type === 'pie' || type === 'bar') {
        return metrics.traffic.sources.map((source: any) => ({
          name: source.source,
          value: source.visitors,
          percentage: source.percentage,
        }));
      }
      break;
      
    case 'devices':
      if (type === 'pie' || type === 'bar') {
        return metrics.traffic.devices.map((device: any) => ({
          name: device.device,
          value: device.visitors,
          percentage: device.percentage,
        }));
      }
      break;
      
    case 'conversions':
      if (type === 'metric') {
        return {
          value: metrics.conversions.total,
          rate: metrics.conversions.rate,
          change: metrics.conversions.change,
        };
      } else if (type === 'line' || type === 'area') {
        return metrics.trends.timeSeries.map((point: any) => ({
          date: point.date,
          value: point.conversions,
        }));
      }
      break;
      
    case 'topPages':
      if (type === 'table' || type === 'bar') {
        return metrics.pageViews.topPages.map((page: any) => ({
          page: page.path,
          views: page.views,
          uniqueViews: page.uniqueViews,
        }));
      }
      break;
  }
  
  return { data: [] };
}

