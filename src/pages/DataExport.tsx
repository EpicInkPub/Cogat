import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileJson, FileText, Database, BarChart3, Users, Activity, Eye } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { storage } from "@/lib/storage";
import { database } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function DataExport() {
  const [leadCount, setLeadCount] = useState(0);
  const [bonusCount, setBonusCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);
  const [dataSummary, setDataSummary] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [databaseData, setDatabaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analytics.pageView('data_export');
    
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load local data
      setLeadCount(storage.getLeads().length);
      setBonusCount(storage.getBonusSignups().length);
      setEventCount(analytics.getEvents().length);
      setAnalyticsSummary(analytics.getAnalyticsSummary());
      setDataSummary(storage.getDataSummary());
      setRecentEvents(analytics.getEvents().slice(-10).reverse());
      
      // Load database data
      const dbSummary = await database.getAnalyticsSummary();
      setDatabaseData(dbSummary);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadAnalyticsCSV = () => {
    const csv = analytics.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Data Export Dashboard</h1>
          
          {loading && (
            <div className="text-center py-8">
              <p>Loading data...</p>
            </div>
          )}
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Local Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{leadCount}</div>
                <p className="text-sm text-muted-foreground mt-1">Browser storage</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Local Bonuses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{bonusCount}</div>
                <p className="text-sm text-muted-foreground mt-1">Browser storage</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Local Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{eventCount}</div>
                <p className="text-sm text-muted-foreground mt-1">Browser storage</p>
              </CardContent>
            </Card>
          </div>

          {databaseData && (
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-800">Database Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{databaseData.totalLeads}</div>
                  <p className="text-sm text-green-700 mt-1">All users (Supabase)</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-800">Database Bonuses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{databaseData.totalBonusSignups}</div>
                  <p className="text-sm text-green-700 mt-1">All users (Supabase)</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-800">Database Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{databaseData.totalEvents}</div>
                  <p className="text-sm text-green-700 mt-1">All users (Supabase)</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📊 Real Database Analytics</h3>
            <p className="text-blue-700 text-sm">
              The green cards show data from ALL users across ALL devices and sessions. 
              This is your real website analytics stored in Supabase database.
            </p>
            <Button 
              onClick={loadData} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Refresh Database Data
            </Button>
          </div>

          {databaseData && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  Recent Database Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Recent Leads ({databaseData.recentLeads?.length || 0})</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {databaseData.recentLeads?.map((lead: any) => (
                        <div key={lead.id} className="text-sm border-l-2 border-green-500 pl-3">
                          <strong>{lead.first_name} {lead.last_name}</strong> - {lead.email}
                          <br />
                          <span className="text-muted-foreground">
                            {lead.package_selected} | {new Date(lead.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Recent Bonus Signups ({databaseData.recentBonusSignups?.length || 0})</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {databaseData.recentBonusSignups?.map((signup: any) => (
                        <div key={signup.id} className="text-sm border-l-2 border-blue-500 pl-3">
                          <strong>{signup.email}</strong>
                          <br />
                          <span className="text-muted-foreground">
                            {new Date(signup.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="leads">Lead Data</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {analyticsSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Conversion Funnel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Visited Home Page</span>
                        <Badge variant={analyticsSummary.conversionFunnel.visitedHome ? "default" : "secondary"}>
                          {analyticsSummary.conversionFunnel.visitedHome ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Visited Test Packages</span>
                        <Badge variant={analyticsSummary.conversionFunnel.visitedPackages ? "default" : "secondary"}>
                          {analyticsSummary.conversionFunnel.visitedPackages ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Selected Package</span>
                        <Badge variant={analyticsSummary.conversionFunnel.selectedPackage ? "default" : "secondary"}>
                          {analyticsSummary.conversionFunnel.selectedPackage ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Submitted Form</span>
                        <Badge variant={analyticsSummary.conversionFunnel.submittedForm ? "default" : "secondary"}>
                          {analyticsSummary.conversionFunnel.submittedForm ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Unlocked Bonuses</span>
                        <Badge variant={analyticsSummary.conversionFunnel.unlockedBonuses ? "default" : "secondary"}>
                          {analyticsSummary.conversionFunnel.unlockedBonuses ? "✓" : "✗"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {dataSummary && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Leads by Source</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(dataSummary.leadsBySource).map(([source, count]) => (
                          <div key={source} className="flex justify-between">
                            <span className="capitalize">{source}</span>
                            <Badge>{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Leads by Package</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(dataSummary.leadsByPackage).map(([pkg, count]) => (
                          <div key={pkg} className="flex justify-between">
                            <span className="capitalize">{pkg}</span>
                            <Badge>{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentEvents.map((event, index) => (
                      <div key={index} className="border-l-2 border-primary pl-4 py-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{event.event}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {event.properties?.url && `Page: ${event.properties.url}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {analyticsSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Session Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Session Duration</span>
                        <div className="font-medium">{analyticsSummary.sessionDuration}</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Page Views</span>
                        <div className="font-medium">{analyticsSummary.pageViews}</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Total Clicks</span>
                        <div className="font-medium">{analyticsSummary.totalClicks}</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Form Submissions</span>
                        <div className="font-medium">{analyticsSummary.formSubmissions}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="leads" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    All Collected Data
                  </CardTitle>
                  <CardDescription>
                    Complete list of all form submissions and user data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Package Orders ({leadCount})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {storage.getLeads().map((lead) => (
                        <div key={lead.id} className="border rounded p-3">
                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            <div><strong>Name:</strong> {lead.firstName} {lead.lastName}</div>
                            <div><strong>Email:</strong> {lead.email}</div>
                            <div><strong>Phone:</strong> {lead.phone}</div>
                            <div><strong>Package:</strong> {lead.package}</div>
                            <div><strong>Source:</strong> {lead.source}</div>
                            <div><strong>Date:</strong> {new Date(lead.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h4 className="font-semibold mt-6">Bonus Signups ({bonusCount})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {storage.getBonusSignups().map((signup) => (
                        <div key={signup.id} className="border rounded p-3">
                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            <div><strong>Email:</strong> {signup.email}</div>
                            <div><strong>Date:</strong> {new Date(signup.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="export" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <Database className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Database Export</CardTitle>
                    <CardDescription>Export real user data from Supabase database</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={async () => {
                        try {
                          const leads = await database.getLeads();
                          const bonusSignups = await database.getBonusSignups();
                          
                          const csvData = [
                            ['Type', 'First Name', 'Last Name', 'Email', 'Phone', 'Package', 'Grade', 'Date'],
                            ...leads.map(lead => [
                              'Lead', lead.first_name, lead.last_name, lead.email, 
                              lead.phone, lead.package_selected, lead.grade_selected, 
                              new Date(lead.created_at).toLocaleString()
                            ]),
                            ...bonusSignups.map(signup => [
                              'Bonus', '', '', signup.email, '', '', '', 
                              new Date(signup.created_at).toLocaleString()
                            ])
                          ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
                          
                          const blob = new Blob([csvData], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `database-export-${Date.now()}.csv`;
                          a.click();
                          URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error('Export failed:', error);
                        }
                      }} 
                      className="w-full"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Download Database as CSV
                    </Button>
                    <Button onClick={() => storage.downloadExport('csv')} variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Download Local Data as CSV
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <BarChart3 className="h-8 w-8 text-accent mb-2" />
                    <CardTitle>Local Analytics Export</CardTitle>
                    <CardDescription>Export browser session analytics data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={downloadAnalyticsCSV} className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Download Analytics as CSV
                    </Button>
                    <Button 
                      onClick={() => {
                        const data = analytics.exportEvents();
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `analytics-${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }} 
                      variant="outline"
                      className="w-full"
                    >
                      <FileJson className="mr-2 h-4 w-4" />
                      Download Analytics as JSON
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Clear All Data</CardTitle>
                  <CardDescription>
                    Remove all stored analytics and lead data (use for testing)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                        analytics.clearEvents();
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                  >
                    Clear All Data
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}