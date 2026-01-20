import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Building, Calendar, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface Facility {
  id: string;
  name: string;
  description: string | null;
  society_id: string;
}

interface Booking {
  id: string;
  facility_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
}

interface FacilitiesProps {
  isSecretary: boolean;
  societyId: string;
}

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

export function Facilities({ isSecretary, societyId }: FacilitiesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [newFacility, setNewFacility] = useState({ name: '', description: '' });
  const [bookingForm, setBookingForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00'
  });

  const fetchFacilities = async () => {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('society_id', societyId)
      .order('name');

    if (error) {
      toast({ title: 'Error fetching facilities', description: error.message, variant: 'destructive' });
    } else {
      setFacilities(data || []);
    }
  };

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('facility_bookings')
      .select('*')
      .eq('society_id', societyId)
      .gte('booking_date', format(new Date(), 'yyyy-MM-dd'));

    if (error) {
      toast({ title: 'Error fetching bookings', description: error.message, variant: 'destructive' });
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFacilities();
    fetchBookings();
  }, [societyId]);

  const handleAddFacility = async () => {
    if (!newFacility.name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('facilities').insert({
      name: newFacility.name,
      description: newFacility.description || null,
      society_id: societyId
    });

    if (error) {
      toast({ title: 'Error adding facility', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Facility added successfully' });
      setNewFacility({ name: '', description: '' });
      setIsAddDialogOpen(false);
      fetchFacilities();
    }
  };

  const handleBook = async () => {
    if (!selectedFacility || !user) return;

    // Check for existing bookings
    const existingBooking = bookings.find(
      b => b.facility_id === selectedFacility.id &&
        b.booking_date === bookingForm.date &&
        b.start_time === bookingForm.startTime
    );

    if (existingBooking) {
      toast({ title: 'Time slot already booked', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('facility_bookings').insert({
      facility_id: selectedFacility.id,
      user_id: user.id,
      society_id: societyId,
      booking_date: bookingForm.date,
      start_time: bookingForm.startTime,
      end_time: bookingForm.endTime
    });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Time slot already booked', variant: 'destructive' });
      } else {
        toast({ title: 'Error booking facility', description: error.message, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Facility booked successfully' });
      setIsBookDialogOpen(false);
      fetchBookings();
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('facility_bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      toast({ title: 'Error cancelling booking', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Booking cancelled' });
      fetchBookings();
    }
  };

  const getBookingsForFacility = (facilityId: string, date: string) => {
    return bookings.filter(b => b.facility_id === facilityId && b.booking_date === date);
  };

  const isSlotBooked = (facilityId: string, date: string, time: string) => {
    return bookings.some(
      b => b.facility_id === facilityId && b.booking_date === date && b.start_time === time
    );
  };

  const myBookings = bookings.filter(b => b.user_id === user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Facilities</h2>
          <p className="text-muted-foreground">
            {isSecretary ? 'Manage society facilities' : 'Book society amenities'}
          </p>
        </div>
        {isSecretary && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Facility
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Facility</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="e.g., Clubhouse, Swimming Pool"
                    value={newFacility.name}
                    onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Brief description of the facility..."
                    value={newFacility.description}
                    onChange={(e) => setNewFacility({ ...newFacility, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddFacility} className="w-full">
                  Add Facility
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Facilities List */}
      {facilities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No facilities added yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {facilities.map((facility, index) => (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    {facility.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {facility.description && (
                    <p className="text-sm text-muted-foreground">{facility.description}</p>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedFacility(facility);
                      setIsBookDialogOpen(true);
                    }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* My Bookings */}
      {myBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">My Bookings</h3>
          <div className="space-y-2">
            {myBookings.map((booking) => {
              const facility = facilities.find(f => f.id === booking.facility_id);
              return (
                <Card key={booking.id}>
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{facility?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.booking_date), 'MMM d, yyyy')} • {booking.start_time} - {booking.end_time}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book {selectedFacility?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={bookingForm.date}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <Select
                  value={bookingForm.startTime}
                  onValueChange={(value) => {
                    const endIndex = TIME_SLOTS.indexOf(value) + 1;
                    setBookingForm({
                      ...bookingForm,
                      startTime: value,
                      endTime: TIME_SLOTS[endIndex] || TIME_SLOTS[TIME_SLOTS.length - 1]
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.slice(0, -1).map((time) => {
                      const booked = selectedFacility && isSlotBooked(selectedFacility.id, bookingForm.date, time);
                      return (
                        <SelectItem key={time} value={time} disabled={booked}>
                          {time} {booked && '(Booked)'}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <Select
                  value={bookingForm.endTime}
                  onValueChange={(value) => setBookingForm({ ...bookingForm, endTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.slice(TIME_SLOTS.indexOf(bookingForm.startTime) + 1).map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Show booked slots for selected date */}
            {selectedFacility && (
              <div>
                <label className="text-sm font-medium mb-2 block">Availability on {format(new Date(bookingForm.date), 'MMM d')}</label>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.slice(0, -1).map((time) => {
                    const booked = isSlotBooked(selectedFacility.id, bookingForm.date, time);
                    return (
                      <Badge
                        key={time}
                        variant={booked ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {time}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            <Button onClick={handleBook} className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}