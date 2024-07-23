import { Timestamp } from "@firebase/firestore";

export interface Reservation {
    id: string;
    planId: string;
    email: string;
    roomCount: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Plan {
    planName: string;
    hotelName: string;
    imageUrl: string;
    days: number;
    startDate: string;
    price: number;
    roomCount: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
