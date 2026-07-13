import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ProtectedRoute({ children, allowedRole }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Veritabanından profili çek (Gerçek Rol)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setRole(profile.role);
        } else {
          setRole('student'); // Varsayılan
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/unauthorized" replace />;

  return children;
}
