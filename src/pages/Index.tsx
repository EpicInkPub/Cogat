import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Brain, 
  Trophy, 
  Users, 
  Star, 
  BookOpen, 
  Target,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { analytics } from "@/lib/analytics";

const Index = () => {
  useEffect(() => {
    analytics.pageView('home');
    return () => analytics.trackTimeOnPage('home');
  }, []);

  const features = [
    {
      icon: Brain,
      title: "Cognitive Development",
      description: "Scientifically designed practice tests that enhance critical thinking skills"
    },
    {
      icon: Trophy,
      title: "Proven Results",
      description: "Join thousands of successful students who improved their CogAT scores"
    },
    {
      icon: BookOpen,
      title: "Comprehensive Materials",
      description: "Complete test prep packages for every grade level from K-5"
    },
    {
      icon: Target,
      title: "Targeted Practice",
      description: "Grade-specific content aligned with actual CogAT test formats"
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      grade: "Parent of 3rd Grader",
      text: "My daughter's confidence soared after using these practice tests. She scored in the 95th percentile!"
    },
    {
      name: "Michael R.",
      grade: "Parent of Kindergartener",
      text: "The materials are age-appropriate and engaging. My son actually enjoys practicing!"
    },
    {
      name: "Jennifer L.",
      grade: "Parent of 5th Grader",
      text: "Worth every penny! The practice tests mirror the actual exam perfectly."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Trusted by 10,000+ Parents</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Master the CogAT Test with<br />Confidence
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Help your child excel with our comprehensive practice tests and expert-designed materials. 
            Get instant access to bonus resources plus premium test packages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="lg" 
              asChild
              onClick={() => analytics.track('cta_click', { button: 'view_test_packages', location: 'hero' })}
            >
              <Link to="/packages">
                View Test Packages
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              asChild
              onClick={() => analytics.track('cta_click', { button: 'free_bonus_materials', location: 'hero' })}
            >
              <Link to="/bonuses">
                Free Bonus Materials
                <Star className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose CogAT Test Prep Mastery?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-primary-light">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Happy Parents</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">K-Grade 5</div>
              <div className="text-muted-foreground">CogAT Levels 5/6-11</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Parents Are Saying
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.grade}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Help Your Child Succeed?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of parents who've helped their children excel on the CogAT test
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg" 
              asChild
              onClick={() => analytics.track('cta_click', { button: 'get_started_now', location: 'footer_cta' })}
            >
              <Link to="/packages">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white/10 border-white text-white hover:bg-white hover:text-primary"
              asChild
              onClick={() => analytics.track('cta_click', { button: 'claim_free_resources', location: 'footer_cta' })}
            >
              <Link to="/bonuses">
                Claim Free Resources
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
