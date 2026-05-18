"use client";

import { useCallback, useState } from "react";
import type { SignatureDocument } from "@/types/signature-document";

const MAX_HISTORY = 50;

type HistoryState = {
  past: SignatureDocument[];
  present: SignatureDocument;
  future: SignatureDocument[];
};

export function useDocumentHistory(initial: SignatureDocument) {
  const [state, setState] = useState<HistoryState>({
    past: [],
    present: initial,
    future: [],
  });

  const setDocument = useCallback(
    (next: SignatureDocument | ((prev: SignatureDocument) => SignatureDocument)) => {
      setState((s) => {
        const resolved = typeof next === "function" ? next(s.present) : next;
        if (JSON.stringify(resolved) === JSON.stringify(s.present)) return s;
        return {
          past: [...s.past.slice(-(MAX_HISTORY - 1)), s.present],
          present: resolved,
          future: [],
        };
      });
    },
    [],
  );

  const replaceDocument = useCallback((next: SignatureDocument) => {
    setState({ past: [], present: next, future: [] });
  }, []);

  const undo = useCallback(() => {
    setState((s) => {
      if (s.past.length === 0) return s;
      const previous = s.past[s.past.length - 1]!;
      return {
        past: s.past.slice(0, -1),
        present: previous,
        future: [s.present, ...s.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((s) => {
      if (s.future.length === 0) return s;
      const next = s.future[0]!;
      return {
        past: [...s.past, s.present],
        present: next,
        future: s.future.slice(1),
      };
    });
  }, []);

  return {
    document: state.present,
    setDocument,
    replaceDocument,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
