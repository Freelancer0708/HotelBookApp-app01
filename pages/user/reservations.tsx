import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { adminDb } from '../../adminFirebase';
import { useAuthContextUser } from '../../contexts/AuthContextUser';
import withAuthUser from '../../hoc/withAuthUser';
import dayjs from 'dayjs';
import { Reservation, Plan } from '../../types';

const Reservations = () => {
    const { user } = useAuthContextUser();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [plans, setPlans] = useState<{ [key: string]: Plan | undefined }>({});

    useEffect(() => {
        const fetchReservations = async () => {
            if (user && user.email) {
                const q = query(
                    collection(adminDb, 'reservations'),
                    where('email', '==', user.email),
                    orderBy('createdAt', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const reservationsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
                setReservations(reservationsList);

                // Fetch plan details for each reservation
                const planPromises = reservationsList.map(reservation => {
                    const planRef = doc(adminDb, 'plans', reservation.planId);
                    return getDoc(planRef).then(planDoc => ({ id: reservation.planId, data: planDoc.data() as Plan }));
                });

                const plansData = await Promise.all(planPromises);
                const plansMap = plansData.reduce((acc, plan) => {
                    acc[plan.id] = plan.data;
                    return acc;
                }, {} as { [key: string]: Plan });
                setPlans(plansMap);
            }
        };

        fetchReservations();
    }, [user]);

    const formatTimestamp = (timestamp) => {
        const date = timestamp.toDate();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${year}年${month}月${day}日 ${hours}時${minutes}分`;
    };

    const formatStayPeriod = (startDate: string, days: number) => {
        const start = dayjs(startDate);
        const end = start.add(days - 1, 'day');
        return `${start.format('YYYY年MM月DD日')}～${end.format('YYYY年MM月DD日')}`;
    };

    return (
        <div className='user-reservations'>
            <h1>予約履歴</h1>
            {reservations.length === 0 ? (
                <p>予約履歴がありません。</p>
            ) : (
                <ul className='plans'>
                    {reservations.map(reservation => (
                        <li key={reservation.id}>
                            {plans[reservation.planId] ? (
                                <>
                                    <a>
                                        <h2>プラン名: {plans[reservation.planId]?.planName}</h2>
                                        <div className='plans-row'>
                                        {plans[reservation.planId]?.imageUrl && <img src={plans[reservation.planId]?.imageUrl} alt={plans[reservation.planId]?.planName} style={{ width: 'auto', height: 'auto', maxHeight: '200px' }} />}
                                            <div className='plans-text'>
                                                <p>{plans[reservation.planId]?.hotelName}</p>
                                                <p>{formatStayPeriod(plans[reservation.planId]?.startDate, plans[reservation.planId]?.days)}</p>
                                                <p>料金: {plans[reservation.planId]?.price}円</p>
                                                <p>部屋数: {reservation.roomCount}部屋</p>
                                                <p>登録日: {formatTimestamp(reservation.createdAt)}</p>
                                            </div>
                                        </div>
                                    </a>
                                </>
                            ) : (
                                <p>プランID: {reservation.planId}</p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default withAuthUser(Reservations);
