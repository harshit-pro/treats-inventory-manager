import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Sweet, sweetsAPI } from '@/lib/api';
import { Package, Edit, Trash2 } from 'lucide-react';
import { resolveImageUrl } from '@/lib/cloudinary';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '@/lib/utils';

interface SweetCardProps {
  sweet: Sweet;
  onEdit?: (sweet: Sweet) => void;
  onDelete?: (sweet: Sweet) => void;
}

const SweetCard: React.FC<SweetCardProps> = ({ sweet, onEdit, onDelete }) => {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Checkout form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

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
      setOrderSuccess(true);
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

  const handleBuyNowClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !address.trim() || !city.trim() || !zip.trim()) {
      toast({ title: 'Missing details', description: 'Please fill in delivery address details', variant: 'destructive' });
      return;
    }
    if (!cardName.trim() || cardNumber.replace(/\s+/g, '').length < 12 || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) || cvv.length < 3) {
      toast({ title: 'Invalid payment info', description: 'Please check your card details', variant: 'destructive' });
      return;
    }
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
              src={resolveImageUrl(sweet.imageUrl, 600, 600) || sweet.imageUrl}
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
              <span className="text-lg font-bold text-primary">{formatINR(sweet.price)}</span>
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
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {/* Buy Now Button for users */}
        {!isAdmin && (
          <Button
            onClick={handleBuyNowClick}
            disabled={isOutOfStock}
            className="flex-1 bg-gradient-primary hover:opacity-90 disabled:opacity-50"
          >
            {isOutOfStock ? 'Out of Stock' : (isAuthenticated ? 'Buy Now' : 'Login to Buy')}
          </Button>
        )}
        {/* Admin Actions (only show when respective handlers are provided) */}
        {isAdmin && (
          <>
            {onEdit && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(sweet)}
                className="hover:bg-accent"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete(sweet)}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </CardFooter>
      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={(o) => { setIsCheckoutOpen(o); if (!o) setOrderSuccess(false); }}>
        <DialogContent className="sm:max-w-lg">
          {!orderSuccess ? (
            <form onSubmit={handleSubmitCheckout} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Checkout - {sweet.name}</DialogTitle>
                <DialogDescription>Enter delivery address and payment details to place your order.</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} required rows={3} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP/Postal Code</Label>
                    <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input id="cardName" value={cardName} onChange={(e) => setCardName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" inputMode="numeric" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                    <Input id="expiry" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" inputMode="numeric" value={cvv} onChange={(e) => setCvv(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Total: <span className="font-semibold">{formatINR(sweet.price)}</span></div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCheckoutOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-gradient-primary" disabled={isPurchasing}>
                    {isPurchasing ? 'Placing order...' : 'Pay & Place Order'}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
              <h3 className="text-xl font-semibold mb-1">Order placed successfully</h3>
              <p className="text-sm text-muted-foreground mb-6">Thank you! Your sweet is on the way.</p>
              <Button
                onClick={() => { setIsCheckoutOpen(false); window.location.reload(); }}
                className="bg-gradient-primary"
              >
                OK
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
export default SweetCard;