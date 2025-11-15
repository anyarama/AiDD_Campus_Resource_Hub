import React, { useState } from 'react';
import { Download, Trash2, Edit, Plus, Search, Filter } from 'lucide-react';
import { CHButton } from '../ui/ch-button';
import { CHBadge } from '../ui/ch-badge';
import { CHCard, CHCardHeader, CHCardTitle, CHCardContent, CHCardFooter } from '../ui/ch-card';
import { CHInput } from '../ui/ch-input';
import { CHSelect } from '../ui/ch-select';
import { CHTextarea } from '../ui/ch-textarea';
import { CHSwitch } from '../ui/ch-switch';
import { CHTabs, CHTabsContent } from '../ui/ch-tabs';
import { CHTable, CHTableColumn } from '../ui/ch-table';
import { CHSheet } from '../ui/ch-sheet';
import { CHToast } from '../ui/ch-toast';
import { CHTooltip } from '../ui/ch-tooltip';
import { CHEmpty } from '../ui/ch-empty';
import { CHSkeleton, CHSkeletonCard, CHSkeletonTable, CHSkeletonText } from '../ui/ch-skeleton';
import { CHLineChart, CHBarChart, CHDoughnutChart, CHMultiLineChart } from '../ui/ch-chart';

/**
 * Component Showcase
 * Demonstrates all CH/ components with IU tokens
 */

