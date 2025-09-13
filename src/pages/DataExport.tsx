import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileJson, FileText, Database } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { storage } from "@/lib/storage";

export default function DataExport() {
  const [leadCount, setLeadCount] = useState(0);
  const [bonusCount, setBonusCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    setLeadCount(storage.getLeads().length);
    setBonusCount(storage.getBonusSignups().length);
    setEventCount(analytics.getEvents().length);
  }, []);

  return (
    <Layout>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Data Export Dashboard</h1>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{leadCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Bonus Signups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{bonusCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Analytics Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{eventCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Database className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Lead Data</CardTitle>
                <CardDescription>Export all captured lead information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => storage.downloadExport('csv')} className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Download as CSV
                </Button>
                <Button onClick={() => storage.downloadExport('json')} variant="outline" className="w-full">
                  <FileJson className="mr-2 h-4 w-4" />
                  Download as JSON
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Database className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Analytics Data</CardTitle>
                <CardDescription>Export all tracking events and user behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => {
                    const data = analytics.exportEvents();
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `analytics-${Date.now()}.json`;
                    a.click();
                  }} 
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}