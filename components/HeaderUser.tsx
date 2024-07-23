import { useEffect, useState } from 'react';
import { useAuthContextUser } from '../contexts/AuthContextUser';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { userAuth ,userDb } from '../userFirebase';

const Header = () => {
  const { user } = useAuthContextUser();
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDoc = await getDoc(doc(userDb, 'users', user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data()?.username || null);
        }
      }
    };
    fetchUsername();
  }, [user]);

  return (
    <header>
      <nav>
        <ul>
          {user ? (
            <>
              <li><Link href="/user">User</Link></li>
              <li><Link href="/user/plans">Plans</Link></li>
              <li><Link href="/user/reservations">Reservations</Link></li>
              <li className='header-right'>
                <div className=''>{username ? username : user.email}</div>
                <button onClick={() => userAuth.signOut()}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li><Link href="/user/login">Login</Link></li>
              <li><Link href="/user/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};
export default Header;