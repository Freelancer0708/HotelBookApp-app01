import { useState } from 'react';
import { useRouter } from 'next/router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { adminDb, adminStorage } from '../../adminFirebase';
import withAuthAdmin from '../../hoc/withAuthAdmin';

const AddPlan = () => {
    const [planName, setPlanName] = useState('');
    const [hotelName, setHotelName] = useState('');
    const [days, setDays] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [price, setPrice] = useState(1000);
    const [roomCount, setRoomCount] = useState(1);
    const [image, setImage] = useState<File | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let imageUrl = '';
        if (image) {
            const storageRef = ref(adminStorage, `plans/${image.name}`);
            await uploadBytes(storageRef, image);
            imageUrl = await getDownloadURL(storageRef);
        }

        try {
            await addDoc(collection(adminDb, 'plans'), {
                planName,
                hotelName,
                days,
                startDate,
                price,
                roomCount,
                imageUrl,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            router.push('/admin/plans');
        } catch (error) {
            console.error('Error adding plan: ', error);
        }
    };

    return (
        <div>
            <h1>プランを追加</h1>
            <form onSubmit={handleSubmit} className='planform'>
                <article className='planform-inner'>
                    <div>
                        <label>
                            <p>プラン名</p>
                            <input
                                type="text"
                                value={planName}
                                onChange={(e) => setPlanName(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            <p>ホテル名</p>
                            <input
                                type="text"
                                value={hotelName}
                                onChange={(e) => setHotelName(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            <p>予約日数</p>
                            <input
                                type="number"
                                value={days}
                                onChange={(e) => setDays(Number(e.target.value))}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            <p>予約初日</p>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            <p>値段</p>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            <p>部屋数</p>
                            <input
                                type="number"
                                value={roomCount}
                                onChange={(e) => setRoomCount(Number(e.target.value))}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            <p>写真</p>
                            <input
                                type="file"
                                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                            />
                        </label>
                    </div>
                    <button type="submit">登録</button>
                </article>
            </form>
        </div>
    );
};

export default withAuthAdmin(AddPlan);