export function ComponentShowcase() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('buttons');
  const [selectedRows, setSelectedRows] = useState(new Set<string>());
  const [loading, setLoading] = useState(false);
  
  // Sample data for table
  const tableData = [
    { id: '1', name: 'Wells Library', type: 'Library', status: 'Available', capacity: 100 },
    { id: '2', name: 'Luddy Hall Lab', type: 'Lab', status: 'Booked', capacity: 30 },
    { id: '3', name: 'Study Room A', type: 'Room', status: 'Available', capacity: 8 },
    { id: '4', name: 'Conference Center', type: 'Room', status: 'Maintenance', capacity: 50 },
  ];
  
  const tableColumns: CHTableColumn[] = [
    { key: 'name', header: 'Resource Name', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const variantMap: any = {
          Available: 'success',
          Booked: 'warning',
          Maintenance: 'danger',
        };
        return <CHBadge variant={variantMap[row.status]}>{row.status}</CHBadge>;
      },
    },
    { key: 'capacity', header: 'Capacity', sortable: true },
  ];
  
  // Sample chart data
  const lineChartData = [
    { month: 'Jan', bookings: 45 },
    { month: 'Feb', bookings: 52 },
    { month: 'Mar', bookings: 61 },
    { month: 'Apr', bookings: 58 },
    { month: 'May', bookings: 70 },
    { month: 'Jun', bookings: 65 },
  ];
  
  const doughnutData = [
    { name: 'Libraries', value: 35 },
    { name: 'Labs', value: 28 },
    { name: 'Study Rooms', value: 22 },
    { name: 'Conference Rooms', value: 15 },
  ];
  
  const multiLineData = [
    { month: 'Jan', bookings: 45, users: 120 },
    { month: 'Feb', bookings: 52, users: 135 },
    { month: 'Mar', bookings: 61, users: 150 },
    { month: 'Apr', bookings: 58, users: 145 },
    { month: 'May', bookings: 70, users: 165 },
  ];
  
  const tabs = [
    { value: 'buttons', label: 'Buttons', count: 4 },
    { value: 'forms', label: 'Forms', count: 4 },
    { value: 'data', label: 'Data Display', count: 3 },
    { value: 'charts', label: 'Charts', count: 4 },
  ];
  
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 mb-2">Component Showcase</h1>
        <p className="text-body text-fg-muted">
          Complete CH/ component library built with shadcn/Radix patterns and IU tokens. All components use Auto Layout and token-based styling.
        </p>
      </div>
      
      {/* Tabs */}
      <CHTabs tabs={tabs} value={activeTab} onValueChange={setActiveTab}>
        {/* Buttons Tab */}
        <CHTabsContent value="buttons" activeValue={activeTab}>
          <div className="flex flex-col gap-8">
            {/* CH/Button */}
            <section className="section-spacing">
              <h2 className="text-h3 mb-4">CH/Button</h2>
              <CHCard>
                <CHCardHeader>
                  <CHCardTitle>Button Variants & Sizes</CHCardTitle>
                </CHCardHeader>
                <CHCardContent>
                  <div className="flex flex-col gap-6">
                    {/* Variants */}
                    <div>
                      <h4 className="text-h4 mb-3">Variants</h4>
                      <div className="flex flex-wrap gap-3">
                        <CHButton variant="primary">Primary</CHButton>
                        <CHButton variant="secondary">Secondary</CHButton>
                        <CHButton variant="ghost">Ghost</CHButton>
                        <CHButton variant="danger">Danger</CHButton>
                        <CHButton variant="primary" disabled>Disabled</CHButton>
                        <CHButton variant="primary" loading>Loading</CHButton>
                      </div>
                    </div>
                    
                    {/* Sizes */}
                    <div>
                      <h4 className="text-h4 mb-3">Sizes (28h/12px, 36h/14px, 44h/16px)</h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <CHButton variant="primary" size="sm">Small</CHButton>
                        <CHButton variant="primary" size="md">Medium</CHButton>
                        <CHButton variant="primary" size="lg">Large</CHButton>
                      </div>
                    </div>
                    
                    {/* With Icons */}
                    <div>
                      <h4 className="text-h4 mb-3">With Icons</h4>
                      <div className="flex flex-wrap gap-3">
                        <CHButton variant="primary">
                          <Plus className="w-4 h-4" />
                          Add Resource
                        </CHButton>
                        <CHButton variant="secondary">
                          <Download className="w-4 h-4" />
                          Download
                        </CHButton>
                        <CHButton variant="ghost">
                          <Edit className="w-4 h-4" />
                          Edit
                        </CHButton>
                        <CHButton variant="danger">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </CHButton>
                      </div>
                    </div>
                  </div>
                </CHCardContent>
              </CHCard>
            </section>
            
            {/* CH/Badge */}
            <section className="section-spacing">
              <h2 className="text-h3 mb-4">CH/Badge</h2>
              <CHCard>
                <CHCardHeader>
                  <CHCardTitle>Badge Variants (Soft Backgrounds)</CHCardTitle>
                </CHCardHeader>
                <CHCardContent>
                  <div className="flex flex-wrap gap-3">
                    <CHBadge variant="neutral">Neutral</CHBadge>
                    <CHBadge variant="success">Success</CHBadge>
                    <CHBadge variant="warning">Warning</CHBadge>
                    <CHBadge variant="danger">Danger</CHBadge>
                    <CHBadge variant="info">Info</CHBadge>
                  </div>
                </CHCardContent>
              </CHCard>
            </section>
            
            {/* CH/Card */}
            <section className="section-spacing">
              <h2 className="text-h3 mb-4">CH/Card</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CHCard elevation="sm">
                  <CHCardHeader>
                    <CHCardTitle>Card with SM Elevation</CHCardTitle>
                  </CHCardHeader>
                  <CHCardContent>
                    <p className="text-body text-fg-muted">
                      Card component with header, content, and footer. Radius: lg (14px), Padding: 20px.
                    </p>
                  </CHCardContent>
                  <CHCardFooter>
                    <CHButton variant="secondary" size="sm">Cancel</CHButton>
                    <CHButton variant="primary" size="sm">Confirm</CHButton>
                  </CHCardFooter>
                </CHCard>
                
                <CHCard elevation="md">
                  <CHCardHeader
                    actions={
                      <>
                        <CHButton variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </CHButton>
                        <CHButton variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </CHButton>
                      </>
                    }
                  >
                    <CHCardTitle>Card with MD Elevation & Actions</CHCardTitle>
                  </CHCardHeader>
                  <CHCardContent>
                    <p className="text-body text-fg-muted">
                      This card includes header actions and medium elevation shadow.
                    </p>
                  </CHCardContent>
                </CHCard>
              </div>
            </section>
            
            {/* CH/Sheet */}
            <section className="section-spacing">
              <h2 className="text-h3 mb-4">CH/Sheet (Filter Drawer)</h2>
              <CHCard>
                <CHCardHeader>
                  <CHCardTitle>Right Slide-in Drawer (360px, 40% overlay)</CHCardTitle>
                </CHCardHeader>
                <CHCardContent>
                  <CHButton variant="primary" onClick={() => setSheetOpen(true)}>
                    <Filter className="w-4 h-4" />
                    Open Filter Drawer
                  </CHButton>
                </CHCardContent>
              </CHCard>
              
              <CHSheet
                isOpen={sheetOpen}
                onClose={() => setSheetOpen(false)}
                title="Filter Resources"
              >
                <div className="flex flex-col gap-4">
                  <CHSelect
                    label="Resource Type"
                    options={[
                      { value: 'library', label: 'Library' },
                      { value: 'lab', label: 'Lab' },
                      { value: 'room', label: 'Study Room' },
                    ]}
                  />
                  
                  <CHSelect
                    label="Status"
                    options={[
                      { value: 'available', label: 'Available' },
                      { value: 'booked', label: 'Booked' },
                      { value: 'maintenance', label: 'Maintenance' },
                    ]}
                  />
                  
                  <div className="flex gap-2 pt-4">
                    <CHButton variant="secondary" className="flex-1" onClick={() => setSheetOpen(false)}>
                      Reset
                    </CHButton>
                    <CHButton variant="primary" className="flex-1" onClick={() => setSheetOpen(false)}>
                      Apply Filters
                    </CHButton>
                  </div>
                </div>
              </CHSheet>
            </section>
          </div>
        </CHTabsContent>
        
        {/* Forms Tab */}
        <CHTabsContent value="forms" activeValue={activeTab}>
          <div className="flex flex-col gap-8">
            {/* CH/Input */}
            <section className="section-spacing">
              <h2 className="text-h3 mb-4">CH/Input</h2>
              <CHCard>
                <CHCardHeader>
                  <CHCardTitle>Input with Helper/Error & Character Counter</CHCardTitle>
                </CHCardHeader>
                <CHCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CHInput
                      label="Resource Name"
                      placeholder="Enter resource name..."
                      helperText="Choose a descriptive name"
                      required
                    />
                    
                    <CHInput
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      error="Invalid email format"
                    />
                    
                    <CHInput
                      label="Description"
                      placeholder="Max 100 characters"
                      value="Sample text"
                      showCharacterCount
                      maxCharacters={100}
                    />
                    
                    <CHInput
                      label="Disabled Input"
                      value="Cannot edit"
                      disabled
                    />
                  </div>
                </CHCardContent>
              </CHCard>
            </section>
            
            {/* CH/Select */}
            <section className="section-spacing">
              <h2 className="text-h3 mb-4">CH/Select</h2>
              <CHCard>
                <CHCardHeader>
                  <CHCardTitle>Select Dropdown</CHCardTitle>
                </CHCardHeader>
                <CHCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CHSelect
                      label="Category"
                      options={[
                        { value: 'academic', label: 'Academic' },
                        { value: 'research', label: 'Research' },
                        { value: 'recreational', label: 'Recreational' },
                      ]}
                      helperText="Select a category"
                    />
                    
                    <CHSelect
                      label="Building"
                      options={[
                        { value: 'wells', label: 'Wells Library' },
                        { value: 'luddy', label: 'Luddy Hall' },
                        { value: 'union', label: 'Student Union' },
                      ]}
                      error="Building is required"
                      required
                    />
                  </div>
                </CHCardContent>
              </CHCard>
            </section>
            
            {/* CH/Textarea */}
            <section className="section-spacing">
              <h2 className="text-h3 mb-4">CH/Textarea</h2>
              <CHCard>
                <CHCardHeader>
                  <CHCardTitle>Textarea with Character Counter</CHCardTitle>
                </CHCardHeader>
                <CHCardContent>
                  <CHTextarea
                    label="Comments"
                    placeholder="Enter your comments..."
                    value="This is a sample comment."
                    rows={4}
                    showCharacterCount
                    maxCharacters={500}
                    helperText="Provide detailed feedback"
                  />
                </CHCardContent>
              </CHCard>
            </section>
            
            {/* CH/Switch */}
            <section className="section-spacing">
              <h2 className="text-h3 mb-4">CH/Switch</h2>
              <CHCard>
                <CHCardHeader>
                  <CHCardTitle>Toggle Switch</CHCardTitle>
                </CHCardHeader>
                <CHCardContent>
                  <div className="flex flex-col gap-4">
                    <CHSwitch
                      label="Enable notifications"
                      checked={switchChecked}
                      onCheckedChange={setSwitchChecked}
                      helperText="Receive email updates"
                    />
                    
                    <CHSwitch
                      label="Public listing"
                      checked={false}
                      onCheckedChange={() => {}}
                      disabled
                      helperText="Disabled switch"
                    />
                  </div>
                </CHCardContent>
              </CHCard>
            </section>
          </div>
        </CHTabsContent>
        
        {/* Data Display Tab */}
        <CHTabsContent value="data" activeValue={activeTab}>
          <div className="flex flex-col gap-8">
            {/* CH/Table */}
            <section className="section-spacing">
              <h2 className="text-h3 mb-4">CH/Table</h2>
              <CHCard>
                <CHCardHeader>
                  <CHCardTitle>Sortable, Selectable Table with Density</CHCardTitle>
                </CHCardHeader>
                <CHCardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      <CHButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setLoading(!loading)}
                      >
                        Toggle Loading
                      </CHButton>
                      {selectedRows.size > 0 && (
                        <CHBadge variant="info">{selectedRows.size} selected</CHBadge>
                      )}
                    </div>
                    
                    {loading ? (
                      <CHSkeletonTable rows={4} />
                    ) : (
                      <CHTable
                        columns={tableColumns}
                        data={tableData}
                        density="comfortable"
                        selectable
                        selectedRows={selectedRows}
                        onSelectionChange={setSelectedRows}
                        getRowId={(row) => row.id}
                      />
                    )}
                  </div>
                </CHCardContent>
              </CHCard>
            </section>
            
            {/* CH/Empty */}
            <section className="section-spacing">
              <h2 className="text-h3 mb-4">CH/Empty</h2>
              <CHCard>
                <CHCardHeader>
                  <CHCardTitle>Empty State</CHCardTitle>
                </CHCardHeader>
                <CHCardContent>
                  <CHEmpty
                    title="No resources found"
                    description="Try adjusting your filters or add a new resource to get started."
                    action={
                      <CHButton variant="primary">
                        <Plus className="w-4 h-4" />
                        Add Resource
                      </CHButton>
                    }
                  />
                </CHCardContent>
              </CHCard>
            </section>
            
            {/* CH/Skeleton */}
            <section className="section-spacing">
              <h2 className="text-h3 mb-4">CH/Skeleton</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-h4 mb-3">Card Skeleton</h4>
                  <CHSkeletonCard />
                </div>
                
                <div>
                  <h4 className="text-h4 mb-3">Text Skeleton</h4>
                  <CHCard>
                    <CHCardContent>
                      <CHSkeletonText lines={4} />
                    </CHCardContent>
                  </CHCard>
                </div>
              </div>
            </section>
            
            {/* CH/Tooltip & Toast */}
            <section className="section-spacing">
              <h2 className="text-h3 mb-4">CH/Tooltip & CH/Toast</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CHCard>
                  <CHCardHeader>
                    <CHCardTitle>Tooltip</CHCardTitle>
                  </CHCardHeader>
                  <CHCardContent>
                    <div className="flex gap-4">
                      <CHTooltip content="Tooltip on top" side="top">
                        <CHButton variant="secondary" size="sm">Hover Top</CHButton>
                      </CHTooltip>
                      
                      <CHTooltip content="Tooltip on right" side="right">
                        <CHButton variant="secondary" size="sm">Hover Right</CHButton>
                      </CHTooltip>
                    </div>
                  </CHCardContent>
                </CHCard>
                
                <CHCard>
                  <CHCardHeader>
                    <CHCardTitle>Toast</CHCardTitle>
                  </CHCardHeader>
                  <CHCardContent>
                    <div className="flex flex-col gap-2">
                      <CHToast
                        variant="success"
                        title="Success!"
                        description="Your changes have been saved."
                      />
                    </div>
                  </CHCardContent>
                </CHCard>
              </div>
            </section>
          </div>
        </CHTabsContent>
        
        {/* Charts Tab */}
        <CHTabsContent value="charts" activeValue={activeTab}>
          <div className="flex flex-col gap-8">
            <section className="section-spacing">
              <h2 className="text-h3 mb-4">CH/Chart Styles (IU Token Colors)</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CHCard>
                  <CHCardHeader>
                    <CHCardTitle>Line Chart</CHCardTitle>
                  </CHCardHeader>
                  <CHCardContent>
                    <CHLineChart
                      data={lineChartData}
                      dataKey="bookings"
                      xAxisKey="month"
                      height={250}
                    />
                  </CHCardContent>
                </CHCard>
                
                <CHCard>
                  <CHCardHeader>
                    <CHCardTitle>Bar Chart</CHCardTitle>
                  </CHCardHeader>
                  <CHCardContent>
                    <CHBarChart
                      data={lineChartData}
                      dataKey="bookings"
                      xAxisKey="month"
                      height={250}
                    />
                  </CHCardContent>
                </CHCard>
                
                <CHCard>
                  <CHCardHeader>
                    <CHCardTitle>Doughnut Chart</CHCardTitle>
                  </CHCardHeader>
                  <CHCardContent>
                    <CHDoughnutChart data={doughnutData} height={300} />
                  </CHCardContent>
                </CHCard>
                
                <CHCard>
                  <CHCardHeader>
                    <CHCardTitle>Multi-Line Chart</CHCardTitle>
                  </CHCardHeader>
                  <CHCardContent>
                    <CHMultiLineChart
                      data={multiLineData}
                      lines={[
                        { dataKey: 'bookings', name: 'Bookings' },
                        { dataKey: 'users', name: 'Users' },
                      ]}
                      xAxisKey="month"
                      height={250}
                    />
                  </CHCardContent>
                </CHCard>
              </div>
            </section>
          </div>
        </CHTabsContent>
      </CHTabs>
    </div>
  );
}
