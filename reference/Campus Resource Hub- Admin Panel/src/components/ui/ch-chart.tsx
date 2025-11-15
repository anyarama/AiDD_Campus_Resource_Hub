import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

/**
 * CH/Chart Styles - STANDARDIZED VISUAL CONSISTENCY
 * 
 * Line charts: 2.5px stroke, crimson primary, dots radius=3, area fill rgba(153,0,0,0.08)
 * Bar charts: bar radius=6, gridlines #EEE9E3, vertical gridlines on, hover highlight
 * Donut charts: inner radius 48% (thicker, more substantial ring), minimal segment spacing (0px for clean appearance), labels outside with value + %, clean circle legend at bottom
 * Axis labels: caption size, text.secondary color
 */

// Chart color palette from IU tokens
export const CH_CHART_COLORS = {
  chart1: '#990000',      // Brand crimson
  chart2: '#8B0000',      // Highlight crimson
  chart3: '#CC3333',      // Light crimson
  chart4: '#E57373',      // Pale crimson
  chart5: '#666666',      // Neutral gray
  chart6: '#999999',      // Light gray
};

export const CH_CHART_PALETTE = [
  CH_CHART_COLORS.chart1,
  CH_CHART_COLORS.chart2,
  CH_CHART_COLORS.chart3,
  CH_CHART_COLORS.chart4,
  CH_CHART_COLORS.chart5,
  CH_CHART_COLORS.chart6,
];

// Common chart configuration - STANDARDIZED
export const CH_CHART_CONFIG = {
  // Grid styling - #EEE9E3 for bars
  grid: {
    stroke: '#EEE9E3',
    strokeDasharray: '3 3',
    strokeOpacity: 1,
    vertical: false, // Override per chart
  },
  
  // Axis styling - caption size, text.secondary color
  axis: {
    tick: { 
      fill: '#6B6B6B',      // text.secondary
      fontSize: 13,          // caption size
      fontFamily: 'Inter, sans-serif',
    },
    axisLine: { stroke: '#EEE9E3' },
    tickLine: { stroke: '#EEE9E3' },
  },
  
  // Tooltip styling
  tooltip: {
    contentStyle: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E1DC',
      borderRadius: '10px',
      padding: '12px',
      boxShadow: '0 4px 10px 0 rgba(0,0,0,0.12)',
    },
    labelStyle: {
      color: '#1F1F1F',
      fontWeight: 600,
      marginBottom: '8px',
      fontSize: 13,
    },
    itemStyle: {
      color: '#6B6B6B',
      fontSize: 13,
    },
  },
};

/**
 * CH/LineChart
 * Standardized line chart:
 * - 2.5px stroke
 * - Dots radius=3
 * - Area fill rgba(153,0,0,0.08)
 * - Brand crimson primary
 */

export interface CHLineChartProps {
  data: any[];
  dataKey?: string;
  xAxisKey?: string;
  height?: number;
  showArea?: boolean;
  title?: string; // For accessibility
  description?: string; // For accessibility
}

