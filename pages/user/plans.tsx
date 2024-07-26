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
        <div className='user-plans'>
            <h1>プラン一覧</h1>
            <ul className='plans'>
                {plans.map(plan => {
                    const reservedRooms = reservations[plan.id] || 0;
                    const remainingRooms = plan.roomCount - reservedRooms;
                    return (
                        <li key={plan.id} style={{ marginBottom: '20px' }}>
                            <a href={`/user/plans/${plan.id}`}>
                                <h2>{plan.planName}</h2>
                                <div className='plans-row'>
                                    {plan.imageUrl && <img src={plan.imageUrl} alt={plan.planName} style={{ width: 'auto', height: 'auto', maxHeight: '200px' }} />}
                                    <div className='plans-text'>
                                        <p>{plan.hotelName}</p>
                                        <p>{formatStayPeriod(plan.startDate, plan.days)}</p>
                                        <p>料金: {plan.price}円</p>
                                        <p>空き: {remainingRooms}部屋</p>
                                    </div>
                                </div>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default withAuthUser(Plans);
