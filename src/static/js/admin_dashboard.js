/* global Chart */
(function () {
    'use strict';

    const palette = ['#990000', '#e76f51', '#f4a261', '#2a9d8f', '#264653', '#8ab17d', '#c8553d'];

    const valueOrZero = value => Number(value || 0);
    const hasData = data => Array.isArray(data) && data.some(item => valueOrZero(item) > 0);

    const renderEmptyState = (canvas, message) => {
        if (!canvas || !canvas.parentNode) {
            return;
        }
        const note = document.createElement('p');
        note.className = 'chart-empty text-muted small mb-0';
        note.textContent = message;
        canvas.parentNode.appendChild(note);
        canvas.remove();
    };

    const getChartData = () => {
        const scriptNode = document.getElementById('admin-chart-data');
        if (!scriptNode) return null;
        try {
            return JSON.parse(scriptNode.textContent || '{}');
        } catch (err) {
            console.error('Failed to parse admin chart data', err);
            return null;
        }
    };

    const renderLineChart = (ctx, labels, datasets, emptyMessage) => {
        if (!ctx) return;
        if (!labels.length || !datasets.some(ds => hasData(ds.data))) {
            renderEmptyState(ctx, emptyMessage);
            return;
        }
        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { usePointStyle: true }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    };

    const renderBarChart = (ctx, labels, dataPoints, emptyMessage, horizontal = false, colorOverride) => {
        if (!ctx) return;
        if (!labels.length || !hasData(dataPoints)) {
            renderEmptyState(ctx, emptyMessage);
            return;
        }
        const colors = colorOverride || labels.map((_, index) => palette[index % palette.length]);
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Total',
                        data: dataPoints,
                        backgroundColor: colors,
                        borderRadius: 12,
                        borderSkipped: false
                    }
                ]
            },
            options: {
                indexAxis: horizontal ? 'y' : 'x',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                }
            }
        });
    };

    const renderDoughnutChart = (ctx, labels, dataPoints, emptyMessage) => {
        if (!ctx) return;
        if (!labels.length || !hasData(dataPoints)) {
            renderEmptyState(ctx, emptyMessage);
            return;
        }
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [
                    {
                        data: dataPoints,
                        backgroundColor: labels.map((_, index) => palette[index % palette.length]),
                        borderWidth: 0
                    }
                ]
            },
            options: {
                cutout: '65%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { usePointStyle: true }
                    }
                }
            }
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        const dashboardRoot = document.querySelector('[data-admin-dashboard]');
        if (!dashboardRoot || typeof Chart === 'undefined') {
            return;
        }
        const chartData = getChartData();
        if (!chartData) return;

        const bookingTrend = chartData.bookingTrend || [];
        const bookingLabels = bookingTrend.map(row => row.label);
        renderLineChart(
            document.getElementById('bookingTrendChart'),
            bookingLabels,
            [
                {
                    label: 'All requests',
                    data: bookingTrend.map(row => valueOrZero(row.total)),
                    borderColor: '#990000',
                    backgroundColor: 'rgba(153, 0, 0, 0.15)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 4
                },
                {
                    label: 'Approved',
                    data: bookingTrend.map(row => valueOrZero(row.approved)),
                    borderColor: '#2a9d8f',
                    backgroundColor: 'rgba(42, 157, 143, 0.2)',
                    tension: 0.35,
                    pointRadius: 4
                },
                {
                    label: 'Pending',
                    data: bookingTrend.map(row => valueOrZero(row.pending)),
                    borderColor: '#e9c46a',
                    borderDash: [6, 4],
                    tension: 0.35,
                    pointRadius: 4
                }
            ],
            'Not enough booking data yet.'
        );

        const roleMix = chartData.roleMix || [];
        renderDoughnutChart(
            document.getElementById('roleMixChart'),
            roleMix.map(item => item.label || 'Unknown'),
            roleMix.map(item => valueOrZero(item.value)),
            'No role data to visualize.'
        );

        const userGrowth = chartData.userGrowth || [];
        renderBarChart(
            document.getElementById('userGrowthChart'),
            userGrowth.map(item => item.label || 'Month'),
            userGrowth.map(item => valueOrZero(item.total)),
            'No recent registrations to chart.'
        );

        const topCategories = chartData.topCategories || [];
        renderBarChart(
            document.getElementById('categoryChart'),
            topCategories.map(item => item.category || 'Uncategorized'),
            topCategories.map(item => valueOrZero(item.total)),
            'No category data available.',
            true
        );

        const departmentUsage = chartData.departmentUsage || [];
        renderBarChart(
            document.getElementById('departmentUsageChart'),
            departmentUsage.map(item => item.department || 'Unknown'),
            departmentUsage.map(item => valueOrZero(item.total)),
            'No departmental bookings yet.',
            true
        );
    });
})();