export function CHLineChart({
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  height = 300,
  showArea = false,
  title = "Line chart",
  description,
}: CHLineChartProps) {
  // Generate description if not provided
  const values = data.map((d: any) => d[dataKey]);
  const chartDescription = description || 
    `Line chart showing ${data.length} data points. ` +
    `Values range from ${Math.min(...values)} to ${Math.max(...values)}.`;

  return (
    <div role="img" aria-label={title}>
      {/* Visually hidden description for screen readers */}
      <div className="sr-only">{chartDescription}</div>
      
      <ResponsiveContainer width="100%" height={height}>
        {showArea ? (
          <AreaChart data={data}>
            <CartesianGrid 
              stroke="#EEE9E3"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey={xAxisKey}
              {...CH_CHART_CONFIG.axis}
            />
            <YAxis {...CH_CHART_CONFIG.axis} />
            <Tooltip {...CH_CHART_CONFIG.tooltip} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={CH_CHART_COLORS.chart1}
              strokeWidth={2.5}
              fill="rgba(153, 0, 0, 0.08)"
              dot={{ fill: CH_CHART_COLORS.chart1, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid 
              stroke="#EEE9E3"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey={xAxisKey}
              {...CH_CHART_CONFIG.axis}
            />
            <YAxis {...CH_CHART_CONFIG.axis} />
            <Tooltip {...CH_CHART_CONFIG.tooltip} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={CH_CHART_COLORS.chart1}
              strokeWidth={2.5}
              dot={{ fill: CH_CHART_COLORS.chart1, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

/**
 * CH/BarChart
 * Standardized bar chart:
 * - Bar radius=6
 * - Gridlines #EEE9E3
 * - Vertical gridlines ON
 * - Hover highlight + subtle shadow
 */

export interface CHBarChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  height?: number;
  color?: string;
  title?: string; // For accessibility
  description?: string; // For accessibility
}

export function CHBarChart({
  data,
  dataKey,
  xAxisKey,
  height = 300,
  color = CH_CHART_COLORS.chart1,
  title = "Bar chart",
  description,
}: CHBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  
  // Generate description if not provided
  const chartDescription = description || 
    `Bar chart showing ${data.length} categories. ` +
    `Data points range across ${data.map((d: any) => d[xAxisKey]).join(', ')}.`;
  
  return (
    <div role="img" aria-label={title}>
      {/* Visually hidden description for screen readers */}
      <div className="sr-only">{chartDescription}</div>
      
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid 
            stroke="#EEE9E3"
            strokeDasharray="3 3"
            vertical={true}
            horizontal={true}
          />
          <XAxis
            dataKey={xAxisKey}
            {...CH_CHART_CONFIG.axis}
          />
          <YAxis {...CH_CHART_CONFIG.axis} />
          <Tooltip {...CH_CHART_CONFIG.tooltip} />
          <Bar 
            dataKey={dataKey} 
            fill={color} 
            radius={[6, 6, 0, 0]}
            onMouseEnter={(data, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              filter: hoveredIndex !== null ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' : 'none',
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * CH/DoughnutChart (PieChart with hole)
 * Sophisticated donut chart that fits perfectly in card
 * - Inner radius 48% (thicker, more substantial ring)
 * - Outer radius 80% (fits within card bounds)
 * - White stroke between segments for clean separation
 * - Compact, well-spaced legend
 */

export interface CHDoughnutChartProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  title?: string; // For accessibility
  description?: string; // For accessibility
}

// Custom legend with improved spacing and layout
const CustomDoughnutLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-caption text-fg-muted whitespace-nowrap">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export function CHDoughnutChart({
  data,
  height = 300,
  title = "Donut chart",
  description,
}: CHDoughnutChartProps) {
  // Generate description if not provided
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartDescription = description ||
    `Donut chart showing distribution across ${data.length} categories. ` +
    data.map(item => `${item.name}: ${item.value} (${Math.round((item.value / total) * 100)}%)`).join(', ') + '.';

  return (
    <div role="img" aria-label={title}>
      {/* Visually hidden description for screen readers */}
      <div className="sr-only">{chartDescription}</div>
      
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="48%"
            innerRadius="48%"
            outerRadius="80%"
            paddingAngle={0}
            dataKey="value"
            stroke="#FFFFFF"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CH_CHART_PALETTE[index % CH_CHART_PALETTE.length]}
              />
            ))}
          </Pie>
          <Tooltip 
            {...CH_CHART_CONFIG.tooltip}
            formatter={(value: number, name: string) => [value, name]}
          />
          <Legend
            content={<CustomDoughnutLegend />}
            verticalAlign="bottom"
            height={40}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * CH/MultiLineChart
 * Standardized multi-line chart:
 * - 2.5px stroke
 * - Dots radius=3
 * - Brand crimson for primary, #8B0000 for highlights
 */

export interface CHMultiLineChartProps {
  data: any[];
  lines: Array<{ dataKey: string; name: string }>;
  xAxisKey: string;
  height?: number;
  title?: string; // For accessibility
  description?: string; // For accessibility
}

export function CHMultiLineChart({
  data,
  lines,
  xAxisKey,
  height = 300,
  title = "Multi-line chart",
  description,
}: CHMultiLineChartProps) {
  // Generate description if not provided
  const chartDescription = description ||
    `Multi-line chart comparing ${lines.length} data series across ${data.length} points. ` +
    `Series: ${lines.map(line => line.name).join(', ')}.`;

  return (
    <div role="img" aria-label={title}>
      {/* Visually hidden description for screen readers */}
      <div className="sr-only">{chartDescription}</div>
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid 
            stroke="#EEE9E3"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey={xAxisKey}
            {...CH_CHART_CONFIG.axis}
          />
          <YAxis {...CH_CHART_CONFIG.axis} />
          <Tooltip {...CH_CHART_CONFIG.tooltip} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="line"
            wrapperStyle={{
              fontSize: 13,
              color: '#6B6B6B',
            }}
          />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={CH_CHART_PALETTE[index % CH_CHART_PALETTE.length]}
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}