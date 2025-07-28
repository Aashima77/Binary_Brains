
'use client';

import { useEffect, useState } from "react";

interface User {
  name: string;
  email: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/user');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          const { message } = await res.json();
          setError(message);
        }
      } catch (error) {
        setError('Error, try again');
        console.log('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex justify-center items-center px-3 h-screen font-inter">
      <div className="z-50 space-y-8 bg-white shadow-md p-8 rounded sm:w-96">
        <h2 className="font-grotesk font-bold text-black text-2xl text-center">
          User Profile
        </h2>
        {user && (
          <div>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-500 mt-2 px-3 py-1 rounded-md w-fit text-white text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;