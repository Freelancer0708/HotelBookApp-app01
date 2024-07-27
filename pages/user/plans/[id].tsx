import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { adminDb } from '../../../adminFirebase';
import dayjs from 'dayjs';
import withAuthUser from '../../../hoc/withAuthUser';

const PlanDetail = () => {
    const router = useRouter();
    const { id } = router.query;
    const [plan, setPlan] = useState<any>(null);
    const [reservedRooms, setReservedRooms] = useState<number | null>(null);
    const [availableRooms, setAvailableRooms] = useState<number | null>(null);

    useEffect(() => {
        const fetchPlanAndReservations = async () => {
            if (id) {
                const docRef = doc(adminDb, 'plans', id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const planData = docSnap.data();
                    setPlan(planData);

                    const q = query(collection(adminDb, 'reservations'), where('planId', '==', id));
                    const querySnapshot = await getDocs(q);
                    let totalReservedRooms = 0;
                    querySnapshot.forEach(doc => {
                        totalReservedRooms += doc.data().roomCount;
                    });

                    setReservedRooms(totalReservedRooms);
                    setAvailableRooms(planData.roomCount - totalReservedRooms);
                } else {
                    console.log('No such document!');
                }
            }
        };

        fetchPlanAndReservations();
    }, [id]);

    const formatStayPeriod = (startDate: string, days: number) => {
        const start = dayjs(startDate);
        const end = start.add(days - 1, 'day');
        return `${start.format('YYYY年MM月DD日')}～${end.format('YYYY年MM月DD日')}`;
    };

    if (!plan) return <div>Loading...</div>;

    return (
        <div className='user-detail'>
            <h2>{plan.planName}</h2>
            <div className='detail-row'>
                {plan.imageUrl && <img src={plan.imageUrl} alt={plan.planName} style={{ width: 'auto', height: 'auto', maxHeight: '200px' }} />}
                <div className='detail-item'>
                    <p>ホテル名: {plan.hotelName}</p>
                    <p>宿泊期間: {formatStayPeriod(plan.startDate, plan.days)}</p>
                    <p>値段: {plan.price}</p>
                    <p>残りの部屋数: {availableRooms !== null ? availableRooms : 'Loading...'}</p>
                    {availableRooms !== null && availableRooms > 0 ? (
                        <a href={`/user/plans/${id}/reserve`}>予約する</a>
                    ) : (
                        <p>予約できる部屋がありません。</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default withAuthUser(PlanDetail);
