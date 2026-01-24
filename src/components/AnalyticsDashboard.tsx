import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Receipt, 
  MessageSquare, 
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle
} from 'lucide-react';
import { format, differenceInDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface AnalyticsDashboardProps {
  societyId: string;
}

interface BillStats {
  totalBills: number;
  paidBills: number;
  unpaidBills: number;
  totalAmount: number;
  collectedAmount: number;
  collectionRate: number;
  monthlyData: { month: string; collected: number; pending: number }[];
}

interface ComplaintStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  avgResolutionDays: number;
  categoryData: { name: string; value: number }[];
}

interface FacilityStats {
  totalBookings: number;
  facilityData: { name: string; bookings: number }[];
  weeklyTrend: { day: string; bookings: number }[];
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secretary))',
  'hsl(142, 76%, 36%)',
  'hsl(48, 96%, 53%)',
  'hsl(280, 87%, 65%)',
];

export function AnalyticsDashboard({ societyId }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [billStats, setBillStats] = useState<BillStats | null>(null);
  const [complaintStats, setComplaintStats] = useState<ComplaintStats | null>(null);
  const [facilityStats, setFacilityStats] = useState<FacilityStats | null>(null);

  useEffect(() => {
    fetchAllStats();
  }, [societyId]);

  const fetchAllStats = async () => {
    setLoading(true);
    await Promise.all([
      fetchBillStats(),
      fetchComplaintStats(),
      fetchFacilityStats()
    ]);
    setLoading(false);
  };

  const fetchBillStats = async () => {
    try {
      const { data: bills, error } = await supabase
        .from('bills')
        .select('*')
        .eq('society_id', societyId);

      if (error) throw error;

      const totalBills = bills?.length || 0;
      const paidBills = bills?.filter(b => b.status === 'paid').length || 0;
      const unpaidBills = totalBills - paidBills;
      const totalAmount = bills?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;
      const collectedAmount = bills?.filter(b => b.status === 'paid').reduce((sum, b) => sum + Number(b.amount), 0) || 0;
      const collectionRate = totalAmount > 0 ? Math.round((collectedAmount / totalAmount) * 100) : 0;

      // Monthly data for last 6 months
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));
        const monthBills = bills?.filter(b => {
          const createdAt = new Date(b.created_at || '');
          return createdAt >= monthStart && createdAt <= monthEnd;
        }) || [];
        
        const collected = monthBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + Number(b.amount), 0);
        const pending = monthBills.filter(b => b.status !== 'paid').reduce((sum, b) => sum + Number(b.amount), 0);
        
        monthlyData.push({
          month: format(monthStart, 'MMM'),
          collected: collected / 1000, // Convert to thousands for readability
          pending: pending / 1000
        });
      }

      setBillStats({
        totalBills,
        paidBills,
        unpaidBills,
        totalAmount,
        collectedAmount,
        collectionRate,
        monthlyData
      });
    } catch (error) {
      console.error('Error fetching bill stats:', error);
    }
  };

  const fetchComplaintStats = async () => {
    try {
      const { data: complaints, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('society_id', societyId);

      if (error) throw error;

      const total = complaints?.length || 0;
      const pending = complaints?.filter(c => c.status === 'Pending').length || 0;
      const inProgress = complaints?.filter(c => c.status === 'In Progress').length || 0;
      const resolved = complaints?.filter(c => c.status === 'Resolved').length || 0;

      // Calculate average resolution time for resolved complaints
      const resolvedComplaints = complaints?.filter(c => c.status === 'Resolved' && c.updated_at && c.created_at) || [];
      const totalDays = resolvedComplaints.reduce((sum, c) => {
        return sum + differenceInDays(new Date(c.updated_at!), new Date(c.created_at!));
      }, 0);
      const avgResolutionDays = resolvedComplaints.length > 0 ? Math.round(totalDays / resolvedComplaints.length) : 0;

      // Category breakdown
      const categories = complaints?.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const categoryData = Object.entries(categories).map(([name, value]) => ({ name, value }));

      setComplaintStats({
        total,
        pending,
        inProgress,
        resolved,
        avgResolutionDays,
        categoryData
      });
    } catch (error) {
      console.error('Error fetching complaint stats:', error);
    }
  };

  const fetchFacilityStats = async () => {
    try {
      // Fetch bookings with facility names
      const { data: bookings, error } = await supabase
        .from('facility_bookings')
        .select('*, facilities(name)')
        .eq('society_id', societyId);

      if (error) throw error;

      const totalBookings = bookings?.length || 0;

      // Group by facility
      const facilityGroups = bookings?.reduce((acc, b) => {
        const facilityName = (b.facilities as any)?.name || 'Unknown';
        acc[facilityName] = (acc[facilityName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const facilityData = Object.entries(facilityGroups)
        .map(([name, bookings]) => ({ name, bookings }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

      // Weekly trend (last 7 days)
      const weeklyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayBookings = bookings?.filter(b => b.booking_date === dateStr).length || 0;
        weeklyTrend.push({
          day: format(date, 'EEE'),
          bookings: dayBookings
        });
      }

      setFacilityStats({
        totalBookings,
        facilityData,
        weeklyTrend
      });
    } catch (error) {
      console.error('Error fetching facility stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-secretary/30 border-t-secretary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold">{billStats?.collectionRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secretary/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-secretary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Bills</p>
                <p className="text-2xl font-bold">{billStats?.unpaidBills || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold">{complaintStats?.avgResolutionDays || 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{facilityStats?.totalBookings || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Collection Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secretary" />
            Payment Collection (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={billStats?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `₹${value}K`} />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toFixed(1)}K`, '']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="collected" name="Collected" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="hsl(48, 96%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaint Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-secretary" />
              Complaint Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-[200px] w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Pending', value: complaintStats?.pending || 0 },
                        { name: 'In Progress', value: complaintStats?.inProgress || 0 },
                        { name: 'Resolved', value: complaintStats?.resolved || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="hsl(48, 96%, 53%)" />
                      <Cell fill="hsl(var(--secretary))" />
                      <Cell fill="hsl(142, 76%, 36%)" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 w-full md:w-1/2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <Badge variant="outline">{complaintStats?.pending || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--secretary))' }} />
                    <span className="text-sm">In Progress</span>
                  </div>
                  <Badge variant="outline">{complaintStats?.inProgress || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Resolved</span>
                  </div>
                  <Badge variant="outline">{complaintStats?.resolved || 0}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaint Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-secretary" />
              Complaints by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complaintStats?.categoryData || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--secretary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Facility Booking Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secretary" />
              Bookings by Facility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {facilityStats?.facilityData && facilityStats.facilityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={facilityStats.facilityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No booking data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secretary" />
              Weekly Booking Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={facilityStats?.weeklyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
