'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, MoreHorizontal, Eye, Edit2, Trash2, Filter, Download } from 'lucide-react';
import AddEmployeeModal from './AddEmployeeModal';
import ViewEmployeeModal from './ViewEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface Employee {
    id: string;
    employee_id: string;
    first_name: string;
    mid_name: string;
    last_name: string;
    sex: string;
    birthdate: string;
    position: string;
    department: string;
    position_classification: string;
    email: string;
    contact_no: string;
    hired_date: string;
    // ... other fields
}

export default function EmployeeClientPage({ initialEmployees }: { initialEmployees: any[] }) {
    // Modal States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    const [selectedPos, setSelectedPos] = useState('All');
    const [selectedClass, setSelectedClass] = useState('All');

    const departments = useMemo(() => Array.from(new Set(initialEmployees.map(e => e.department || e.dept).filter(Boolean))).sort(), [initialEmployees]);
    const positions = useMemo(() => Array.from(new Set(initialEmployees.map(e => e.position).filter(Boolean))).sort(), [initialEmployees]);

    const filteredEmployees = useMemo(() => {
        return initialEmployees.filter(emp => {
            const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
            const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                (emp.employee_id && emp.employee_id.includes(searchQuery));

            const matchesDept = selectedDept === 'All' || (emp.department || emp.dept) === selectedDept;
            const matchesPos = selectedPos === 'All' || emp.position === selectedPos;
            const matchesClass = selectedClass === 'All' || (emp.position_classification || emp.classification) === selectedClass;

            return matchesSearch && matchesDept && matchesPos && matchesClass;
        });
    }, [initialEmployees, searchQuery, selectedDept, selectedPos, selectedClass]);

    const calculateAge = (birthdate: string) => {
        if (!birthdate) return 0;
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const isRetiring = (birthdate: string) => calculateAge(birthdate) >= 60;

    // Handlers for action modals
    const handleView = (emp: any) => {
        setSelectedEmployee(emp);
        setIsViewOpen(true);
    };

    const handleEdit = (emp: any) => {
        setSelectedEmployee(emp);
        setIsEditOpen(true);
    };

    const handleDelete = (emp: any) => {
        setSelectedEmployee(emp);
        setIsDeleteOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-blue-950">Employee Management</h1>
                    <p className="text-slate-500 mt-1">Manage, search, and monitor your school workforce.</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold shadow-md transition-all active:scale-95"
                >
                    <Plus size={18} />
                    Add New Employee
                </button>
            </div>

            {/* Advanced Search and Filters */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or employee ID..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 italic">
                            {filteredEmployees.length} result(s)
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Department</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all appearance-none"
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                        >
                            <option value="All">All Departments</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Position</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all appearance-none"
                            value={selectedPos}
                            onChange={(e) => setSelectedPos(e.target.value)}
                        >
                            <option value="All">All Positions</option>
                            {positions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Classification</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all appearance-none"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="All">All Classifications</option>
                            <option value="Teaching">Teaching</option>
                            <option value="Non-Teaching">Non-Teaching</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department & Position</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Classification</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Retirement Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 shadow-sm group-hover:scale-110 transition-all overflow-hidden">
                                                    {emp.photo_url ? (
                                                        <img
                                                            src={emp.photo_url}
                                                            alt={`${emp.first_name} ${emp.last_name}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        (emp.first_name?.[0] || '') + (emp.last_name?.[0] || '')
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{emp.first_name} {emp.last_name}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium">ID: {emp.employee_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-700">{emp.position}</p>
                                            <p className="text-[11px] text-slate-500">{emp.department || emp.dept}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${(emp.position_classification || emp.classification) === 'Teaching'
                                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                                }`}>
                                                {emp.position_classification || emp.classification}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isRetiring(emp.birthdate) ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-bold border border-red-100 animate-pulse">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                                    RETIRING
                                                </span>
                                            ) : (
                                                <span className="text-[11px] font-medium text-slate-400 italic">No Action Needed</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleView(emp)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="View Profile"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(emp)}
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                    title="Edit Record"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Filter size={40} className="mb-4 opacity-20" />
                                            <p className="font-medium">No results found for your search criteria.</p>
                                            <button
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setSelectedDept('All');
                                                    setSelectedPos('All');
                                                    setSelectedClass('All');
                                                }}
                                                className="mt-2 text-blue-600 hover:underline text-sm font-semibold"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <AddEmployeeModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

            <ViewEmployeeModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                employee={selectedEmployee}
            />

            <EditEmployeeModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                employee={selectedEmployee}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                employee={selectedEmployee}
            />
        </div>
    );
}
