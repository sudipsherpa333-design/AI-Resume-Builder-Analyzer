// src/hooks/useDragAndDrop.js - FIXED VERSION
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for drag and drop functionality with reordering
 * @param {Array} initialItems - Initial array of items
 * @param {Function} onReorder - Callback when items are reordered
 * @param {Object} options - Configuration options
 * @returns {Object} - Drag and drop controls and state
 */
export const useDragAndDrop = (initialItems = [], onReorder = null, options = {}) => {
  const {
    dragHandleSelector = '.drag-handle',
    disableDrag = false,
    animationDuration = 200,
    dragThreshold = 5, // Minimum pixels to move before drag starts
    onDragStart = null,
    onDragEnd = null,
    onDragOver = null,
    allowCrossContainer = false,
    containerId = 'default'
  } = options;

  // State
  const [items, setItems] = useState(initialItems);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [draggedElement, setDraggedElement] = useState(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(-1);
  const [isOverContainer, setIsOverContainer] = useState(false);

  // Refs
  const containerRef = useRef(null);
  const itemRefs = useRef(new Map());
  const dragImageRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const mouseMoveStartRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastPositionRef = useRef({ x: 0, y: 0 });

  // Update items when initialItems changes
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Create drag image
  const createDragImage = useCallback((element) => {
    if (!element) {
      return null;
    }

    // Clone the element for drag preview
    const dragImage = element.cloneNode(true);
    dragImage.style.position = 'fixed';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.width = `${element.offsetWidth}px`;
    dragImage.style.height = `${element.offsetHeight}px`;
    dragImage.style.opacity = '0.8';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.zIndex = '9999';
    dragImage.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
    dragImage.style.borderRadius = '8px';
    dragImage.style.backgroundColor = 'white';
    dragImage.style.overflow = 'hidden';

    // Remove any event listeners from clone
    const clone = dragImage.cloneNode(true);
    document.body.appendChild(clone);

    return clone;
  }, []);

  // Get item index by ID
  const getItemIndex = useCallback((id) => {
    return items.findIndex(item => {
      if (typeof item === 'object' && item !== null) {
        return item.id === id || item._id === id;
      }
      return false;
    });
  }, [items]);

  // Handle drag start
  const handleDragStart = useCallback((e, itemId, index) => {
    if (disableDrag) {
      return;
    }

    e.stopPropagation();
    setDraggingId(itemId);
    setIsDragging(true);

    // Get the dragged element
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();

    // Calculate offset from mouse position
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Store start position
    setDragStartPosition({
      x: e.clientX,
      y: e.clientY
    });

    // Store mouse move start position
    mouseMoveStartRef.current = {
      x: e.clientX,
      y: e.clientY
    };

    // Create drag image
    const dragImage = createDragImage(element);
    if (dragImage) {
      dragImageRef.current = dragImage;
      // Set custom drag image
      if (e.dataTransfer && e.dataTransfer.setDragImage) {
        e.dataTransfer.setDragImage(dragImage, dragOffsetRef.current.x, dragOffsetRef.current.y);
      }
    }

    // Set drag effect
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', itemId);
      e.dataTransfer.setData('application/json', JSON.stringify({
        itemId,
        containerId,
        index
      }));
    }

    // Add dragging class
    element.classList.add('dragging');
    element.style.opacity = '0.4';

    // Callback
    if (onDragStart) {
      onDragStart({
        itemId,
        index,
        containerId,
        event: e
      });
    }

    console.log(`🚀 Drag started: ${itemId} from index ${index}`);
  }, [disableDrag, containerId, createDragImage, onDragStart]);

  // Handle drag over
  const handleDragOver = useCallback((e, targetId, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isDragging || !draggingId) {
      return;
    }

    // Calculate mouse movement distance
    const distanceMoved = mouseMoveStartRef.current ?
      Math.sqrt(
        Math.pow(e.clientX - mouseMoveStartRef.current.x, 2) +
                Math.pow(e.clientY - mouseMoveStartRef.current.y, 2)
      ) : 0;

    // Only start dragging if moved beyond threshold
    if (distanceMoved < dragThreshold) {
      return;
    }

    // Update drag position for visual feedback
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setDragPosition({
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y
      });

      // Update drag image position
      if (dragImageRef.current) {
        dragImageRef.current.style.transform = `translate(${e.clientX - dragOffsetRef.current.x}px, ${e.clientY - dragOffsetRef.current.y}px)`;
      }
    });

    // Set drag over state
    if (targetId !== dragOverId) {
      setDragOverId(targetId);

      // Calculate placeholder position
      const draggedIndex = getItemIndex(draggingId);
      if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
        setPlaceholderIndex(targetIndex);

        // Visual feedback for target element
        const targetElement = itemRefs.current.get(targetId);
        if (targetElement) {
          targetElement.classList.add('drag-over');

          // Add direction indicator
          if (targetIndex > draggedIndex) {
            targetElement.classList.add('drag-over-below');
            targetElement.classList.remove('drag-over-above');
          } else {
            targetElement.classList.add('drag-over-above');
            targetElement.classList.remove('drag-over-below');
          }
        }
      }
    }

    // Set data transfer effect
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }

    // Callback
    if (onDragOver) {
      onDragOver({
        draggingId,
        targetId,
        targetIndex,
        containerId,
        event: e
      });
    }
  }, [isDragging, draggingId, dragOverId, dragThreshold, getItemIndex, containerId, onDragOver]);

  // Handle drop
  const handleDrop = useCallback((e, targetId, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isDragging || !draggingId) {
      return;
    }

    const draggedIndex = getItemIndex(draggingId);

    // Check if drop is valid
    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
      resetDragState();
      return;
    }

    // Reorder items
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);

    // Adjust target index if dragging from above
    const adjustedTargetIndex = targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
    newItems.splice(adjustedTargetIndex, 0, draggedItem);

    // Update state
    setItems(newItems);
    setPlaceholderIndex(-1);

    // Callback
    if (onReorder) {
      onReorder(newItems, {
        draggedId: draggingId,
        targetId,
        fromIndex: draggedIndex,
        toIndex: adjustedTargetIndex,
        containerId
      });
    }

    console.log(`🎯 Drop: ${draggingId} from ${draggedIndex} to ${adjustedTargetIndex}`);

    // Cleanup
    resetDragState();
  }, [isDragging, draggingId, items, getItemIndex, onReorder, containerId]);

  // Handle drag end
  const handleDragEnd = useCallback((e) => {
    e.stopPropagation();

    // Cleanup
    resetDragState();

    // Callback
    if (onDragEnd) {
      onDragEnd({
        itemId: draggingId,
        containerId,
        event: e
      });
    }

    console.log(`🏁 Drag ended: ${draggingId}`);
  }, [draggingId, containerId, onDragEnd]);

  // Reset drag state
  const resetDragState = useCallback(() => {
    // Clean up drag image
    if (dragImageRef.current && document.body.contains(dragImageRef.current)) {
      document.body.removeChild(dragImageRef.current);
      dragImageRef.current = null;
    }

    // Remove dragging classes
    const elements = document.querySelectorAll('.dragging, .drag-over, .drag-over-above, .drag-over-below');
    elements.forEach(el => {
      el.classList.remove('dragging', 'drag-over', 'drag-over-above', 'drag-over-below');
      el.style.opacity = '';
    });

    // Reset animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Reset state
    setDraggingId(null);
    setDragOverId(null);
    setIsDragging(false);
    setDragPosition({ x: 0, y: 0 });
    setDragStartPosition({ x: 0, y: 0 });
    setDraggedElement(null);
    setPlaceholderIndex(-1);
    setIsOverContainer(false);

    mouseMoveStartRef.current = null;
    lastPositionRef.current = { x: 0, y: 0 };
  }, []);

  // Handle container drag over
  const handleContainerDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isDragging) {
      return;
    }

    setIsOverContainer(true);

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }, [isDragging]);

  // Handle container drop
  const handleContainerDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isDragging || !allowCrossContainer) {
      return;
    }

    setIsOverContainer(false);

    // Handle cross-container drop logic here
    console.log('📦 Container drop:', containerId);
  }, [isDragging, allowCrossContainer, containerId]);

  // Handle container drag leave
  const handleContainerDragLeave = useCallback((e) => {
    if (!containerRef.current) {
      return;
    }

    // Check if leaving the container
    const rect = containerRef.current.getBoundingClientRect();
    const isLeaving = (
      e.clientX <= rect.left ||
            e.clientX >= rect.right ||
            e.clientY <= rect.top ||
            e.clientY >= rect.bottom
    );

    if (isLeaving) {
      setIsOverContainer(false);
    }
  }, []);

  // Register item ref
  const registerItemRef = useCallback((id, element) => {
    if (element) {
      itemRefs.current.set(id, element);
    } else {
      itemRefs.current.delete(id);
    }
  }, []);

  // Get item style for dragging
  const getItemStyle = useCallback((itemId, index) => {
    const isDragged = itemId === draggingId;
    const isPlaceholder = placeholderIndex === index;

    const styles = {
      transition: isDragged ? 'none' : `transform ${animationDuration}ms ease, opacity ${animationDuration}ms ease`,
      cursor: disableDrag ? 'default' : 'grab',
      userSelect: 'none',
      position: 'relative'
    };

    if (isDragged) {
      return {
        ...styles,
        opacity: 0.4,
        transform: 'scale(0.98)',
        cursor: 'grabbing'
      };
    }

    if (isPlaceholder) {
      return {
        ...styles,
        height: '60px',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        border: '2px dashed rgba(99, 102, 241, 0.5)',
        borderRadius: '8px',
        margin: '8px 0'
      };
    }

    return styles;
  }, [draggingId, placeholderIndex, animationDuration, disableDrag]);

  // Get container style
  const getContainerStyle = useCallback(() => {
    return {
      position: 'relative',
      minHeight: '100px',
      transition: `background-color ${animationDuration}ms ease`,
      backgroundColor: isOverContainer ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
      border: isOverContainer ? '2px dashed rgba(99, 102, 241, 0.3)' : 'none',
      borderRadius: isOverContainer ? '12px' : '0'
    };
  }, [isOverContainer, animationDuration]);

  // Move item
  const moveItem = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 ||
            fromIndex >= items.length || toIndex >= items.length) {
      return items;
    }

    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);

    setItems(newItems);

    if (onReorder) {
      onReorder(newItems, {
        fromIndex,
        toIndex,
        containerId
      });
    }

    return newItems;
  }, [items, onReorder, containerId]);

  // Swap items
  const swapItems = useCallback((indexA, indexB) => {
    if (indexA === indexB || indexA < 0 || indexB < 0 ||
            indexA >= items.length || indexB >= items.length) {
      return items;
    }

    const newItems = [...items];
    [newItems[indexA], newItems[indexB]] = [newItems[indexB], newItems[indexA]];

    setItems(newItems);

    if (onReorder) {
      onReorder(newItems, {
        indexA,
        indexB,
        containerId
      });
    }

    return newItems;
  }, [items, onReorder, containerId]);

  // Add item
  const addItem = useCallback((item, index = items.length) => {
    const newItems = [...items];
    newItems.splice(index, 0, item);
    setItems(newItems);
    return newItems;
  }, [items]);

  // Remove item
  const removeItem = useCallback((index) => {
    if (index < 0 || index >= items.length) {
      return items;
    }

    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    return newItems;
  }, [items]);

  // Update item
  const updateItem = useCallback((index, updates) => {
    if (index < 0 || index >= items.length) {
      return items;
    }

    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    setItems(newItems);
    return newItems;
  }, [items]);

  // Get drag info
  const getDragInfo = useCallback(() => ({
    isDragging,
    draggingId,
    dragOverId,
    dragPosition,
    placeholderIndex,
    isOverContainer,
    containerId
  }), [isDragging, draggingId, dragOverId, dragPosition, placeholderIndex, isOverContainer, containerId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (dragImageRef.current && document.body.contains(dragImageRef.current)) {
        document.body.removeChild(dragImageRef.current);
      }
    };
  }, []);

  return {
    // State
    items,
    isDragging,
    draggingId,
    dragOverId,
    placeholderIndex,
    isOverContainer,

    // Refs
    containerRef,
    itemRefs,

    // Event handlers
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleContainerDragOver,
    handleContainerDrop,
    handleContainerDragLeave,

    // Item management
    registerItemRef,
    moveItem,
    swapItems,
    addItem,
    removeItem,
    updateItem,

    // Styles
    getItemStyle,
    getContainerStyle,

    // Info
    getDragInfo,
    getItemIndex,

    // Reset
    resetDragState,

    // Direct setter (use with caution)
    setItems
  };
};

