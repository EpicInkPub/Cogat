import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileJson, FileText, BarChart3, Users, Activity, Eye, MousePointer, Clock, Mail } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { dataCapture } from "@/lib/dataCapture";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function DataExport() {
  const [sessionId, setSessionId] = useState('');
  const [fallbackData, setFallbackData] = useState<any[]>([]);
  const [onlineStatus, setOnlineStatus] = useState('checking...');

  useEffect(() => {
    analytics.pageView('data_export');
    
    loadData();
  }, []);

  const loadData = async () => {
    // Load session and fallback data
    setSessionId(dataCapture.getSessionId());
    setFallbackData(dataCapture.getFallbackData());
    
    // Check if services are working
    try {
      await dataCapture.captureAnalyticsEvent('data_export_test', { test: true });
      setOnlineStatus('✅ Online services working');
    } catch (error) {
      setOnlineStatus('❌ Services offline - using fallback');
    }
  };

  const retryFailedSubmissions = async () => {
    try {
      await dataCapture.retryFailedSubmissions();
      setOnlineStatus('✅ Failed submissions retried successfully');
      loadData(); // Refresh data
    } catch (error) {
      setOnlineStatus('❌ Retry failed - services still offline');
    }
  };

  const downloadFallbackData = () => {
    const data = JSON.stringify(fallbackData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fallback-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Online Data Capture Dashboard</h1>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Session ID
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-mono text-primary break-all">{sessionId}</div>
                <p className="text-sm text-muted-foreground mt-1">Current session</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Service Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">{onlineStatus}</div>
                <p className="text-sm text-muted-foreground mt-1">Data capture status</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Fallback Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">{fallbackData.length}</div>
                <p className="text-sm text-muted-foreground mt-1">Items in fallback</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="status" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="fallback">Fallback Data</TabsTrigger>
              <TabsTrigger value="setup">Setup Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Data Capture Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Current Status:</span>
                      <div className="mt-1">{onlineStatus}</div>
                    </div>
                    <div>
                      <span className="font-medium">Session ID:</span>
                      <div className="mt-1 font-mono text-sm break-all">{sessionId}</div>
                    </div>
                    <div>
                      <span className="font-medium">Fallback Items:</span>
                      <div className="mt-1">{fallbackData.length} items stored locally</div>
                    </div>
                    {fallbackData.length > 0 && (
                      <Button onClick={retryFailedSubmissions} variant="outline">
                        Retry Failed Submissions
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Service Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your environment variables to enable online data capture
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Environment Variables:</h4>
                      <div className="space-y-2 text-sm font-mono bg-muted p-4 rounded">
                        <div>VITE_WEBHOOK_URL=your_webhook_endpoint</div>
                        <div>VITE_GOOGLE_SHEETS_URL=your_google_apps_script_url</div>
                        <div>VITE_FORMSPREE_URL=https://formspree.io/f/your_form_id</div>
                        <div>VITE_NETLIFY_FORM_URL=your_netlify_form_endpoint</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Data Being Captured:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Lead information (name, surname, email, phone, package)</li>
                        <li>Bonus email signups</li>
                        <li>Page visits and time spent</li>
                        <li>User interactions and analytics events</li>
                        <li>Form submissions and conversions</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fallback" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Fallback Data Storage
                  </CardTitle>
                  <CardDescription>
                    Data stored locally when online services are unavailable
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Items in fallback storage: {fallbackData.length}</span>
                      {fallbackData.length > 0 && (
                        <Button onClick={downloadFallbackData} variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download Fallback Data
                        </Button>
                      )}
                    </div>
                    
                    {fallbackData.length > 0 && (
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {fallbackData.map((item, index) => (
                          <div key={index} className="border rounded p-3">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{item.type}</span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(item.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {JSON.stringify(item.data, null, 2).substring(0, 100)}...
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {fallbackData.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No fallback data - all submissions are being sent online successfully!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="setup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Setup Guide</CardTitle>
                  <CardDescription>
                    How to configure online data capture services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">1. Webhook Endpoint</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Set up a webhook endpoint to receive POST requests with JSON data.
                      </p>
                      <code className="text-xs bg-muted p-2 rounded block">
                        VITE_WEBHOOK_URL=https://your-api.com/webhook
                      </code>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">2. Google Sheets (via Apps Script)</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Create a Google Apps Script that accepts POST data and writes to a sheet.
                      </p>
                      <code className="text-xs bg-muted p-2 rounded block">
                        VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/your-script-id/exec
                      </code>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">3. Formspree</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Sign up at formspree.io and create a form to receive submissions.
                      </p>
                      <code className="text-xs bg-muted p-2 rounded block">
                        VITE_FORMSPREE_URL=https://formspree.io/f/your-form-id
                      </code>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">4. Netlify Forms</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        If deployed on Netlify, you can use their built-in form handling.
                      </p>
                      <code className="text-xs bg-muted p-2 rounded block">
                        VITE_NETLIFY_FORM_URL=/.netlify/functions/submit-form
                      </code>
                    </div>
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