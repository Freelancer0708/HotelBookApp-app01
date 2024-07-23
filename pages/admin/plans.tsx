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
        <div>
            <h1>プラン一覧</h1>
            <ul>
                {plans.map(plan => {
                    const reservedRooms = reservations[plan.id] || 0;
                    const remainingRooms = plan.roomCount - reservedRooms;
                    return (
                        <li key={plan.id} style={{ marginBottom: '20px' }}>
                            <h2>{plan.planName}</h2>
                            {plan.imageUrl && <img src={plan.imageUrl} alt={plan.planName} style={{ width: 'auto', height: 'auto', maxHeight: '200px' }} />}
                            <p>ホテル名: {plan.hotelName}</p>
                            <p>予約日数: {plan.days}</p>
                            <p>予約初日: {plan.startDate}</p>
                            <p>値段: {plan.price}</p>
                            <p>登録部屋数: {plan.roomCount}</p>
                            <p>予約されている部屋数: {reservedRooms}</p>
                            <p>残りの部屋数: {remainingRooms}</p>
                            <a href={`/admin/plans/${plan.id}`}>詳細を見る</a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default withAuthAdmin(AdminPlans);
