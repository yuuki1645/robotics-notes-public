import { useState, useEffect, useCallback, useRef } from 'react';
import { loadMotions, saveMotions, createMotion, loadCurrentMotionId, saveCurrentMotionId } from '../utils/motionStorage';

export function useMotion() {
  const [motions, setMotions] = useState([]);
  const [currentMotionId, setCurrentMotionId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isInitialLoadRef = useRef(true);
  
  // 初期化：ローカルストレージから読み込み
  useEffect(() => {
    const loaded = loadMotions();
    const savedMotionId = loadCurrentMotionId();
    
    if (loaded.length > 0) {
      setMotions(loaded);
      // 前回選択していたモーションが存在すれば復元、なければ先頭
      const validId = savedMotionId && loaded.some(m => m.id === savedMotionId)
        ? savedMotionId
        : loaded[0].id;
      setCurrentMotionId(validId);
    } else {
      const defaultMotion = createMotion('デフォルトモーション');
      setMotions([defaultMotion]);
      setCurrentMotionId(defaultMotion.id);
    }
    
    setIsInitialized(true);
    isInitialLoadRef.current = false;
  }, []);
  
  // モーション一覧変更時に保存
  useEffect(() => {
    if (isInitialized && !isInitialLoadRef.current && motions.length > 0) {
      saveMotions(motions);
    }
  }, [motions, isInitialized]);
  
  // 選択中のモーション変更時に保存（再読込時に復元するため）
  useEffect(() => {
    if (isInitialized && !isInitialLoadRef.current && currentMotionId) {
      saveCurrentMotionId(currentMotionId);
    }
  }, [isInitialized, currentMotionId]);
  
  const currentMotion = motions.find(m => m.id === currentMotionId) || null;
  
  const addMotion = useCallback((name) => {
    const newMotion = createMotion(name);
    setMotions(prev => [...prev, newMotion]);
    setCurrentMotionId(newMotion.id);
    return newMotion;
  }, []);
  
  const deleteMotion = useCallback((id) => {
    setMotions(prev => {
      const filtered = prev.filter(m => m.id !== id);
      if (filtered.length > 0 && currentMotionId === id) {
        setCurrentMotionId(filtered[0].id);
      } else if (filtered.length === 0) {
        const defaultMotion = createMotion('デフォルトモーション');
        setCurrentMotionId(defaultMotion.id);
        return [defaultMotion];
      }
      return filtered;
    });
  }, [currentMotionId]);
  
  const updateMotion = useCallback((id, updates) => {
    setMotions(prev => prev.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
  }, []);
  
  const renameMotion = useCallback((id, newName) => {
    updateMotion(id, { name: newName });
  }, [updateMotion]);
  
  return {
    motions,
    currentMotion,
    currentMotionId,
    setCurrentMotionId,
    addMotion,
    deleteMotion,
    updateMotion,
    renameMotion,
    isInitialized,
  };
}