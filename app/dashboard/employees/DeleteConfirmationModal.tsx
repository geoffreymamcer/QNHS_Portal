'use client';

import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

import { deleteEmployee } from './actions';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: any;
}

export default function DeleteConfirmationModal({ isOpen, onClose, employee }: DeleteConfirmationModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!employee) return;
        setIsLoading(true);
        setError(null);
        try {
            await deleteEmployee(employee.id);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to delete employee record');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !employee) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-red-950/20 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-md overflow-hidden rounded-3xl shadow-2xl border border-red-100 animate-in zoom-in-95 duration-300 flex flex-col">

                {/* Warning Header */}
                <div className="p-8 pb-4 text-center">
                    <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6 relative">
                        <Trash2 size={40} className="relative z-10" />
                        <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">Delete Record?</h2>
                    <p className="text-slate-500 mt-2 leading-relaxed px-4">
                        You are about to permanently delete the personnel record of <br />
                        <span className="font-bold text-red-600 underline decoration-red-200 underline-offset-4">{employee.first_name} {employee.last_name}</span>
                    </p>
                    {error && (
                        <p className="text-xs font-bold text-red-500 mt-4 bg-red-50 p-2 rounded-lg border border-red-100">
                            ⚠️ {error}
                        </p>
                    )}
                </div>

                {/* Security Notice */}
                <div className="mx-8 p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-start gap-3 mb-8">
                    <AlertTriangle className="text-red-500 shrink-0" size={18} />
                    <p className="text-[11px] text-red-700 font-medium leading-normal">
                        This action is irreversible. All associated data for employee ID <span className="font-bold">#{employee.employee_id}</span> will be removed from the school database.
                    </p>
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all active:scale-95 border border-slate-200 bg-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-extrabold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Trash2 size={18} />
                        )}
                        {isLoading ? 'Deleting...' : 'Delete Record'}
                    </button>
                </div>
            </div>
        </div>
    );
}
