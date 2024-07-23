import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { adminDb, adminStorage } from '../../../adminFirebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import withAuthAdmin from '../../../hoc/withAuthAdmin';

const EditPlan = () => {
    const router = useRouter();
    const { id } = router.query;
    const [plan, setPlan] = useState<any>(null);
    const [image, setImage] = useState<File | null>(null);
    const [reservedRooms, setReservedRooms] = useState<number>(0);

    useEffect(() => {
        if (id) {
            const fetchPlan = async () => {
                const docRef = doc(adminDb, 'plans', id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPlan(docSnap.data());
                } else {
                    console.log('No such document!');
                }
            };

            const fetchReservations = async () => {
                const q = query(collection(adminDb, 'reservations'), where('planId', '==', id));
                const querySnapshot = await getDocs(q);
                let totalReservedRooms = 0;
                querySnapshot.forEach(doc => {
                    totalReservedRooms += doc.data().roomCount;
                });
                setReservedRooms(totalReservedRooms);
            };

            fetchPlan();
            fetchReservations();
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let imageUrl = plan.imageUrl;
        if (image) {
            const storageRef = ref(adminStorage, `plans/${image.name}`);
            await uploadBytes(storageRef, image);
            imageUrl = await getDownloadURL(storageRef);
        }

        try {
            const docRef = doc(adminDb, 'plans', id as string);
            await updateDoc(docRef, {
                planName: plan.planName,
                hotelName: plan.hotelName,
                days: plan.days,
                startDate: plan.startDate,
                price: plan.price,
                roomCount: plan.roomCount,
                imageUrl: imageUrl,
                updatedAt: serverTimestamp(),
            });
            router.push('/admin/plans');
        } catch (error) {
            console.error('Error updating plan: ', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlan({ ...plan, [e.target.name]: e.target.value });
    };

    if (!plan) return <div>Loading...</div>;

    const remainingRooms = plan.roomCount - reservedRooms;

    return (
        <div>
            <h1>プランを編集</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        プラン名:
                        <input
                            type="text"
                            name="planName"
                            value={plan.planName}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        ホテル名:
                        <input
                            type="text"
                            name="hotelName"
                            value={plan.hotelName}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        予約日数:
                        <input
                            type="number"
                            name="days"
                            value={plan.days}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        予約初日:
                        <input
                            type="date"
                            name="startDate"
                            value={plan.startDate}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        値段:
                        <input
                            type="number"
                            name="price"
                            value={plan.price}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        登録部屋数:
                        <input
                            type="number"
                            name="roomCount"
                            value={plan.roomCount}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        写真:
                        <input
                            type="file"
                            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                        />
                    </label>
                </div>
                {plan.imageUrl && <img src={plan.imageUrl} alt={plan.planName} style={{ width: '100px', height: 'auto' }} />}
                <div>
                    <p>予約されている部屋数: {reservedRooms}</p>
                    <p>残りの部屋数: {remainingRooms}</p>
                </div>
                <button type="submit">保存</button>
            </form>
        </div>
    );
};

export default withAuthAdmin(EditPlan);
