// src/components/form/StateSelect.jsx
import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const US_STATES = [
    { id: 'AL', name: 'Alabama' },
    { id: 'AK', name: 'Alaska' },
    { id: 'AZ', name: 'Arizona' },
    // ... all other states
    { id: 'WY', name: 'Wyoming' }
];

const StateSelect = ({ value, onChange, label = "State", error, required = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredStates = US_STATES.filter(state =>
        state.name.toLowerCase().includes(search.toLowerCase()) ||
        state.id.toLowerCase().includes(search.toLowerCase())
    );

    const selectedState = US_STATES.find(state => state.id === value) ||
        US_STATES.find(state => state.name === value);

    const handleSelect = (state) => {
        onChange(state.id); // Always store the ID
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div className="relative">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${error
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className={`${selectedState ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                            {selectedState ? `${selectedState.name} (${selectedState.id})` : 'Select state...'}
                        </span>
                        <ChevronDown size={20} className="text-gray-400" />
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                        {/* Search input */}
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search states..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* States list */}
                        <div className="py-1">
                            {filteredStates.length > 0 ? (
                                filteredStates.map((state) => (
                                    <button
                                        key={state.id}
                                        type="button"
                                        onClick={() => handleSelect(state)}
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${selectedState?.id === state.id
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                            : 'text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{state.name}</span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {state.id}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                                    No states found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
};

export default StateSelect;