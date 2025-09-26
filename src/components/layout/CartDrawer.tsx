import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingCart, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sweetsAPI } from '@/lib/api';
import { formatINR } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CartDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onOpenChange, onCheckout }) => {
    const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
    const { isAuthenticated, isAdmin } = useAuth();
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

    const checkoutMutation = useMutation({
        mutationFn: async () => {
            // Only authenticated users (non-admin) can purchase
            if (!isAuthenticated || isAdmin) {
                throw new Error('Only logged-in users can purchase items');
            }
            // Execute sequentially for simplicity
            for (const item of items) {
                await sweetsAPI.purchase(item.sweet.id, item.quantity);
            }
        },
        onSuccess: async () => {
            setOrderSuccess(true);
            clearCart();
            await queryClient.invalidateQueries({ queryKey: ['sweets'] });
            // Keep dialog open to show success; drawer will be closed when user confirms
            toast({
                title: 'Order placed!',
                description: 'Your sweets are on the way',
                className: 'bg-success text-success-foreground',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Checkout failed',
                description: error?.response?.data?.message || error?.message || 'Please try again',
                variant: 'destructive',
            });
        },
    });

    const handleSubmitCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        // Minimal validation
        if (!fullName.trim() || !address.trim() || !city.trim() || !zip.trim()) {
            toast({ title: 'Missing details', description: 'Please fill in delivery address details', variant: 'destructive' });
            return;
        }
        if (!cardName.trim() || cardNumber.replace(/\s+/g, '').length < 12 || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) || cvv.length < 3) {
            toast({ title: 'Invalid payment info', description: 'Please check your card details', variant: 'destructive' });
            return;
        }
        checkoutMutation.mutate();
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" /> Your Cart ({totalItems})
                    </SheetTitle>
                </SheetHeader>

                <div className="mt-6 flex flex-col gap-4">
                    {items.length === 0 ? (
                        <div className="text-sm text-muted-foreground">Your cart is empty.</div>
                    ) : (
                        items.map(({ sweet, quantity }) => (
                            <div key={sweet.id} className="flex items-center gap-3">
                                <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                    {sweet.imageUrl ? (
                                        <img src={sweet.imageUrl} alt={sweet.name} className="h-full w-full object-cover" />
                                    ) : null}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{sweet.name}</div>
                                    <div className="text-sm text-muted-foreground">{formatINR(sweet.price)}</div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Button size="icon" variant="outline" onClick={() => updateQuantity(sweet.id, quantity - 1)}>
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <div className="w-8 text-center">{quantity}</div>
                                        <Button size="icon" variant="outline" onClick={() => updateQuantity(sweet.id, quantity + 1)}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="outline" className="ml-2" onClick={() => removeItem(sweet.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="font-semibold">{formatINR(sweet.price * quantity)}</div>
                            </div>
                        ))
                    )}
                </div>
                <Separator className="my-4" />
                <SheetFooter className="mt-6">
                    <div className="w-full">
                        <div className="flex items-center justify-between text-sm mb-3">
                            <span>Total</span>
                            <span className="font-semibold">{formatINR(totalPrice)}</span>
                        </div>
                        <Button className="w-full bg-gradient-primary" disabled={items.length === 0 || checkoutMutation.isPending} onClick={() => setIsCheckoutOpen(true)}>
                            Checkout
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>

            {/* Checkout Modal */}
            <Dialog open={isCheckoutOpen} onOpenChange={(o) => { setIsCheckoutOpen(o); if (!o) setOrderSuccess(false); }}>
                <DialogContent className="sm:max-w-lg">
                    {!orderSuccess ? (
                        <form onSubmit={handleSubmitCheckout} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle>Checkout</DialogTitle>
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
                                <div className="text-sm text-muted-foreground">Total: <span className="font-semibold">{formatINR(totalPrice)}</span></div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCheckoutOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-gradient-primary" disabled={checkoutMutation.isPending}>
                                        {checkoutMutation.isPending ? 'Placing order...' : 'Pay & Place Order'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-6">
                            <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                            <h3 className="text-xl font-semibold mb-1">Order placed successfully</h3>
                            <p className="text-sm text-muted-foreground mb-6">Thank you! Your sweets are on the way.</p>
                            <Button
                                onClick={() => { setIsCheckoutOpen(false); onOpenChange(false); window.location.reload(); }}
                                className="bg-gradient-primary"
                            >
                                OK
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Sheet>
    );
};

export default CartDrawer;


