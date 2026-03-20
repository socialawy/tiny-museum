// components/ui/ParentGate.tsx

'use client';

import { useState, useMemo } from 'react';

interface ParentGateProps {
    onUnlock: () => void;
    onCancel: () => void;
    message?: string;
}

export function ParentGate({ onUnlock, onCancel, message }: ParentGateProps) {
    // Generate a simple multiplication problem a kid can't easily solve
    const problem = useMemo(() => {
        const a = Math.floor(Math.random() * 8) + 3;  // 3-10
        const b = Math.floor(Math.random() * 8) + 3;  // 3-10
        return { a, b, answer: a * b };
    }, []);

    const [input, setInput] = useState('');
    const [wrong, setWrong] = useState(false);

    function check() {
        if (parseInt(input, 10) === problem.answer) {
            onUnlock();
        } else {
            setWrong(true);
            setInput('');
            setTimeout(() => setWrong(false), 1500);
        }
    }

    return (
        <div className="parent-gate-overlay">
            <div className="parent-gate-card">
                <h2>👋 Grown-Up Check</h2>
                <p>{message ?? 'This needs a grown-up. Solve to continue:'}</p>

                <p className="math-problem">
                    {problem.a} × {problem.b} = ?
                </p>

                <input
                    type="number"
                    inputMode="numeric"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && check()}
                    autoFocus
                    style={{ fontSize: '1.5rem', textAlign: 'center', width: '6rem' }}
                />

                <div className="gate-actions">
                    <button onClick={check} className="gate-confirm">
                        Check ✓
                    </button>
                    <button onClick={onCancel} className="gate-cancel">
                        Go Back
                    </button>
                </div>

                {wrong && (
                    <p className="gate-wrong">Not quite — try again! 🤔</p>
                )}
            </div>
        </div>
    );
}