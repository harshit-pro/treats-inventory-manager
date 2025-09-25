import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Sweet, sweetsAPI } from '@/lib/api';
import { ShoppingCart, Package, Edit, Trash2 } from 'lucide-react';

interface SweetCardProps {
  sweet: Sweet;
  onEdit?: (sweet: Sweet) => void;
  onDelete?: (sweet: Sweet) => void;
}

const SweetCard: React.FC<SweetCardProps> = ({ sweet, onEdit, onDelete }) => {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const purchaseMutation = useMutation({
    mutationFn: () => sweetsAPI.purchase(sweet.id),
    onSuccess: () => {
      toast({
        title: "Purchase successful!",
        description: `${sweet.name} has been added to your order`,
        className: "bg-success text-success-foreground",
      });
      queryClient.invalidateQueries({ queryKey: ['sweets'] });
      setIsPurchasing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error.response?.data?.message || "Unable to complete purchase",
        variant: "destructive",
      });
      setIsPurchasing(false);
    },
  });

  const handlePurchase = () => {
    if (sweet.quantity <= 0) return;
    setIsPurchasing(true);
    purchaseMutation.mutate();
  };

  const isOutOfStock = sweet.quantity <= 0;
  const isLowStock = sweet.quantity <= 5 && sweet.quantity > 0;

  return (
    <Card className="card-hover shadow-card bg-gradient-card overflow-hidden group">
      <CardContent className="p-0">
        <div className="aspect-square bg-gradient-hero relative overflow-hidden">
          {sweet.imageUrl ? (
            <img 
              src={sweet.imageUrl} 
              alt={sweet.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
              <Package className="h-16 w-16 text-white opacity-60" />
            </div>
          )}
          
          {/* Stock Status Badge */}
          <div className="absolute top-3 right-3">
            {isOutOfStock ? (
              <Badge variant="destructive" className="font-medium">
                Out of Stock
              </Badge>
            ) : isLowStock ? (
              <Badge className="bg-warning text-warning-foreground font-medium">
                Low Stock
              </Badge>
            ) : (
              <Badge className="bg-success text-success-foreground font-medium">
                In Stock
              </Badge>
            )}
          </div>

          {/* Price Tag */}
          <div className="absolute top-3 left-3">
            <div className="bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-lg font-bold text-primary">${sweet.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-card-foreground line-clamp-1">
              {sweet.name}
            </h3>
            <Badge variant="secondary" className="ml-2 text-xs">
              {sweet.category}
            </Badge>
          </div>
          
          {sweet.description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {sweet.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Quantity: {sweet.quantity}</span>
            <span className="text-xs">ID: {sweet.id.slice(-6)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          disabled={isOutOfStock || isPurchasing || purchaseMutation.isPending}
          className="flex-1 bg-gradient-primary hover:opacity-90 disabled:opacity-50"
        >
          {isPurchasing || purchaseMutation.isPending ? (
            <div className="animate-shimmer">Processing...</div>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Buy Now
            </>
          )}
        </Button>

        {/* Admin Actions */}
        {isAdmin && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit?.(sweet)}
              className="hover:bg-accent"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete?.(sweet)}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default SweetCard;