export type Hotel = {
    id: string;
    userId: string;
    hotelId: string;
    name: string;
    location: {
      country: string;
      city: string;
      address: string;
      latitude: number;
      longitude: number;
    };
    images: string[];
    facilities: string[];
  };
  
  export type Room = {
    id: string;
    roomId: string;
    hotelId: string;
    type: string;
    price: number | string; 
    currency: string;
    capacity: number;
    quantity: number;
    available: number;
    status: "Allow" | "Hidden" | "ROO";
    amenities: string[];
    date: string;
    images: string[];
  };
  
  export type Role = "admin" | "hotelOwner" | "customer";
  
  export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
    role: Role;
    status: "Active" | "Ban";
    bookingIds?: string[];
    hotelId?: string;
  };
  
  export type Review = {
    id: string;
    reviewId: string;
    hotelId: string;
    userId: string;
    rating: number;
    comment: string;
  };
  
  export type Amenities = {
    id: string;
    name: string;
  };
  
  export type Availability = {
    id: string;
    hotelId: string;
    roomId: string;
    availability: {
      startDate: string;
      endDate: string;
      roomsAvailable: number;
    }[];
  };
  
  export type Booking = {
    id: string;
    bookingId: string;
    userId: string;
    hotelId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number | string; 
    currency: string;
    status: "confirmed" | "pending" | "cancelled" | "completed";
  };
  
  export type PaymentMethod = {
    id: string;
    name: "Credit Card" | "Debit Card" | "PayPal" | "Bank Transfer" | "Apple Pay" | "Google Pay";
  };
  
  export type Promotion = {
    id: string;
    promotionId: string;
    hotelId: string;
    description: string;
    startDate: string;
    endDate: string;
    minCapacity?: number | null;
    minTotalDays?: number | null; 
    minTotalPrice?: number | null; 
    discountPercentage: number; 
  };
  
  export type Policy = {
    id: string;
    hotelId: string;
    policy: string;
  };
  