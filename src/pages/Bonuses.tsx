import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  BookOpen, 
  FileText, 
  CheckCircle2,
  Gift,
  Lock,
  Unlock,
  Award,
  Zap
} from "lucide-react";
import { analytics } from "@/lib/analytics";
import { storage } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";

// Removed Bonus interface - no longer needed

// Removed individual bonus items - now using single Google Drive link

export default function Bonuses() {
  const [email, setEmail] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    analytics.pageView('bonuses');
    
    // Check if user has already unlocked bonuses
    const unlockedEmail = localStorage.getItem('bonuses_unlocked');
    if (unlockedEmail) {
      setIsUnlocked(true);
      setEmail(unlockedEmail);
      setHasSubmitted(true);
    }
    
    return () => analytics.trackTimeOnPage('bonuses');
  }, []);

  const handleUnlockBonuses = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Save email and unlock bonuses
    storage.addBonusSignup(email);
    localStorage.setItem('bonuses_unlocked', email);
    setIsUnlocked(true);
    setHasSubmitted(true);

    // Track analytics
    analytics.track('bonuses_unlocked', { email });

    toast({
      title: "Success!",
      description: "Your bonus materials have been unlocked. Click any item to download.",
    });
  };

  // Removed handleDownload function - no longer needed

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-success-light text-success px-4 py-2 rounded-full mb-6">
            <Gift className="h-4 w-4" />
            <span className="text-sm font-semibold">100% Free Resources</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Free Bonus Materials
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get instant access to our exclusive collection of supplementary materials 
            designed to boost your child's cognitive development.
          </p>
        </div>
      </section>

      {/* Email Unlock Section */}
      {!hasSubmitted && (
        <section className="py-12 px-4 bg-primary-light">
          <div className="container mx-auto max-w-md">
            <Card>
              <CardHeader className="text-center">
                <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Unlock Your Free Bonuses</CardTitle>
                <CardDescription>
                  Enter your email to get instant access to all bonus materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUnlockBonuses} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="parent@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" variant="hero">
                    Unlock Free Materials
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    We respect your privacy. No spam, ever.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Success Message */}
      {hasSubmitted && (
        <section className="py-8 px-4 bg-success-light">
          <div className="container mx-auto">
            <div className="flex items-center justify-center gap-3">
              <Unlock className="h-6 w-6 text-success" />
              <p className="text-success font-semibold">
                Materials unlocked for {email}. Click any item below to download!
              </p>
            </div>
          </div>
        </section>
      )}

  {/* Download Link Section */}
      {isUnlocked && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <Card>
              <CardHeader>
                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
                <CardTitle>Access Your Free Resources</CardTitle>
                <CardDescription>
                  Click the button below to access all bonus materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={() => {
                    analytics.track('bonus_folder_accessed', { email });
                    window.open('https://drive.google.com/drive/u/8/folders/10FKqvFsULxEbIsG73K91e_Yn0v-6XaEk', '_blank');
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Access Bonus Materials
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Value Proposition */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Why These Bonuses Matter</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Comprehensive Support</h3>
              <p className="text-sm text-muted-foreground">
                Materials that complement your test prep journey
              </p>
            </div>
            <div className="text-center">
              <div className="bg-success-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Proven Strategies</h3>
              <p className="text-sm text-muted-foreground">
                Expert-designed content that delivers results
              </p>
            </div>
            <div className="text-center">
              <div className="bg-accent/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">100% Free</h3>
              <p className="text-sm text-muted-foreground">
                No hidden costs or subscriptions required
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