// Helper hook for touch support
export const useTouchDragAndDrop = (initialItems = [], onReorder = null, options = {}) => {
  const {
    dragHandleSelector = '.drag-handle',
    vibration = true,
    ...restOptions
  } = options;

  const dragAndDrop = useDragAndDrop(initialItems, onReorder, {
    ...restOptions,
    dragHandleSelector
  });

  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    containerRef,
    registerItemRef
  } = dragAndDrop;

  // Touch event handlers
  const handleTouchStart = useCallback((e, itemId, index) => {
    if (vibration && navigator.vibrate) {
      navigator.vibrate(50);
    }

    const touch = e.touches[0];
    const syntheticEvent = {
      ...e,
      clientX: touch.clientX,
      clientY: touch.clientY,
      currentTarget: e.currentTarget,
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation()
    };

    handleDragStart(syntheticEvent, itemId, index);
  }, [handleDragStart, vibration]);

  const handleTouchMove = useCallback((e) => {
    if (!dragAndDrop.isDragging) {
      return;
    }

    const touch = e.touches[0];
    const syntheticEvent = {
      ...e,
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation()
    };

    // Find element under touch
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element) {
      const itemElement = element.closest('[data-drag-item]');
      if (itemElement) {
        const itemId = itemElement.dataset.dragItemId;
        const itemIndex = parseInt(itemElement.dataset.dragItemIndex);

        if (itemId && !isNaN(itemIndex)) {
          handleDragOver(syntheticEvent, itemId, itemIndex);
        }
      }
    }
  }, [dragAndDrop.isDragging, handleDragOver]);

  const handleTouchEnd = useCallback((e) => {
    if (!dragAndDrop.isDragging) {
      return;
    }

    const touch = e.changedTouches[0];
    const syntheticEvent = {
      ...e,
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation()
    };

    // Find drop target
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element) {
      const itemElement = element.closest('[data-drag-item]');
      if (itemElement) {
        const itemId = itemElement.dataset.dragItemId;
        const itemIndex = parseInt(itemElement.dataset.dragItemIndex);

        if (itemId && !isNaN(itemIndex)) {
          handleDrop(syntheticEvent, itemId, itemIndex);
        } else {
          handleDragEnd(syntheticEvent);
        }
      } else {
        handleDragEnd(syntheticEvent);
      }
    } else {
      handleDragEnd(syntheticEvent);
    }
  }, [dragAndDrop.isDragging, handleDrop, handleDragEnd]);

  // Add touch event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleContainerTouchMove = (e) => {
      if (dragAndDrop.isDragging) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchmove', handleContainerTouchMove, { passive: false });

    return () => {
      container.removeEventListener('touchmove', handleContainerTouchMove);
    };
  }, [containerRef, dragAndDrop.isDragging]);

  return {
    ...dragAndDrop,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,

    // Combined handlers for components
    getTouchHandlers: (itemId, index) => ({
      onTouchStart: (e) => handleTouchStart(e, itemId, index),
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleDragEnd
    })
  };
};

