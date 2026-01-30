// src/hooks/useOptimisticResume.js
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import resumeService from '../services/resumeService';

/**
 * Custom hook for optimistic resume operations with undo support
 * Features:
 * - Optimistic updates for all resume operations
 * - Automatic rollback on error
 * - Undo functionality
 * - Offline queue support
 * - Conflict resolution
 */

export const useOptimisticResume = () => {
    const queryClient = useQueryClient();
    const pendingOperations = useRef(new Map());
    const undoStack = useRef([]);

    // ===================== CREATE RESUME =====================
    const createResume = useCallback(async (resumeData, options = {}) => {
        const {
            optimistic = true,
            showToast = true,
            undoable = true,
        } = options;

        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const operationId = `create-${tempId}`;

        // Prepare optimistic data
        const optimisticResume = {
            id: tempId,
            ...resumeData,
            isOptimistic: true,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
        };

        // Store operation for potential rollback
        if (optimistic) {
            pendingOperations.current.set(operationId, {
                type: 'create',
                tempId,
                data: optimisticResume,
                timestamp: Date.now(),
            });

            // Optimistically update cache
            queryClient.setQueryData(['userResumes'], (old = []) => [
                optimisticResume,
                ...old,
            ]);

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            queryClient.invalidateQueries({ queryKey: ['resumeCount'] });

            if (showToast) {
                toast.loading('Creating resume...', { id: operationId });
            }
        }

        try {
            // Actual API call
            const createdResume = await resumeService.createResume(resumeData);

            // Replace optimistic data with real data
            if (optimistic) {
                queryClient.setQueryData(['userResumes'], (old = []) =>
                    old.map(resume =>
                        resume.id === tempId ? { ...createdResume, isOptimistic: false } : resume
                    )
                );

                // Add to undo stack if undoable
                if (undoable) {
                    undoStack.current.push({
                        type: 'create',
                        resumeId: createdResume.id,
                        data: createdResume,
                        timestamp: Date.now(),
                    });
                }

                pendingOperations.current.delete(operationId);

                if (showToast) {
                    toast.success('Resume created successfully!', {
                        id: operationId,
                        duration: 4000,
                    });
                }
            }

            return createdResume;
        } catch (error) {
            // Rollback on error
            if (optimistic) {
                queryClient.setQueryData(['userResumes'], (old = []) =>
                    old.filter(resume => resume.id !== tempId)
                );

                pendingOperations.current.delete(operationId);

                if (showToast) {
                    toast.error('Failed to create resume', {
                        id: operationId,
                        duration: 5000,
                    });
                }
            }

            throw error;
        }
    }, [queryClient]);

    // ===================== UPDATE RESUME =====================
    const updateResume = useCallback(async (resumeId, updates, options = {}) => {
        const {
            optimistic = true,
            showToast = true,
            undoable = true,
            mergeStrategy = 'overwrite', // 'overwrite', 'merge', 'smart'
        } = options;

        const operationId = `update-${resumeId}-${Date.now()}`;
        let previousData = null;

        if (optimistic) {
            // Get current data for rollback
            const resumes = queryClient.getQueryData(['userResumes']) || [];
            previousData = resumes.find(r => r.id === resumeId);

            if (!previousData) {
                throw new Error('Resume not found in cache');
            }

            // Store for rollback
            pendingOperations.current.set(operationId, {
                type: 'update',
                resumeId,
                previousData,
                updates,
                timestamp: Date.now(),
            });

            // Apply optimistic update
            queryClient.setQueryData(['userResumes'], (old = []) =>
                old.map(resume => {
                    if (resume.id === resumeId) {
                        const newData = mergeStrategy === 'merge'
                            ? { ...resume, ...updates }
                            : { ...updates };

                        return {
                            ...newData,
                            isOptimistic: true,
                            updatedAt: new Date().toISOString(),
                            version: (resume.version || 1) + 1,
                        };
                    }
                    return resume;
                })
            );

            // Also update individual resume query
            queryClient.setQueryData(['resume', resumeId], (old) => ({
                ...old,
                ...updates,
                isOptimistic: true,
                updatedAt: new Date().toISOString(),
            }));

            if (showToast) {
                toast.loading('Saving changes...', { id: operationId });
            }
        }

        try {
            const updatedResume = await resumeService.updateResume(resumeId, updates);

            if (optimistic) {
                // Replace with real data
                queryClient.setQueryData(['userResumes'], (old = []) =>
                    old.map(resume =>
                        resume.id === resumeId ? { ...updatedResume, isOptimistic: false } : resume
                    )
                );

                queryClient.setQueryData(['resume', resumeId], updatedResume);

                // Add to undo stack
                if (undoable) {
                    undoStack.current.push({
                        type: 'update',
                        resumeId,
                        previousData,
                        newData: updatedResume,
                        timestamp: Date.now(),
                    });
                }

                pendingOperations.current.delete(operationId);

                if (showToast) {
                    toast.success('Changes saved!', {
                        id: operationId,
                        duration: 3000,
                    });
                }
            }

            return updatedResume;
        } catch (error) {
            if (optimistic && previousData) {
                // Rollback
                queryClient.setQueryData(['userResumes'], (old = []) =>
                    old.map(resume =>
                        resume.id === resumeId ? previousData : resume
                    )
                );

                queryClient.setQueryData(['resume', resumeId], previousData);

                pendingOperations.current.delete(operationId);

                if (showToast) {
                    toast.error('Failed to save changes', {
                        id: operationId,
                        duration: 5000,
                    });
                }
            }

            throw error;
        }
    }, [queryClient]);

    // ===================== DELETE RESUME =====================
    const deleteResume = useCallback(async (resumeId, options = {}) => {
        const {
            optimistic = true,
            showToast = true,
            undoable = true,
            confirmation = true,
        } = options;

        const operationId = `delete-${resumeId}-${Date.now()}`;
        let deletedResume = null;

        // Ask for confirmation if needed
        if (confirmation && !window.confirm('Are you sure you want to delete this resume?')) {
            return;
        }

        if (optimistic) {
            // Get data for rollback
            const resumes = queryClient.getQueryData(['userResumes']) || [];
            deletedResume = resumes.find(r => r.id === resumeId);

            if (!deletedResume) {
                throw new Error('Resume not found in cache');
            }

            // Store for rollback
            pendingOperations.current.set(operationId, {
                type: 'delete',
                resumeId,
                data: deletedResume,
                timestamp: Date.now(),
            });

            // Optimistically remove
            queryClient.setQueryData(['userResumes'], (old = []) =>
                old.filter(resume => resume.id !== resumeId)
            );

            // Clear individual resume cache
            queryClient.removeQueries({ queryKey: ['resume', resumeId] });

            // Invalidate stats
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });

            if (showToast) {
                const toastId = toast.loading('Deleting resume...', { id: operationId });

                // Add undo button
                if (undoable) {
                    toast.custom((t) => (
                        <div className="flex items-center gap-4">
                            <span>Resume deleted</span>
                            <button
                                onClick={() => {
                                    undoLastOperation();
                                    toast.dismiss(t.id);
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                                Undo
                            </button>
                        </div>
                    ), { id: `undo-${operationId}`, duration: 8000 });
                }
            }
        }

        try {
            await resumeService.deleteResume(resumeId);

            if (optimistic) {
                // Add to undo stack
                if (undoable) {
                    undoStack.current.push({
                        type: 'delete',
                        resumeId,
                        data: deletedResume,
                        timestamp: Date.now(),
                    });
                }

                pendingOperations.current.delete(operationId);

                if (showToast && !undoable) {
                    toast.success('Resume deleted', {
                        id: operationId,
                        duration: 4000,
                    });
                }
            }

            return true;
        } catch (error) {
            if (optimistic && deletedResume) {
                // Rollback
                queryClient.setQueryData(['userResumes'], (old = []) => [
                    deletedResume,
                    ...old,
                ]);

                queryClient.setQueryData(['resume', resumeId], deletedResume);

                pendingOperations.current.delete(operationId);

                if (showToast) {
                    toast.error('Failed to delete resume', {
                        id: operationId,
                        duration: 5000,
                    });
                }
            }

            throw error;
        }
    }, [queryClient]);

    // ===================== DUPLICATE RESUME =====================
    const duplicateResume = useCallback(async (resumeId, options = {}) => {
        const {
            optimistic = true,
            showToast = true,
            newTitle = null,
        } = options;

        const operationId = `duplicate-${resumeId}-${Date.now()}`;

        if (optimistic) {
            // Get original resume
            const resumes = queryClient.getQueryData(['userResumes']) || [];
            const originalResume = resumes.find(r => r.id === resumeId);

            if (!originalResume) {
                throw new Error('Resume not found');
            }

            const tempId = `temp-dup-${Date.now()}`;
            const duplicatedResume = {
                ...originalResume,
                id: tempId,
                title: newTitle || `${originalResume.title} (Copy)`,
                isOptimistic: true,
                isPrimary: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Remove original ID fields
            delete duplicatedResume._id;
            delete duplicatedResume.id;

            // Store for rollback
            pendingOperations.current.set(operationId, {
                type: 'duplicate',
                tempId,
                originalId: resumeId,
                data: duplicatedResume,
                timestamp: Date.now(),
            });

            // Optimistically add
            queryClient.setQueryData(['userResumes'], (old = []) => [
                duplicatedResume,
                ...old,
            ]);

            if (showToast) {
                toast.loading('Duplicating resume...', { id: operationId });
            }
        }

        try {
            const duplicated = await resumeService.duplicateResume(resumeId, { newTitle });

            if (optimistic) {
                // Replace with real data
                queryClient.setQueryData(['userResumes'], (old = []) =>
                    old.map(resume =>
                        resume.id === operationId ? { ...duplicated, isOptimistic: false } : resume
                    )
                );

                pendingOperations.current.delete(operationId);

                if (showToast) {
                    toast.success('Resume duplicated!', {
                        id: operationId,
                        duration: 3000,
                    });
                }
            }

            return duplicated;
        } catch (error) {
            if (optimistic) {
                // Rollback
                queryClient.setQueryData(['userResumes'], (old = []) =>
                    old.filter(resume => resume.id !== operationId)
                );

                pendingOperations.current.delete(operationId);

                if (showToast) {
                    toast.error('Failed to duplicate resume', {
                        id: operationId,
                        duration: 5000,
                    });
                }
            }

            throw error;
        }
    }, [queryClient]);

    // ===================== EXPORT RESUME =====================
    const exportResume = useCallback(async (resumeId, format = 'pdf', options = {}) => {
        const {
            showToast = true,
            download = true,
        } = options;

        const operationId = `export-${resumeId}-${format}-${Date.now()}`;

        if (showToast) {
            toast.loading(`Exporting as ${format.toUpperCase()}...`, { id: operationId });
        }

        try {
            const result = await resumeService.exportResume(resumeId, format);

            if (download && result.url) {
                const link = document.createElement('a');
                link.href = result.url;
                link.download = result.filename || `resume.${format}`;
                link.click();
            }

            if (showToast) {
                toast.success(`Exported as ${format.toUpperCase()}!`, {
                    id: operationId,
                    duration: 3000,
                });
            }

            return result;
        } catch (error) {
            if (showToast) {
                toast.error(`Export failed: ${error.message}`, {
                    id: operationId,
                    duration: 5000,
                });
            }

            throw error;
        }
    }, []);

    // ===================== UNDO OPERATIONS =====================
    const undoLastOperation = useCallback(async () => {
        if (undoStack.current.length === 0) {
            toast.error('Nothing to undo');
            return;
        }

        const lastOperation = undoStack.current.pop();

        try {
            switch (lastOperation.type) {
                case 'create':
                    // Delete the created resume
                    await resumeService.deleteResume(lastOperation.resumeId);

                    queryClient.setQueryData(['userResumes'], (old = []) =>
                        old.filter(resume => resume.id !== lastOperation.resumeId)
                    );

                    toast.success('Creation undone');
                    break;

                case 'update':
                    // Revert to previous version
                    await resumeService.updateResume(
                        lastOperation.resumeId,
                        lastOperation.previousData
                    );

                    queryClient.setQueryData(['userResumes'], (old = []) =>
                        old.map(resume =>
                            resume.id === lastOperation.resumeId
                                ? lastOperation.previousData
                                : resume
                        )
                    );

                    toast.success('Changes reverted');
                    break;

                case 'delete':
                    // Restore deleted resume
                    await resumeService.createResume(lastOperation.data);

                    queryClient.setQueryData(['userResumes'], (old = []) => [
                        lastOperation.data,
                        ...old,
                    ]);

                    toast.success('Resume restored');
                    break;
            }

            // Update undo stack
            undoStack.current = undoStack.current.filter(op => op !== lastOperation);
        } catch (error) {
            toast.error('Failed to undo operation');
            // Put operation back on stack
            undoStack.current.push(lastOperation);
        }
    }, [queryClient]);

    // ===================== BATCH OPERATIONS =====================
    const batchUpdateResumes = useCallback(async (updates, options = {}) => {
        const {
            optimistic = true,
            showToast = true,
        } = options;

        const operationId = `batch-${Date.now()}`;
        const previousStates = new Map();

        if (optimistic) {
            const resumes = queryClient.getQueryData(['userResumes']) || [];

            // Store previous states
            updates.forEach(({ resumeId }) => {
                const resume = resumes.find(r => r.id === resumeId);
                if (resume) {
                    previousStates.set(resumeId, resume);
                }
            });

            // Apply optimistic updates
            queryClient.setQueryData(['userResumes'], (old = []) =>
                old.map(resume => {
                    const update = updates.find(u => u.resumeId === resume.id);
                    if (update) {
                        return {
                            ...resume,
                            ...update.changes,
                            isOptimistic: true,
                            updatedAt: new Date().toISOString(),
                        };
                    }
                    return resume;
                })
            );

            if (showToast) {
                toast.loading(`Updating ${updates.length} resume(s)...`, { id: operationId });
            }
        }

        try {
            const results = await Promise.all(
                updates.map(update =>
                    resumeService.updateResume(update.resumeId, update.changes)
                )
            );

            if (optimistic) {
                // Replace with real data
                queryClient.setQueryData(['userResumes'], (old = []) =>
                    old.map(resume => {
                        const result = results.find(r => r.id === resume.id);
                        if (result) {
                            return { ...result, isOptimistic: false };
                        }
                        return resume;
                    })
                );

                if (showToast) {
                    toast.success(`${updates.length} resume(s) updated!`, {
                        id: operationId,
                        duration: 3000,
                    });
                }
            }

            return results;
        } catch (error) {
            if (optimistic) {
                // Rollback all changes
                queryClient.setQueryData(['userResumes'], (old = []) =>
                    old.map(resume => {
                        const previous = previousStates.get(resume.id);
                        return previous || resume;
                    })
                );

                if (showToast) {
                    toast.error('Batch update failed', {
                        id: operationId,
                        duration: 5000,
                    });
                }
            }

            throw error;
        }
    }, [queryClient]);

    // ===================== OFFLINE SUPPORT =====================
    const queueOfflineOperation = useCallback((operation) => {
        const queue = JSON.parse(localStorage.getItem('resume_operations') || '[]');
        queue.push({
            ...operation,
            queuedAt: Date.now(),
            id: `offline-${Date.now()}`,
        });
        localStorage.setItem('resume_operations', JSON.stringify(queue));

        toast('Operation queued for when you\'re back online', {
            icon: '📱',
            duration: 4000,
        });
    }, []);

    const processOfflineQueue = useCallback(async () => {
        const queue = JSON.parse(localStorage.getItem('resume_operations') || '[]');

        if (queue.length === 0) return;

        toast.loading(`Processing ${queue.length} offline operation(s)...`);

        const successful = [];
        const failed = [];

        for (const operation of queue) {
            try {
                switch (operation.type) {
                    case 'create':
                        await createResume(operation.data, { optimistic: false, showToast: false });
                        break;
                    case 'update':
                        await updateResume(operation.resumeId, operation.updates, {
                            optimistic: false,
                            showToast: false
                        });
                        break;
                    case 'delete':
                        await deleteResume(operation.resumeId, {
                            optimistic: false,
                            showToast: false,
                            confirmation: false
                        });
                        break;
                }
                successful.push(operation.id);
            } catch (error) {
                failed.push({ id: operation.id, error: error.message });
            }
        }

        // Remove successful operations from queue
        const newQueue = queue.filter(op => !successful.includes(op.id));
        localStorage.setItem('resume_operations', JSON.stringify(newQueue));

        if (successful.length > 0) {
            toast.success(`${successful.length} operation(s) synced successfully`);
        }

        if (failed.length > 0) {
            toast.error(`${failed.length} operation(s) failed to sync`);
        }
    }, [createResume, updateResume, deleteResume]);

    // ===================== SYNC STATUS =====================
    const getSyncStatus = useCallback(() => {
        const hasPendingOperations = pendingOperations.current.size > 0;
        const offlineQueue = JSON.parse(localStorage.getItem('resume_operations') || '[]');
        const hasOfflineOperations = offlineQueue.length > 0;

        return {
            isSyncing: hasPendingOperations,
            pendingCount: pendingOperations.current.size,
            offlineCount: offlineQueue.length,
            hasUnsavedChanges: hasPendingOperations || hasOfflineOperations,
            lastSync: localStorage.getItem('last_sync_time') || null,
        };
    }, []);

    // ===================== CLEANUP =====================
    const cleanupOptimisticData = useCallback(() => {
        // Remove any leftover optimistic data
        queryClient.setQueryData(['userResumes'], (old = []) =>
            old.filter(resume => !resume.isOptimistic)
        );

        pendingOperations.current.clear();

        toast.info('Cleaned up temporary data');
    }, [queryClient]);

    // Listen for online/offline events
    useEffect(() => {
        const handleOnline = () => {
            processOfflineQueue();
        };

        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('online', handleOnline);
        };
    }, [processOfflineQueue]);

    // Auto-cleanup on page refresh
    useEffect(() => {
        const handleBeforeUnload = () => {
            cleanupOptimisticData();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [cleanupOptimisticData]);

    return {
        // Core operations
        createResume,
        updateResume,
        deleteResume,
        duplicateResume,
        exportResume,

        // Batch operations
        batchUpdateResumes,

        // Undo/Redo
        undoLastOperation,
        canUndo: undoStack.current.length > 0,
        undoStack: undoStack.current,

        // Offline support
        queueOfflineOperation,
        processOfflineQueue,

        // Sync status
        getSyncStatus,

        // Cleanup
        cleanupOptimisticData,

        // Debug info
        _debug: {
            pendingOperations: Array.from(pendingOperations.current.values()),
            undoStackSize: undoStack.current.length,
        },
    };
};

// ===================== HOOK FOR REACT COMPONENTS =====================
export const useOptimisticResumeHook = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const {
        createResume,
        updateResume,
        deleteResume,
        duplicateResume,
        exportResume,
        undoLastOperation,
        getSyncStatus,
    } = useOptimisticResume();

    // Enhanced create with user context
    const createResumeWithUser = useCallback(async (resumeData, options = {}) => {
        const enhancedData = {
            ...resumeData,
            userId: user?.id,
            createdBy: user?.id,
            personalInfo: {
                ...resumeData.personalInfo,
                email: resumeData.personalInfo?.email || user?.email,
                fullName: resumeData.personalInfo?.fullName || user?.name,
            },
        };

        return createResume(enhancedData, options);
    }, [user, createResume]);

    // Get user's resumes with optimistic updates
    const useUserResumes = (options = {}) => {
        return useQuery({
            queryKey: ['userResumes', user?.id],
            queryFn: () => resumeService.getUserResumes(),
            enabled: !!user?.id,
            staleTime: 5 * 60 * 1000,
            select: (data) => {
                // Filter out optimistic data that's been around too long (zombie data)
                const now = Date.now();
                return data.filter(resume => {
                    if (resume.isOptimistic) {
                        const created = new Date(resume.createdAt).getTime();
                        return now - created < 5 * 60 * 1000; // Remove if older than 5 minutes
                    }
                    return true;
                });
            },
            ...options,
        });
    };

    // Get single resume with optimistic updates
    const useResume = (resumeId, options = {}) => {
        return useQuery({
            queryKey: ['resume', resumeId],
            queryFn: () => resumeService.getResume(resumeId),
            enabled: !!resumeId,
            staleTime: 2 * 60 * 1000,
            ...options,
        });
    };

    // Auto-refresh on reconnect
    useEffect(() => {
        const handleOnline = () => {
            queryClient.invalidateQueries({ queryKey: ['userResumes', user?.id] });
        };

        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('online', handleOnline);
        };
    }, [queryClient, user?.id]);

    return {
        // State
        syncStatus: getSyncStatus(),

        // Queries
        useUserResumes,
        useResume,

        // Operations
        createResume: createResumeWithUser,
        updateResume,
        deleteResume,
        duplicateResume,
        exportResume,
        undoLastOperation,

        // Helper functions
        getResumeById: (resumeId) => {
            const resumes = queryClient.getQueryData(['userResumes', user?.id]) || [];
            return resumes.find(r => r.id === resumeId);
        },

        // Optimistic helpers
        isOptimistic: (resumeId) => {
            const resume = queryClient.getQueryData(['resume', resumeId]);
            return resume?.isOptimistic === true;
        },
    };
};

