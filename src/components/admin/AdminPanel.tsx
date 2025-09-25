import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Sweet, sweetsAPI } from '@/lib/api';
import SweetCard from '@/components/sweets/SweetCard';
import Header from '@/components/layout/Header';
import { ArrowLeft, Plus, Package, TrendingUp, DollarSign, Archive } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [deletingSweet, setDeletingSweet] = useState<Sweet | null>(null);
  const [restockSweet, setRestockSweet] = useState<Sweet | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<number>(0);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sweets = [] } = useQuery({
    queryKey: ['sweets'],
    queryFn: async () => {
      const response = await sweetsAPI.getAll();
      return response.data;
    },
  });

  // Create sweet mutation
  const createMutation = useMutation({
    mutationFn: sweetsAPI.create,
    onSuccess: () => {
      toast({
        title: "Sweet created!",
        description: "New sweet has been added to the inventory",
        className: "bg-success text-success-foreground",
      });
      queryClient.invalidateQueries({ queryKey: ['sweets'] });
      setIsCreateOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.response?.data?.message || "Unable to create sweet",
        variant: "destructive",
      });
    },
  });

  // Update sweet mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sweet> }) => 
      sweetsAPI.update(id, data),
    onSuccess: () => {
      toast({
        title: "Sweet updated!",
        description: "Sweet details have been updated successfully",
        className: "bg-success text-success-foreground",
      });
      queryClient.invalidateQueries({ queryKey: ['sweets'] });
      setEditingSweet(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.response?.data?.message || "Unable to update sweet",
        variant: "destructive",
      });
    },
  });

  // Delete sweet mutation
  const deleteMutation = useMutation({
    mutationFn: sweetsAPI.delete,
    onSuccess: () => {
      toast({
        title: "Sweet deleted!",
        description: "Sweet has been removed from inventory",
        className: "bg-success text-success-foreground",
      });
      queryClient.invalidateQueries({ queryKey: ['sweets'] });
      setDeletingSweet(null);
    },
    onError: (error: any) => {
      toast({
        title: "Deletion failed",
        description: error.response?.data?.message || "Unable to delete sweet",
        variant: "destructive",
      });
    },
  });

  // Restock mutation
  const restockMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      sweetsAPI.restock(id, quantity),
    onSuccess: () => {
      toast({
        title: "Restock successful!",
        description: "Inventory has been updated",
        className: "bg-success text-success-foreground",
      });
      queryClient.invalidateQueries({ queryKey: ['sweets'] });
      setRestockSweet(null);
      setRestockQuantity(0);
    },
    onError: (error: any) => {
      toast({
        title: "Restock failed",
        description: error.response?.data?.message || "Unable to restock",
        variant: "destructive",
      });
    },
  });

  // Stats calculations
  const stats = {
    totalSweets: sweets.length,
    totalValue: sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity), 0),
    outOfStock: sweets.filter(sweet => sweet.quantity === 0).length,
    lowStock: sweets.filter(sweet => sweet.quantity > 0 && sweet.quantity <= 5).length,
  };

  const SweetForm = ({ sweet, onSubmit, onCancel }: {
    sweet?: Sweet | null;
    onSubmit: (data: Omit<Sweet, 'id'>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: sweet?.name || '',
      category: sweet?.category || '',
      price: sweet?.price || 0,
      quantity: sweet?.quantity || 0,
      description: sweet?.description || '',
      imageUrl: sweet?.imageUrl || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter sweet name"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., Chocolate, Candy"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
            placeholder="0"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL (Optional)</Label>
          <Input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the sweet..."
            rows={3}
          />
        </div>
        <div className="flex gap-2 pt-4">
          <Button type="submit" className="bg-gradient-primary">
            {sweet ? 'Update Sweet' : 'Create Sweet'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
            <p className="text-muted-foreground">Manage your sweet shop inventory</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sweets</p>
                  <p className="text-2xl font-bold">{stats.totalSweets}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold text-destructive">{stats.outOfStock}</p>
                </div>
                <Archive className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-warning">{stats.lowStock}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-soft">
                <Plus className="mr-2 h-4 w-4" />
                Add New Sweet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Sweet</DialogTitle>
                <DialogDescription>
                  Add a new sweet to your inventory
                </DialogDescription>
              </DialogHeader>
              <SweetForm
                onSubmit={(data) => createMutation.mutate(data)}
                onCancel={() => setIsCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Sweets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sweets.map((sweet) => (
            <SweetCard
              key={sweet.id}
              sweet={sweet}
              onEdit={setEditingSweet}
              onDelete={setDeletingSweet}
            />
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingSweet} onOpenChange={() => setEditingSweet(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Sweet</DialogTitle>
              <DialogDescription>
                Update sweet details
              </DialogDescription>
            </DialogHeader>
            {editingSweet && (
              <SweetForm
                sweet={editingSweet}
                onSubmit={(data) => updateMutation.mutate({ id: editingSweet.id, data })}
                onCancel={() => setEditingSweet(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingSweet} onOpenChange={() => setDeletingSweet(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Sweet</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingSweet?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingSweet && deleteMutation.mutate(deletingSweet.id)}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default AdminPanel;