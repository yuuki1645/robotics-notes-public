import { useState, useEffect } from 'react';
import { fetchServos } from '../api';

export function useServos() {
  const [servos, setServos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadServos() {
      try {
        setLoading(true);
        const data = await fetchServos();
        console.log('servos', data);
        setServos(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching servos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadServos();
  }, []);

  return { servos, loading, error };
}