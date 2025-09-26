import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import heroImage from '@/assets/hero-sweets.jpg';
import { ShoppingBag, Users, Crown, ArrowRight } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: ShoppingBag,
      title: "Premium Collection",
      description: "Discover artisanal sweets crafted with the finest ingredients"
    },
    {
      icon: Users,
      title: "Easy Shopping",
      description: "Browse, search, and purchase your favorite sweets with ease"
    },
    {
      icon: Crown,
      title: "Admin Management",
      description: "Comprehensive inventory management for store owners"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Premium Sweets Collection"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="animate-float mb-8">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-card">
              <ShoppingBag className="h-10 w-10 text-white" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up gradient-text">
            Sweet Shop
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in-up max-w-2xl mx-auto">
            Your premium destination for artisanal sweets and confectionery delights.
            Experience the finest quality treats with our professional management system.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-gradient-primary hover:opacity-90 shadow-card hover:shadow-hover transition-all duration-300 px-8"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-primary/30 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 px-8"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-10 bg-card/80 backdrop-blur-sm border-y border-border/50">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Premium Sweets', value: '250+' },
            { label: 'Happy Customers', value: '10k+' },
            { label: 'Orders Delivered', value: '50k+' },
            { label: 'Cities Served', value: '120+' },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-lg bg-muted/40">
              <div className="text-2xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Why Choose Sweet Shop?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for modern confectionery businesses with professional-grade features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="card-hover shadow-card bg-card/80 backdrop-blur-sm border-border/50 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Sweet Journey?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of sweet lovers and business owners who trust our platform
          </p>

          <Link to="/register">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-card hover:shadow-hover transition-all duration-300 px-8"
            >
              Create Your Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