// Higher-order hook for multiple containers
export const useMultiContainerDragAndDrop = (containers = {}) => {
  const [activeContainers, setActiveContainers] = useState(containers);

  const moveBetweenContainers = useCallback((fromContainerId, toContainerId, itemId, toIndex = 0) => {
    const fromContainer = activeContainers[fromContainerId];
    const toContainer = activeContainers[toContainerId];

    if (!fromContainer || !toContainer) {
      return;
    }

    // Find item in source container
    const itemIndex = fromContainer.findIndex(item =>
      item.id === itemId || item._id === itemId
    );

    if (itemIndex === -1) {
      return;
    }

    // Remove from source
    const [movedItem] = fromContainer.splice(itemIndex, 1);

    // Add to target
    toContainer.splice(toIndex, 0, movedItem);

    // Update containers
    setActiveContainers({
      ...activeContainers,
      [fromContainerId]: [...fromContainer],
      [toContainerId]: [...toContainer]
    });

    return {
      fromContainer: [...fromContainer],
      toContainer: [...toContainer],
      movedItem
    };
  }, [activeContainers]);

  const getContainer = useCallback((containerId) => {
    return activeContainers[containerId] || [];
  }, [activeContainers]);

  const setContainer = useCallback((containerId, items) => {
    setActiveContainers(prev => ({
      ...prev,
      [containerId]: items
    }));
  }, []);

  return {
    containers: activeContainers,
    moveBetweenContainers,
    getContainer,
    setContainer,
    setActiveContainers
  };
};