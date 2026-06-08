export interface Vehicle {
  type: 'car' | 'bike';
  model: string;
  number: string;
  color: string;
  verified: boolean;
}

export interface Preferences {
  music: string;
  paymentMethod: string;
  notifications: string;
  language: string;
  emergencyContact: string;
  shareTripLive: boolean;
  twoFactorAuth: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  handle: string;
  city: string;
  bio: string;
  avatarColor: string;
  initials: string;
  rating: number;
  reviewsCount: number;
  ridesCount: number;
  memberSince: string;
  level: string;
  co2Saved: number;
  badges: string[];
  vehicle: Vehicle;
  preferences: Preferences;
}

export interface RideRules {
  music: boolean;
  noSmoking: boolean;
  pets: boolean;
  largeBags: boolean;
  womenOnly: boolean;
  ac: boolean;
}

export interface Ride {
  _id: string;
  driver: Partial<User>;
  type: 'car' | 'bike';
  from: string;
  to: string;
  date: string;
  depTime: string;
  arrTime: string;
  price: number;
  totalSeats: number;
  seatsAvailable: number;
  amenities: string[];
  rules: RideRules;
  vehicleModel: string;
  badge: 'car' | 'bike' | 'premium';
  featured: boolean;
  status: string;
}

export interface Booking {
  _id: string;
  ride: string | Ride;
  passenger: string;
  driver: Partial<User>;
  seats: number;
  seatFare: number;
  platformFee: number;
  gst: number;
  total: number;
  paymentMethod: string;
  status: string;
  rated: boolean;
  ratingValue?: number;
}

export interface PassengerRide {
  _id: string;
  type: 'car' | 'bike';
  from: string;
  to: string;
  date: string;
  time: string;
  status: string; // pending | accepted | rejected | active | completed | cancelled
  driver: string;
  driverPhone: string;
  seats: number;
  rated: boolean;
}

export interface RideRequest {
  _id: string;
  passengerName: string;
  passengerInitials: string;
  passengerColor: string;
  passengerRating: number;
  passengerPhone: string;
  seats: number;
  status: string;
}

export interface DriverRide {
  _id: string;
  type: 'car' | 'bike';
  from: string;
  to: string;
  date: string;
  time: string;
  status: string;
  seatsAvailable: number;
  totalSeats: number;
  requests: RideRequest[];
}

export interface Notification {
  _id: string;
  icon: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface Stats {
  carsAvailable: number;
  bikesAvailable: number;
  seatsOpen: number;
  totalAvailable: number;
}

export interface Review {
  _id: string;
  passengerName: string;
  passengerInitials: string;
  passengerColor: string;
  rating: number;
  text: string;
  route: string;
  date: string;
}
