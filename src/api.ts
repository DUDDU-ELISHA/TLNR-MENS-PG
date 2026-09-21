import { Room, Resident, Payment, GroceryExpense, MenuItem, User, HostelInfo } from './types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('tlnr_auth_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('tlnr_auth_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('tlnr_auth_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network response was not ok' }));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

// Hostel Info
export async function getHostelInfo(): Promise<HostelInfo> {
  return request<HostelInfo>('/hostel-info');
}

// Public Rooms for registration & home page
export async function getPublicRooms(): Promise<Array<{
  roomNumber: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  status: 'available' | 'full';
  floor: number;
}>> {
  return request('/public/rooms');
}

// Real OTP Services
export async function sendOtp(mobile: string, purpose?: string): Promise<{ success: boolean; message: string; debugOtp?: string }> {
  return request('/otp/send', {
    method: 'POST',
    body: JSON.stringify({ mobile, purpose })
  });
}

export async function verifyOtp(mobile: string, otp: string): Promise<{ success: boolean; message: string }> {
  return request('/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ mobile, otp })
  });
}

// Auth API
export async function hostLogin(email: string, password: string): Promise<{ token: string; user: User }> {
  const data = await request<{ token: string; user: User }>('/auth/host-login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setAuthToken(data.token);
  return data;
}

export async function hostResetPassword(email: string, newPassword: string, otp?: string): Promise<{ success: boolean; message: string }> {
  return request('/auth/host-reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword, otp })
  });
}

export async function residentRegister(formData: {
  name: string;
  email: string;
  mobile: string;
  roomNumber: string;
  roomCode: string;
  joiningDate: string;
  password: string;
  aadhaarDataUrl?: string;
  aadhaarFileName?: string;
}): Promise<{ success: boolean; message: string }> {
  return request('/auth/resident-register', {
    method: 'POST',
    body: JSON.stringify(formData)
  });
}

