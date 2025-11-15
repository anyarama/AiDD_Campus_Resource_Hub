import React, { useState } from 'react';
import { 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { CHButton } from '../ui/ch-button';
import { CHInput } from '../ui/ch-input';
import { CHKPICard } from '../ui/ch-kpi-card';
import { CHCard, CHCardHeader, CHCardContent } from '../ui/ch-card';
import { CHDropdown } from '../ui/ch-dropdown';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Admin Analytics Page
 * Enterprise analytics with filters, KPIs, and charts
 */

// Helper to get CSS variable color
const getCSSVariable = (variable: string): string => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  }
  return variable;
};

// Get resolved colors from CSS variables
const COLORS = {
  crimson: '#990000', // var(--brand-crimson)
  white: '#FFFFFF', // var(--brand-white)
  info: '#0B5CAD', // var(--status-info)
  gridColor: '#EEE9E3', // var(--border-muted)
  textMuted: '#4B4B4B', // var(--fg-muted)
  textDefault: '#1F1F1F', // var(--fg-default)
};

export function AdminAnalytics() {
  const [startDate, setStartDate] = useState('2024-10-01');
  const [endDate, setEndDate] = useState('2024-11-11');
  
  // Quick range handler
  const handleQuickRange = (range: string) => {
    const today = new Date();
    let start = new Date();
    
    if (range === 'today') {
      start = today;
    } else if (range === 'week') {
      start.setDate(today.getDate() - 7);
    } else if (range === 'month') {
      start.setMonth(today.getMonth() - 1);
    } else if (range === 'quarter') {
      start.setMonth(today.getMonth() - 3);
    } else if (range === 'year') {
      start.setFullYear(today.getFullYear() - 1);
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };
  
  const handleApplyFilters = () => {
    console.log('Apply filters:', { startDate, endDate });
  };
  
  // Chart download handlers
  const handleDownloadChart = (chartName: string) => {
    console.log('Download chart:', chartName);
  };
  
  // Usage by Category Chart Data
  const categoryChartData = {
    labels: ['Study Rooms', 'Labs', 'Equipment', 'Conference Rooms', 'Library Spaces'],
    datasets: [
      {
        label: 'Bookings',
        data: [145, 89, 67, 54, 123],
        backgroundColor: COLORS.crimson,
        borderColor: COLORS.crimson,
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };
  
  const categoryChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1F1F1F',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: '600',
        },
        bodyFont: {
          size: 14,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: COLORS.textMuted,
        },
      },
      y: {
        grid: {
          color: COLORS.gridColor,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: COLORS.textMuted,
        },
      },
    },
  };
  
  // Bookings & Users Trend Chart Data
  const trendChartData = {
    labels: ['Oct 1', 'Oct 8', 'Oct 15', 'Oct 22', 'Oct 29', 'Nov 5', 'Nov 11'],
    datasets: [
      {
        label: 'Bookings',
        data: [45, 52, 48, 61, 58, 67, 72],
        borderColor: COLORS.crimson,
        backgroundColor: 'rgba(153, 0, 0, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: COLORS.crimson,
        pointBorderColor: COLORS.white,
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
      {
        label: 'Active Users',
        data: [32, 38, 35, 42, 45, 48, 51],
        borderColor: COLORS.info,
        backgroundColor: 'rgba(11, 92, 173, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: COLORS.info,
        pointBorderColor: COLORS.white,
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };
  
  const trendChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: {
            size: 12,
            weight: '500',
          },
          color: COLORS.textDefault,
        },
      },
      tooltip: {
        backgroundColor: '#1F1F1F',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: '600',
        },
        bodyFont: {
          size: 14,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: COLORS.textMuted,
        },
      },
      y: {
        grid: {
          color: COLORS.gridColor,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: COLORS.textMuted,
        },
      },
    },
  };
  
  return (
    <div className="min-h-screen bg-canvas">
      {/* Admin Header - Normalized spacing */}
      <header className="bg-surface border-b border-default px-6 lg:px-8 py-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-h1 text-fg-default mb-2">Analytics & Insights</h1>
              <p className="text-body text-fg-muted">
                Track performance metrics and resource utilization
              </p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Filter Bar */}
      <div className="flex flex-col gap-4 p-5 bg-surface border border-default rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="flex flex-col gap-2">
            <label className="text-caption-semibold text-fg-default">
              Start Date
            </label>
            <CHInput
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          {/* End Date */}
          <div className="flex flex-col gap-2">
            <label className="text-caption-semibold text-fg-default">
              End Date
            </label>
            <CHInput
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        
        {/* Action Row */}
        <div className="flex items-center justify-end gap-3">
          {/* Quick Ranges */}
          <CHDropdown
            trigger={
              <CHButton variant="secondary">
                <Calendar className="w-4 h-4" />
                Quick Ranges
              </CHButton>
            }
            items={[
              { label: 'Today', onClick: () => handleQuickRange('today') },
              { label: 'Last 7 days', onClick: () => handleQuickRange('week') },
              { label: 'Last 30 days', onClick: () => handleQuickRange('month') },
              { label: 'Last 3 months', onClick: () => handleQuickRange('quarter') },
              { label: 'Last year', onClick: () => handleQuickRange('year') },
            ]}
          />
          
          {/* Apply Button */}
          <CHButton variant="primary" onClick={handleApplyFilters}>
            Apply
          </CHButton>
        </div>
      </div>
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CHKPICard
          title="Total Bookings"
          value="1,847"
          change="+12.3%"
          trend="up"
          icon={<BookOpen className="w-5 h-5" strokeWidth={2} />}
        />
        
        <CHKPICard
          title="Active Users"
          value="512"
          change="+8.7%"
          trend="up"
          icon={<Users className="w-5 h-5" strokeWidth={2} />}
        />
        
        <CHKPICard
          title="Resources Used"
          value="48"
          change="+2.1%"
          trend="up"
          icon={<BarChart3 className="w-5 h-5" strokeWidth={2} />}
        />
        
        <CHKPICard
          title="Utilization Rate"
          value="73.2%"
          change="-1.4%"
          trend="down"
          icon={<TrendingUp className="w-5 h-5" strokeWidth={2} />}
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage by Category Chart */}
        <CHCard elevation="sm">
          <CHCardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-caption-semibold text-fg-default mb-1">
                  Usage by Category
                </h3>
                <p className="text-caption text-fg-muted">
                  Bookings per resource type
                </p>
              </div>
              
              <button
                onClick={() => handleDownloadChart('category')}
                className="p-2 hover:bg-subtle rounded transition-colors"
                title="Download chart"
              >
                <Download className="w-4 h-4 text-fg-muted" />
              </button>
            </div>
          </CHCardHeader>
          
          <CHCardContent>
            <div style={{ height: '300px' }}>
              <Bar data={categoryChartData} options={categoryChartOptions} />
            </div>
          </CHCardContent>
        </CHCard>
        
        {/* Bookings & Users Trend Chart */}
        <CHCard elevation="sm">
          <CHCardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-caption-semibold text-fg-default mb-1">
                  Bookings & Users Trend
                </h3>
                <p className="text-caption text-fg-muted">
                  Weekly activity comparison
                </p>
              </div>
              
              <button
                onClick={() => handleDownloadChart('trend')}
                className="p-2 hover:bg-subtle rounded transition-colors"
                title="Download chart"
              >
                <Download className="w-4 h-4 text-fg-muted" />
              </button>
            </div>
          </CHCardHeader>
          
          <CHCardContent>
            <div style={{ height: '300px' }}>
              <Line data={trendChartData} options={trendChartOptions} />
            </div>
          </CHCardContent>
        </CHCard>
      </div>
    </div>
  );
}