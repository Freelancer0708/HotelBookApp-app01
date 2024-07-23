import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { addDoc, collection, doc, getDoc, query, getDocs, where, serverTimestamp } from 'firebase/firestore';
import { adminDb } from '../../../../adminFirebase';
import { useAuthContextUser } from '../../../../contexts/AuthContextUser';
import withAuthUser from '../../../../hoc/withAuthUser';

const ReservePlan = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuthContextUser();
    const [roomCount, setRoomCount] = useState(1);
    const [availableRooms, setAvailableRooms] = useState<number | null>(null);
    const [plan, setPlan] = useState<any>(null);
    const [totalPrice, setTotalPrice] = useState<number>(0);

    useEffect(() => {
        const fetchPlan = async () => {
            if (id) {
                const planRef = doc(adminDb, 'plans', id as string);
                const planDoc = await getDoc(planRef);
                if (planDoc.exists()) {
                    const planData = planDoc.data();
                    setPlan(planData);

                    const q = query(collection(adminDb, 'reservations'), where('planId', '==', id));
                    const querySnapshot = await getDocs(q);
                    let totalReservedRooms = 0;
                    querySnapshot.forEach(doc => {
                        totalReservedRooms += doc.data().roomCount;
                    });

                    setAvailableRooms(planData.roomCount - totalReservedRooms);
                    setTotalPrice(planData.price);
                }
            }
        };

        fetchPlan();
    }, [id]);

    const handleRoomCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const count = Math.max(0, Number(e.target.value));
        setRoomCount(count);
        if (plan) {
            setTotalPrice(plan.price * count);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (availableRooms !== null && roomCount > availableRooms) {
            alert('申し訳ありませんが、部屋数が不足しています。');
            return;
        }

        try {
            await addDoc(collection(adminDb, 'reservations'), {
                planId: id,
                email: user?.email,
                roomCount,
                totalPrice,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            router.push(`/user/plans/${id}/complete`);
        } catch (error) {
            console.error('Error adding reservation: ', error);
        }
    };

    return (
        <div>
            <h1>予約入力画面</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        部屋数:
                        <input
                            type="number"
                            value={roomCount}
                            onChange={handleRoomCountChange}
                            required
                        />
                    </label>
                </div>
                <p>総額: {totalPrice} 円</p>
                <button type="submit">予約する</button>
            </form>
        </div>
    );
};

export default withAuthUser(ReservePlan);
