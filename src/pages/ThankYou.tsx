import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Download, ArrowRight } from "lucide-react";
import { analytics } from "@/lib/analytics";

export default function ThankYou() {
  const location = useLocation();
  const { name, package: packageName, grade } = location.state || {};

  useEffect(() => {
    analytics.pageView('thank_you');
    analytics.track('conversion_complete', { package: packageName, grade });
  }, [packageName, grade]);

  return (
    <Layout>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="mb-8">
            <CheckCircle className="h-20 w-20 text-success mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Thank You, {name || 'Parent'}!</h1>
            <p className="text-xl text-muted-foreground">
              Your order for {packageName || 'the test package'} has been received.
            </p>
          </div>

          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">What Happens Next?</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">1.</span>
                <p>Check your email for access instructions and login details</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">2.</span>
                <p>Download the practice materials and study guides</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">3.</span>
                <p>Start practicing with your child at your own pace</p>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/bonuses">
                <Download className="mr-2 h-5 w-5" />
                Get Your Free Bonuses
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/">
                Return to Home
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}