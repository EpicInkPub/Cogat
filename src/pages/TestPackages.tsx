import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Users, Clock, FileText, Award, Zap, Loader2 } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { dataCapture } from "@/lib/dataCapture";
import { toast } from "@/hooks/use-toast";

interface Package {
  id: string;
  grade: string;
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  features: string[];
  popular?: boolean;
}

const packages: Package[] = [
  {
    id: "single",
    grade: "All Grades",
    title: "1 Practice Test - Starter Package",
    description: "Perfect for getting started with CogAT preparation",
    price: "$9.99",
    originalPrice: "$14.99",
    features: [
      "1 complete CogAT practice test",
      "Detailed answer explanations",
      "Instant digital access",
      "Mobile-friendly format"
    ]
  },
  {
    id: "bundle3",
    grade: "All Grades",
    title: "3 Practice Tests - Essential Bundle",
    description: "Essential practice bundle for comprehensive preparation",
    price: "$24.99",
    originalPrice: "$34.99",
    features: [
      "3 full-length practice tests",
      "Detailed answer explanations for all questions",
      "Printable PDF format",
    ],
    popular: true
  },
  {
    id: "bundle5",
    grade: "All Grades",
    title: "5 Practice Tests - Advanced Package",
    description: "Advanced preparation package for confident test-taking",
    price: "$39.99",
    originalPrice: "$54.99",
    features: [
      "5 complete practice tests",
      "Detailed answer explanations for all questions",
      "Printable PDF format"
    ]
  },
  {
    id: "bundle10",
    grade: "All Grades",
    title: "10 Practice Tests - Ultimate Mastery",
    description: "Ultimate test mastery package with maximum practice",
    price: "$69.99",
    originalPrice: "$99.99",
    features: [
      "10 full-length practice tests",
      "Detailed answer explanations for all questions",
      "Printable PDF format"
    ]
  }
];

export default function TestPackages() {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    package: ""
  });

  useEffect(() => {
    analytics.pageView('test_packages');
    analytics.track('test_packages_viewed', { packages_count: packages.length });
    
    // Track when user leaves without completing order
    const handleBeforeUnload = () => {
      if (showOrderForm && !formData.email) {
        analytics.trackAbandonedCart(selectedPackage?.id || '', 'form_opened');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      analytics.trackTimeOnPage('test_packages');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [showOrderForm, formData.email, selectedPackage]);

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setFormData({ ...formData, package: "kindergarten" }); // Default to kindergarten
    setShowOrderForm(true);
    analytics.trackPackageSelection(pkg.id, pkg.title, pkg.price);
    analytics.trackPurchaseIntent(pkg.id, pkg.title, pkg.price);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    toast({
      title: "Processing Order",
      description: "Please wait while we process your information...",
    });

    console.log('📝 Submitting lead form with data:', {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      packageBought: selectedPackage?.title,
      gradeSelected: formData.package,
      source: 'test_package'
    });

    analytics.trackFormStart('package_order');

    try {
      console.log('📝 About to capture lead with dataCapture.captureLead...');
      const lead = await dataCapture.captureLead({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        packageBought: selectedPackage?.title || 'unknown',
        gradeSelected: formData.package,
        source: 'test_package'
      });
      console.log('📝 Lead captured:', lead);

      analytics.trackFormSubmission('package_order', formData, true);
      analytics.setUserId(lead.id);

      analytics.trackPurchaseComplete({
        ...lead,
        price: selectedPackage?.price
      });

      analytics.trackUserJourney('purchase_completed', {
        packageId: selectedPackage?.id,
        price: selectedPackage?.price
      });

      toast({
        title: "Order Submitted Successfully!",
        description: "Redirecting to confirmation page...",
      });

      setTimeout(() => {
        navigate('/thank-you', {
          state: {
            name: formData.firstName,
            package: selectedPackage?.title,
            grade: selectedPackage?.grade
          }
        });
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to capture lead submission:', error);
      analytics.trackFormSubmission('package_order', formData, false);
      analytics.trackError(`Lead capture failed: ${errorMessage}`, 'test_packages');
      toast({
        title: 'Submission Failed',
        description: 'We were unable to submit your information. Please try again.',
        variant: 'destructive'
      });
      setIsSubmitting(false);
      return;
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Test Package
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect preparation package for your child's grade level. 
            All packages include instant access and a 30-day money-back guarantee.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative hover:shadow-xl transition-all duration-300 flex flex-col ${
                  pkg.popular ? 'border-primary shadow-lg' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="pt-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-primary">{pkg.grade}</span>
                    <Award className="h-5 w-5 text-warning" />
                  </div>
                  <CardTitle className="text-xl">{pkg.title}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <span className="text-3xl font-bold">{pkg.price}</span>
                    <span className="text-muted-foreground line-through ml-2">{pkg.originalPrice}</span>
                  </div>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button 
                    className="w-full"
                    variant={pkg.popular ? "hero" : "default"}
                    onClick={() => {
                      analytics.trackPackageView(pkg.id, pkg.title, pkg.price);
                      handleSelectPackage(pkg);
                    }}
                  >
                    Select Package
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-4 bg-muted">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Zap className="h-8 w-8 text-primary mb-2" />
              <span className="font-semibold">Instant Access</span>
              <span className="text-sm text-muted-foreground">Start immediately</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-8 w-8 text-primary mb-2" />
              <span className="font-semibold">10,000+ Users</span>
              <span className="text-sm text-muted-foreground">Trusted by parents</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-8 w-8 text-primary mb-2" />
              <span className="font-semibold">Lifetime Access</span>
              <span className="text-sm text-muted-foreground">No time limits</span>
            </div>
            <div className="flex flex-col items-center">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <span className="font-semibold">Printable PDFs</span>
              <span className="text-sm text-muted-foreground">Offline practice</span>
            </div>
          </div>
        </div>
      </section>

      {/* Order Form Dialog */}
      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Enter your information to get instant access to {selectedPackage?.title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="package">Selected Package</Label>
              <Select value={formData.package} onValueChange={(value) => setFormData({ ...formData, package: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kindergarten">Kindergarten: CogAT Level 5/6</SelectItem>
                  <SelectItem value="grade1">Grade 1: CogAT Level 7</SelectItem>
                  <SelectItem value="grade2">Grade 2: CogAT Level 8</SelectItem>
                  <SelectItem value="grade3">Grade 3: CogAT Level 9</SelectItem>
                  <SelectItem value="grade4">Grade 4: CogAT Level 10</SelectItem>
                  <SelectItem value="grade5">Grade 5: CogAT Level 11</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-primary-light p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">{selectedPackage?.price}</span>
              </div>
            </div>
            <Button type="submit" className="w-full" variant="hero" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Order Now'
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              This is a test order. No payment will be processed.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}