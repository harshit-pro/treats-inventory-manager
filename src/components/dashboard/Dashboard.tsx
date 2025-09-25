import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Sweet, sweetsAPI } from '@/lib/api';
import SweetCard from '@/components/sweets/SweetCard';
import Header from '@/components/layout/Header';
import AdminPanel from '@/components/admin/AdminPanel';
import heroImage from '@/assets/hero-sweets.jpg';
import { Search, Filter, Plus, Grid, List } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdmin, setShowAdmin] = useState(false);

  const { data: sweets = [], isLoading, error } = useQuery({
    queryKey: ['sweets'],
    queryFn: async () => {
      const response = await sweetsAPI.getAll();
      return response.data;
    },
  });

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(sweets.map(sweet => sweet.category))];
    return uniqueCategories.sort();
  }, [sweets]);

  // Filter sweets based on search and filters
  const filteredSweets = useMemo(() => {
    return sweets.filter(sweet => {
      const matchesSearch = sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sweet.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || sweet.category === selectedCategory;
      
      let matchesPrice = true;
      if (priceRange !== 'all') {
        const price = sweet.price;
        switch (priceRange) {
          case 'under-5':
            matchesPrice = price < 5;
            break;
          case '5-10':
            matchesPrice = price >= 5 && price <= 10;
            break;
          case '10-20':
            matchesPrice = price >= 10 && price <= 20;
            break;
          case 'over-20':
            matchesPrice = price > 20;
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [sweets, searchTerm, selectedCategory, priceRange]);

  if (showAdmin && isAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-80 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Premium Sweets Collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up">
                Sweet Shop
              </h1>
              <p className="text-lg md:text-xl mb-6 animate-fade-in-up opacity-90">
                Discover our premium collection of artisanal sweets, crafted with love and the finest ingredients.
              </p>
              {isAdmin && (
                <Button 
                  onClick={() => setShowAdmin(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground animate-fade-in-up"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Admin Panel
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sweets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 shadow-soft focus:shadow-card transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 shadow-soft">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-32 shadow-soft">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-5">Under $5</SelectItem>
                  <SelectItem value="5-10">$5 - $10</SelectItem>
                  <SelectItem value="10-20">$10 - $20</SelectItem>
                  <SelectItem value="over-20">Over $20</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex border rounded-lg overflow-hidden shadow-soft">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {filteredSweets.length} {filteredSweets.length === 1 ? 'sweet' : 'sweets'} found
              </Badge>
              {(searchTerm || selectedCategory !== 'all' || priceRange !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setPriceRange('all');
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-80"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg max-w-md mx-auto">
              <p className="font-medium">Unable to load sweets</p>
              <p className="text-sm opacity-80">Please check your connection and try again</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredSweets.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No sweets found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all' || priceRange !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No sweets are currently available'}
              </p>
            </div>
          </div>
        )}

        {/* Sweets Grid */}
        {!isLoading && !error && filteredSweets.length > 0 && (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredSweets.map((sweet, index) => (
              <div 
                key={sweet.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <SweetCard sweet={sweet} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;