import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { storage } from "@/lib/storage";
import type { ToiletRecord, RecordType } from "@/types";
import { STICKER_REWARDS } from "@/types";

interface RecordsContextValue {
  records: ToiletRecord[];
  todayRecords: ToiletRecord[];
  isLoading: boolean;
  addRecord: (type: RecordType) => Promise<ToiletRecord>;
  getTodayCounts: () => { sat: number; pee: number; poop: number };
  resetRecords: () => Promise<void>;
}

const RecordsContext = createContext<RecordsContextValue | null>(null);

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<ToiletRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      const saved = await storage.load<ToiletRecord[]>(storage.keys.RECORDS);
      if (saved) setRecords(saved);
    } catch (error) {
      console.error("[Records] Failed to load:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const todayRecords = records.filter((r) => isToday(r.timestamp));

  const addRecord = useCallback(async (type: RecordType): Promise<ToiletRecord> => {
    const newRecord: ToiletRecord = {
      id: generateId(),
      type,
      timestamp: new Date().toISOString(),
      stickersEarned: STICKER_REWARDS[type],
    };

    setRecords((prev) => {
      const next = [newRecord, ...prev];
      storage.save(storage.keys.RECORDS, next);
      return next;
    });

    return newRecord;
  }, []);

  const getTodayCounts = useCallback(() => {
    return {
      sat: todayRecords.filter((r) => r.type === "sat").length,
      pee: todayRecords.filter((r) => r.type === "pee").length,
      poop: todayRecords.filter((r) => r.type === "poop").length,
    };
  }, [todayRecords]);

  const resetRecords = useCallback(async () => {
    setRecords([]);
    await storage.save(storage.keys.RECORDS, []);
  }, []);

  return (
    <RecordsContext.Provider
      value={{
        records,
        todayRecords,
        isLoading,
        addRecord,
        getTodayCounts,
        resetRecords,
      }}
    >
      {children}
    </RecordsContext.Provider>
  );
}

export function useRecords(): RecordsContextValue {
  const ctx = useContext(RecordsContext);
  if (!ctx) {
    throw new Error("useRecords must be used within a RecordsProvider");
  }
  return ctx;
}