// ===================== CONTEXT PROVIDER =====================
export const OptimisticResumeProvider = ({ children }) => {
    const value = useOptimisticResumeHook();

    return (
        <OptimisticResumeContext.Provider value={value}>
            {children}
            {/* Sync indicator component */}
            <SyncIndicator />
        </OptimisticResumeContext.Provider>
    );
};

// ===================== SYNC INDICATOR COMPONENT =====================
const SyncIndicator = () => {
    const { syncStatus } = useOptimisticResumeHook();

    if (!syncStatus.hasUnsavedChanges) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg">
                {syncStatus.isSyncing ? (
                    <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">
                            Syncing {syncStatus.pendingCount} change(s)...
                        </span>
                    </>
                ) : syncStatus.offlineCount > 0 ? (
                    <>
                        <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                        <span className="text-sm">
                            {syncStatus.offlineCount} offline change(s) pending
                        </span>
                    </>
                ) : null}
            </div>
        </div>
    );
};

// ===================== CUSTOM TOAST FOR UNDO =====================
export const showUndoToast = (message, onUndo) => {
    toast.custom((t) => (
        <div className="flex items-center justify-between w-full max-w-md bg-white rounded-lg shadow-lg p-4">
            <span className="text-gray-800">{message}</span>
            <button
                onClick={() => {
                    onUndo();
                    toast.dismiss(t.id);
                }}
                className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
                Undo
            </button>
        </div>
    ), {
        duration: 8000,
        position: 'bottom-right',
    });
};

export default useOptimisticResumeHook;