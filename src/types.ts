export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'HOST' | 'RESIDENT';
  createdAt: string;
}

export interface Room {
  id: string;
  roomNumber: string; // "101", "102", etc.
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  floor: number;
  status: 'available' | 'full';
  createdAt: string;
  updatedAt: string;
}

export interface Resident {
  id: string;
  userId?: string;
  name: string;
  email: string;
  mobile: string;
  roomNumber: string;
  bedNumber: number;
  roomCode: string;
  joiningDate: string;
  rent: number;
  advance: number;
  status: 'active' | 'inactive';
  aadhaarFile?: {
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  residentId: string;
  residentName: string;
  mobile: string;
  roomNumber: string;
  rent: number;
  advance: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Pending';
  paymentDate: string;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other';
  transactionId?: string;
  receiptNumber: string;
  notes?: string;
  createdAt: string;
}

export interface GroceryExpense {
  id: string;
  date: string;
  item: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other';
  notes?: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  tiffin: string[];
  lunch: string[];
  dinner: string[];
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  residentId: string;
  residentName: string;
  roomNumber: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
}

export interface HostelInfo {
  name: string;
  address: string;
  phone: string;
  ownerContacts: string[];
  facilities: string[];
}
