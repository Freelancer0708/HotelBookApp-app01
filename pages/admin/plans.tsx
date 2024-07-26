import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { adminDb } from '../../adminFirebase';
import withAuthAdmin from '../../hoc/withAuthAdmin';

const AdminPlans = () => {
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

    return (
        <div className='admin-plans'>
            <h1>プラン一覧</h1>
            <ul className='plans'>
                {plans.map(plan => {
                    const reservedRooms = reservations[plan.id] || 0;
                    const remainingRooms = plan.roomCount - reservedRooms;
                    return (
                        <li key={plan.id}>
                            <a href={`/admin/plans/${plan.id}`}>
                                <h2>{plan.planName}</h2>
                                <div className='plans-row'>
                                    {plan.imageUrl && <img src={plan.imageUrl} alt={plan.planName} style={{ width: 'auto', height: 'auto', maxHeight: '200px' }} />}
                                    <div className='plans-text'>
                                        <p>ホテル名: {plan.hotelName}</p>
                                        <p>期間: {plan.days}日間</p>
                                        <p>初日: {plan.startDate}</p>
                                        <p>料金: {plan.price}円</p>
                                        <p>空き: {remainingRooms}部屋</p>
                                        <small>※{plan.roomCount}部屋中 {reservedRooms}部屋予約済</small>
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

export default withAuthAdmin(AdminPlans);
