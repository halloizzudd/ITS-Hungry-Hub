export enum OrderStatus {
    WAITING_CONFIRMATION = 'WAITING_CONFIRMATION',
    PROCESSING = 'PROCESSING',
    READY = 'READY',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    UNPAID = 'UNPAID', // Optional if used
}

export enum OrderType {
    DINE_IN = 'DINE_IN',
    TAKE_AWAY = 'TAKE_AWAY',
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    images?: { url: string }[];
    prepTime: number;
}

export interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    product: Product;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface SellerProfile {
    id: number;
    stallName: string;
}

export interface Order {
    id: number;
    totalAmount: number;
    status: OrderStatus | string;
    orderType: OrderType | string;
    paymentProofUrl?: string;
    estimatedReadyAt?: string;
    orderItems: OrderItem[];
    user?: User; // Present when fetching as Seller
    seller?: SellerProfile; // Present when fetching as Consumer
    createdAt?: string; // If available in backend
}
