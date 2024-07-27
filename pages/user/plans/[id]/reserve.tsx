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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        setErrorMessage(null); // エラーメッセージをリセット

        if (availableRooms !== null && roomCount > availableRooms) {
            setErrorMessage('部屋数を減らしてください。');
            return;
        }
        if (roomCount <= 0) {
            setErrorMessage('1部屋以上にしてください。');
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
            setErrorMessage('予約の追加中にエラーが発生しました。');
        }
    };

    return (
        <div className='user-reserve'>
            <h2>予約入力画面</h2>
            <form onSubmit={handleSubmit} className='detail-item'>
                <div><span>現在空いている部屋数: </span>{availableRooms}部屋</div>
                <div>
                    <span>予約する部屋数: </span>
                    <span>
                    <label>
                        <input
                            type="number"
                            value={roomCount}
                            onChange={handleRoomCountChange}
                            required
                        />
                    </label>
                    部屋
                    </span>
                </div>
                {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                <div><span>総額: </span>{totalPrice}円</div>
                <button type="submit">予約する</button>
            </form>
        </div>
    );
};

export default withAuthUser(ReservePlan);
