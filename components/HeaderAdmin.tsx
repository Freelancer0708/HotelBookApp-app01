import { useEffect, useState } from 'react';
import { useAuthContextAdmin } from '../contexts/AuthContextAdmin';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { adminAuth ,adminDb } from '../adminFirebase';

const Header = () => {
  const { user } = useAuthContextAdmin();
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDoc = await getDoc(doc(adminDb, 'users', user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data()?.username || null);
        }
      }
    };
    fetchUsername();
  }, [user]);

  return (
    <header className='header-admin'>
      <nav>
        <ul>
          {user ? (
            <>
              <li><Link href="/admin">Admin</Link></li>
              <li><Link href="/admin/add-plan">Add Plan</Link></li>
              <li><Link href="/admin/plans">Plans</Link></li>
              <li className='header-right'>
                <div className=''>{username ? username : user.email}</div>
                <button onClick={() => adminAuth.signOut()}>Logout</button>
              </li>
            </>
          ) : (
            <>
              
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};
export default Header;