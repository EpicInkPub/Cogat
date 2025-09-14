import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileJson, FileText, BarChart3, Users, Activity, Eye, MousePointer, Clock, Mail } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { storage } from "@/lib/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function DataExport() {
  const [leadCount, setLeadCount] = useState(0);
  const [bonusCount, setBonusCount] = useState(0);
  const [pageVisitCount, setPageVisitCount] = useState(0);
  const [analyticsEventCount, setAnalyticsEventCount] = useState(0);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    analytics.pageView('data_export');
    
    loadData();
  }, []);

  const loadData = async () => {
    // Load local data
    setLeadCount(storage.getLeads().length);
    setBonusCount(storage.getBonusSignups().length);
    setPageVisitCount(storage.getPageVisits().length);
    setAnalyticsEventCount(storage.getAnalyticsEvents().length);
    setAnalyticsSummary(storage.getAnalyticsSummary());
    setRecentEvents(storage.getAnalyticsEvents().slice(-10).reverse());
  };

  const downloadAnalyticsCSV = () => {
    storage.downloadExport('csv');
  };

  return (
    <Layout>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Data Export Dashboard</h1>
          
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{leadCount}</div>
                <p className="text-sm text-muted-foreground mt-1">Package orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Bonus Signups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{bonusCount}</div>
                <p className="text-sm text-muted-foreground mt-1">Email captures</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Page Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{pageVisitCount}</div>
                <p className="text-sm text-muted-foreground mt-1">Unique visits</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">{analyticsEventCount}</div>
                <p className="text-sm text-muted-foreground mt-1">User actions</p>
              </CardContent>
            </Card>
          </div>

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

              {analyticsSummary && (
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Leads by Source</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(analyticsSummary.leadsBySource).map(([source, count]) => (
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
                        {Object.entries(analyticsSummary.leadsByPackage).map(([pkg, count]) => (
                          <div key={pkg} className="flex justify-between">
                            <span className="capitalize">{pkg}</span>
                            <Badge>{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Page Visits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(analyticsSummary.pageVisitsByPage).map(([page, count]) => (
                          <div key={page} className="flex justify-between">
                            <span className="capitalize">{page.replace('_', ' ')}</span>
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
                    <CardTitle>Analytics Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Average Time on Page</span>
                        <div className="font-medium">{Math.round(analyticsSummary.averageTimeOnPage / 1000)}s</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Total Page Visits</span>
                        <div className="font-medium">{analyticsSummary.totalPageVisits}</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Total Events</span>
                        <div className="font-medium">{analyticsSummary.totalAnalyticsEvents}</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Form Submissions</span>
                        <div className="font-medium">{analyticsSummary.totalFormSubmissions}</div>
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
                            <div><strong>Package:</strong> {lead.packageBought}</div>
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
              <div className="grid md:grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <BarChart3 className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Data Export</CardTitle>
                    <CardDescription>Export all collected analytics and lead data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={downloadAnalyticsCSV} className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Download All Data as CSV
                    </Button>
                    <Button 
                      onClick={() => {
                        storage.downloadExport('json');
                      }} 
                      variant="outline"
                      className="w-full"
                    >
                      <FileJson className="mr-2 h-4 w-4" />
                      Download All Data as JSON
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
                        storage.clearAllData();
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