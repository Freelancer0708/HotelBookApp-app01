import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { adminDb } from '../../adminFirebase';
import dayjs from 'dayjs';
import withAuthUser from '../../hoc/withAuthUser';

const Plans = () => {
    const [plans, setPlans] = useState<any[]>([]);
    const [reservations, setReservations] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        const fetchPlans = async () => {
            const querySnapshot = await getDocs(collection(adminDb, 'plans'));
            const plansList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPlans(plansList);
        };

        const fetchReservations = async () => {
            const reservationsSnapshot = await getDocs(collection(adminDb, 'reservations'));
            const reservationCount: { [key: string]: number } = {};

            reservationsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                if (reservationCount[data.planId]) {
                    reservationCount[data.planId] += data.roomCount;
                } else {
                    reservationCount[data.planId] = data.roomCount;
                }
            });

            setReservations(reservationCount);
        };

        fetchPlans();
        fetchReservations();
    }, []);

    const formatStayPeriod = (startDate: string, days: number) => {
        const start = dayjs(startDate);
        const end = start.add(days - 1, 'day');
        return `${start.format('YYYY年MM月DD日')}～${end.format('YYYY年MM月DD日')}`;
    };

    return (
        <div>
            <h1>プラン一覧</h1>
            <ul>
                {plans.map(plan => {
                    const reservedRooms = reservations[plan.id] || 0;
                    const remainingRooms = plan.roomCount - reservedRooms;
                    return (
                        <li key={plan.id} style={{ marginBottom: '20px' }}>
                            {plan.imageUrl && <img src={plan.imageUrl} alt={plan.planName} style={{ width: 'auto', height: 'auto', maxHeight: '200px' }} />}
                            <h2>{plan.planName}</h2>
                            <p>ホテル名: {plan.hotelName}</p>
                            <p>宿泊期間: {formatStayPeriod(plan.startDate, plan.days)}</p>
                            <p>値段: {plan.price}</p>
                            <p>残りの部屋数: {remainingRooms}</p>
                            <a href={`/user/plans/${plan.id}`}>詳細を見る</a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default withAuthUser(Plans);