export async function residentLogin(credentials: {
  email: string;
  roomCode: string;
  mobile: string;
  password: string;
}): Promise<{ token: string; user: any }> {
  const data = await request<{ token: string; user: any }>('/auth/resident-login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  setAuthToken(data.token);
  return data;
}

export async function residentResetPassword(payload: {
  email: string;
  mobile: string;
  newPassword: string;
  otp?: string;
}): Promise<{ success: boolean; message: string }> {
  return request('/auth/resident-reset-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getCurrentUser(): Promise<any> {
  const token = getAuthToken();
  if (!token) {
    return null;
  }
  try {
    return await request('/auth/me');
  } catch {
    removeAuthToken();
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await request('/auth/logout', { method: 'POST' });
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    removeAuthToken();
  }
}

export const logoutUser = logout;

// Resident Endpoints
export async function getResidentDetails(): Promise<{
  profile: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    roomNumber: string;
    roomCode: string;
    joiningDate: string;
    bedNumber: number;
    status: string;
    aadhaarFile?: any;
  };
  room: {
    roomNumber: string;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    residentBed: number;
  };
  payment: {
    rent: number;
    advance: number;
    totalAmount: number;
    amountPaid: number;
    balance: number;
    paymentStatus: string;
    paymentDate: string;
    paymentMode: string;
    history: Payment[];
  };
}> {
  return request('/resident/my-details');
}

export async function uploadResidentAadhaar(aadhaarDataUrl: string, fileName: string): Promise<{ success: boolean; message: string; file: any }> {
  return request('/resident/upload-aadhaar', {
    method: 'POST',
    body: JSON.stringify({ aadhaarDataUrl, fileName })
  });
}

// Menu (Both Resident and Host)
export async function getMenu(): Promise<MenuItem[]> {
  return request<MenuItem[]>('/menu');
}

// Host Specific Endpoints
export async function getHostOverview(): Promise<{
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  totalResidents: number;
  totalCollection: number;
  paidPaymentsCount: number;
  pendingPaymentsCount: number;
  totalGroceryExpenses: number;
  floorStats: Record<number, { totalBeds: number; occupiedBeds: number }>;
}> {
  return request('/host/overview');
}

export async function getHostResidents(): Promise<Array<Resident & { balance: number; paymentStatus: string }>> {
  return request('/host/residents');
}

export async function addHostResident(data: any): Promise<{ success: boolean; message: string; resident: Resident }> {
  return request('/host/residents', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function editHostResident(id: string, data: any): Promise<{ success: boolean; message: string; resident: Resident }> {
  return request(`/host/residents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteHostResident(id: string): Promise<{ success: boolean; message: string }> {
  return request(`/host/residents/${id}`, {
    method: 'DELETE'
  });
}

export async function getHostRooms(): Promise<Array<Room & { residents: Array<{ id: string; name: string; bedNumber: number; mobile: string; joiningDate: string }> }>> {
  return request('/host/rooms');
}

export async function editHostRoomCapacity(roomNumber: string, totalBeds: number): Promise<{ success: boolean; message: string; room: Room }> {
  return request(`/host/rooms/${roomNumber}`, {
    method: 'PUT',
    body: JSON.stringify({ totalBeds })
  });
}

export async function getHostPayments(): Promise<Payment[]> {
  return request<Payment[]>('/host/payments');
}

export async function addHostPayment(data: any): Promise<{ success: boolean; message: string; payment: Payment }> {
  return request('/host/payments', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function editHostPayment(id: string, data: any): Promise<{ success: boolean; message: string; payment: Payment }> {
  return request(`/host/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteHostPayment(id: string): Promise<{ success: boolean; message: string }> {
  return request(`/host/payments/${id}`, {
    method: 'DELETE'
  });
}

export async function getHostGrocery(): Promise<{ items: GroceryExpense[]; totalExpense: number }> {
  return request('/host/grocery');
}

export async function addHostGrocery(data: any): Promise<{ success: boolean; message: string; item: GroceryExpense }> {
  return request('/host/grocery', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function editHostGrocery(id: string, data: any): Promise<{ success: boolean; message: string; item: GroceryExpense }> {
  return request(`/host/grocery/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteHostGrocery(id: string): Promise<{ success: boolean; message: string }> {
  return request(`/host/grocery/${id}`, {
    method: 'DELETE'
  });
}

export async function editHostMenuDay(day: string, data: { tiffin: string[]; lunch: string[]; dinner: string[] }): Promise<{ success: boolean; message: string; item: MenuItem }> {
  return request(`/host/menu/${day}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function getHostMonthlyReport(month?: string, year?: string): Promise<{
  period: { month: string; year: string };
  residentPayments: {
    totalResidents: number;
    totalPaymentsReceived: number;
    paidAmount: number;
    pendingAmount: number;
    balanceAmount: number;
    transactions: Payment[];
  };
  grocery: {
    totalGroceryExpenses: number;
    transactionCount: number;
    items: GroceryExpense[];
  };
  otherExpenses: number;
  overallSummary: {
    totalResidentPayments: number;
    totalExpenses: number;
    groceryExpenses: number;
    otherExpenses: number;
    netAmount: number;
  };
}> {
  const query = new URLSearchParams();
  if (month) query.set('month', month);
  if (year) query.set('year', year);
  return request(`/host/monthly-report?${query.toString()}`);
}

export async function getHostDocuments(): Promise<Array<{
  residentId: string;
  residentName: string;
  roomNumber: string;
  mobile: string;
  file: {
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  };
}>> {
  return request('/host/documents');
}

export const updateRoomCapacity = editHostRoomCapacity;
export const addGroceryItem = addHostGrocery;
export const editGroceryItem = editHostGrocery;
export const deleteGroceryItem = deleteHostGrocery;

export async function updateMenu(menu: MenuItem[]): Promise<{ success: boolean; message: string }> {
  for (const item of menu) {
    await editHostMenuDay(item.day, {
      tiffin: item.tiffin,
      lunch: item.lunch,
      dinner: item.dinner
    });
  }
  return { success: true, message: 'Menu updated successfully' };
}

export async function getMonthlyReport(month: number, year: number): Promise<any> {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const mStr = String(month).padStart(2, '0');
  const yStr = String(year);
  const data = await getHostMonthlyReport(mStr, yStr);

  return {
    month,
    year,
    monthName: monthNames[month - 1] || 'Month',
    totalRooms: 37,
    totalBeds: 148,
    occupiedBeds: data.residentPayments?.totalResidents || 0,
    availableBeds: Math.max(0, 148 - (data.residentPayments?.totalResidents || 0)),
    totalResidents: data.residentPayments?.totalResidents || 0,
    totalCollections: data.residentPayments?.paidAmount || 0,
    totalGroceryExpenses: data.grocery?.totalGroceryExpenses || 0,
    paymentsList: data.residentPayments?.transactions || [],
    groceryList: data.grocery?.items || []
  };
}

export async function getHostStats(): Promise<{
  stats: any;
  residents: any[];
  rooms: any[];
  payments: any[];
  grocery: any[];
  menu: any[];
}> {
  const [stats, residents, rooms, payments, groceryData, menu] = await Promise.all([
    getHostOverview(),
    getHostResidents(),
    getHostRooms(),
    getHostPayments(),
    getHostGrocery(),
    getMenu()
  ]);

  return {
    stats,
    residents,
    rooms,
    payments,
    grocery: groceryData.items || [],
    menu
  };
}

// SSE Realtime Subscription for automatic multi-device synchronization
export function subscribeToRealtimeUpdates(onUpdate: (data: any) => void): () => void {
  let eventSource: EventSource | null = null;
  try {
    eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onUpdate(parsed);
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };
    eventSource.onerror = () => {
      // Reconnect silently handled by browser EventSource
    };
  } catch (err) {
    console.error('SSE initialization error:', err);
  }

  return () => {
    if (eventSource) {
      eventSource.close();
    }
  };
}
