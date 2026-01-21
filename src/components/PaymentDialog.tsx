import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Smartphone, Building2, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  title: string;
  onPaymentSuccess: () => void;
}

type PaymentMethod = 'card' | 'upi' | 'netbanking';

export function PaymentDialog({ open, onOpenChange, amount, title, onPaymentSuccess }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProcessing(false);
    setSuccess(true);
    
    // Wait a moment to show success, then close
    setTimeout(() => {
      onPaymentSuccess();
      onOpenChange(false);
      // Reset state
      setSuccess(false);
      setUpiId('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
    }, 1500);
  };

  const isFormValid = () => {
    switch (paymentMethod) {
      case 'upi':
        return upiId.includes('@');
      case 'card':
        return cardNumber.length >= 16 && cardExpiry.length >= 4 && cardCvv.length >= 3;
      case 'netbanking':
        return true;
      default:
        return false;
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-600">Payment Successful!</h3>
            <p className="text-muted-foreground mt-2">₹{amount.toLocaleString('en-IN')} paid for {title}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Bill</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Amount Display */}
          <div className="p-4 rounded-lg bg-muted text-center">
            <p className="text-sm text-muted-foreground">Amount to pay</p>
            <p className="text-3xl font-bold">₹{amount.toLocaleString('en-IN')}</p>
            <p className="text-sm text-muted-foreground mt-1">{title}</p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Select Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              className="grid grid-cols-3 gap-3"
            >
              <Label
                htmlFor="upi"
                className={cn(
                  'flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors',
                  paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                )}
              >
                <RadioGroupItem value="upi" id="upi" className="sr-only" />
                <Smartphone className="h-6 w-6" />
                <span className="text-sm font-medium">UPI</span>
              </Label>
              <Label
                htmlFor="card"
                className={cn(
                  'flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors',
                  paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                )}
              >
                <RadioGroupItem value="card" id="card" className="sr-only" />
                <CreditCard className="h-6 w-6" />
                <span className="text-sm font-medium">Card</span>
              </Label>
              <Label
                htmlFor="netbanking"
                className={cn(
                  'flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors',
                  paymentMethod === 'netbanking' ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                )}
              >
                <RadioGroupItem value="netbanking" id="netbanking" className="sr-only" />
                <Building2 className="h-6 w-6" />
                <span className="text-sm font-medium">Bank</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Payment Form */}
          {paymentMethod === 'upi' && (
            <div className="space-y-2">
              <Label htmlFor="upi-id">UPI ID</Label>
              <Input
                id="upi-id"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
              />
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card-expiry">Expiry</Label>
                  <Input
                    id="card-expiry"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="MMYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-cvv">CVV</Label>
                  <Input
                    id="card-cvv"
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'netbanking' && (
            <div className="p-4 rounded-lg bg-muted text-center text-sm text-muted-foreground">
              You will be redirected to your bank's website to complete the payment.
            </div>
          )}

          {/* Demo Notice */}
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-600">
            <strong>Demo Mode:</strong> This is a simulated payment. No actual transaction will occur.
          </div>

          {/* Pay Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handlePayment}
            disabled={processing || !isFormValid()}
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>Pay ₹{amount.toLocaleString('en-IN')}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
