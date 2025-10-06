import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  ShoppingCart,
  Mail,
  Activity,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface AnalyticsSummary {
  totalLeads: number;
  totalBonusSignups: number;
  totalEvents: number;
  conversionRate: number;
  popularPackage: string;
}

interface PackageData {
  name: string;
  count: number;
}

interface TimeSeriesData {
  date: string;
  leads: number;
  signups: number;
}

interface EventData {
  name: string;
  count: number;
}

interface Lead {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  packageBought: string;
  gradeSelected: string;
  timestamp: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Analytics() {
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalLeads: 0,
    totalBonusSignups: 0,
    totalEvents: 0,
    conversionRate: 0,
    popularPackage: 'N/A'
  });
  const [packageData, setPackageData] = useState<PackageData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [topEvents, setTopEvents] = useState<EventData[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const fallbackData = localStorage.getItem('fallback_data');

      if (!fallbackData) {
        toast({
          title: "No Data Available",
          description: "No analytics data found. Data will appear as users interact with your site.",
        });
        setIsLoading(false);
        return;
      }

      const allData = JSON.parse(fallbackData);

      const now = new Date();
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      const leads = allData.filter((item: any) =>
        item.type === 'lead' &&
        new Date(item.timestamp) >= startDate
      ).map((item: any) => item.data);

      const bonusSignups = allData.filter((item: any) =>
        item.type === 'bonus_signup' &&
        new Date(item.timestamp) >= startDate
      ).map((item: any) => item.data);

      const events = allData.filter((item: any) =>
        (item.type === 'analytics_event' ||
         item.type === 'page_visit' ||
         item.type === 'page_visit_end') &&
        new Date(item.timestamp) >= startDate
      ).map((item: any) => item.data);

      const totalLeads = leads.length;
      const totalBonusSignups = bonusSignups.length;
      const totalEvents = events.length;

      const packageCounts: Record<string, number> = {};
      leads.forEach((lead: any) => {
        const pkg = lead.packageBought || 'Unknown';
        packageCounts[pkg] = (packageCounts[pkg] || 0) + 1;
      });

      const packageDataArray = Object.entries(packageCounts).map(([name, count]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        count
      }));

      const popularPackage = packageDataArray.length > 0
        ? packageDataArray.reduce((max, pkg) => pkg.count > max.count ? pkg : max).name
        : 'N/A';

      const conversionRate = totalBonusSignups > 0
        ? ((totalLeads / totalBonusSignups) * 100).toFixed(1)
        : 0;

      setSummary({
        totalLeads,
        totalBonusSignups,
        totalEvents,
        conversionRate: Number(conversionRate),
        popularPackage
      });

      setPackageData(packageDataArray);

      const dailyData: Record<string, { leads: number; signups: number }> = {};
      const dateFormatter = (date: Date) => {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      };

      for (let i = 0; i < daysAgo; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dateKey = dateFormatter(date);
        dailyData[dateKey] = { leads: 0, signups: 0 };
      }

      leads.forEach((lead: any) => {
        const date = dateFormatter(new Date(lead.timestamp));
        if (dailyData[date]) {
          dailyData[date].leads++;
        }
      });

      bonusSignups.forEach((signup: any) => {
        const date = dateFormatter(new Date(signup.timestamp));
        if (dailyData[date]) {
          dailyData[date].signups++;
        }
      });

      const timeSeriesArray = Object.entries(dailyData).map(([date, data]) => ({
        date,
        leads: data.leads,
        signups: data.signups
      }));

      setTimeSeriesData(timeSeriesArray);

      const eventCounts: Record<string, number> = {};
      events.forEach((event: any) => {
        const name = event.eventName || event.page || 'Unknown';
        eventCounts[name] = (eventCounts[name] || 0) + 1;
      });

      const topEventsArray = Object.entries(eventCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setTopEvents(topEventsArray);

      setRecentLeads(leads.slice(0, 10));

      toast({
        title: "Analytics Updated",
        description: "Successfully loaded latest analytics data from local storage",
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast({
        title: "Error Loading Analytics",
        description: "Could not load analytics data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const exportToCSV = () => {
    const csvContent = [
      ['Lead Name', 'Email', 'Phone', 'Package', 'Grade', 'Date'].join(','),
      ...recentLeads.map(lead => [
        `${lead.firstName} ${lead.lastName}`,
        lead.email,
        lead.phone,
        lead.packageBought,
        lead.gradeSelected,
        new Date(lead.timestamp).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Leads data has been exported to CSV",
    });
  };

  return (
    <Layout>
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Track your performance and conversions</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadAnalytics} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              Last 7 Days
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              Last 30 Days
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('90d')}
            >
              Last 90 Days
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalLeads}</div>
                <p className="text-xs text-muted-foreground">Package purchases</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bonus Signups</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalBonusSignups}</div>
                <p className="text-xs text-muted-foreground">Email subscribers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">From signup to purchase</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalEvents}</div>
                <p className="text-xs text-muted-foreground">User interactions</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="leads">Recent Leads</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leads & Signups Over Time</CardTitle>
                  <CardDescription>Daily trends for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="leads" stroke="#8884d8" name="Leads" />
                      <Line type="monotone" dataKey="signups" stroke="#82ca9d" name="Signups" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="packages" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Package Distribution</CardTitle>
                    <CardDescription>Most popular test packages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={packageData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => entry.name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {packageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Package Popularity</CardTitle>
                    <CardDescription>Number of purchases per package</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={packageData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Events</CardTitle>
                  <CardDescription>Most common user interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={topEvents} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leads" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Leads</CardTitle>
                  <CardDescription>Latest package purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentLeads.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No leads found</p>
                    ) : (
                      recentLeads.map((lead, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b pb-4 last:border-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium">
                              {lead.firstName} {lead.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{lead.email}</p>
                          </div>
                          <div className="flex-1 text-center">
                            <Badge variant="secondary">{lead.gradeSelected}</Badge>
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-sm font-medium">{lead.packageBought}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(lead.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}
