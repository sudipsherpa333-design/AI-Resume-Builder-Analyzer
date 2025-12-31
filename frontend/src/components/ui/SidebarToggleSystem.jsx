// src/components/ui/SidebarToggleSystem.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    PanelLeft,
    PanelRight,
    Sidebar,
    SidebarClose,
    Brain,
    Zap,
    Maximize2,
    Minimize2,
    Expand,
    Shrink,
    ChevronLeft,
    ChevronRight,
    X,
    Menu,
    Eye,
    EyeOff,
    Save,
    Download,
    Printer,
    Share2,
    Settings,
    HelpCircle,
    ArrowLeft,
    ArrowRight,
    Home,
    LayoutGrid,
    Search,
    Plus,
    Minus,
    Target,
    Star,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    Shield,
    PanelLeftClose,
    PanelRightClose,
    Layout,
    Grid3x3,
    Columns,
    Rows,
    Split,
    Merge,
    FlipHorizontal,
    FlipVertical,
    RotateCw,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Focus,
    MousePointer,
    Move,
    Edit,
    Type,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    Indent,
    Outdent,
    Link,
    Image,
    Table,
    Code,
    Terminal,
    FileCode,
    Palette,
    Brush,
    Layers,
    Filter,
    Sliders,
    ToggleLeft,
    ToggleRight,
    Power,
    Battery,
    BatteryCharging,
    Wifi,
    WifiOff,
    Cloud,
    CloudOff,
    Moon,
    Sun,
    Bell,
    BellOff,
    Volume2,
    VolumeX,
    Mic,
    MicOff,
    Video,
    VideoOff,
    Headphones,
    Speaker,
    Smartphone,
    Tablet,
    Monitor,
    Cast,
    Bluetooth,
    Radio,
    Cpu,
    HardDrive,
    MemoryStick,
    Server,
    Database,
    Network,
    Router,
    Globe,
    Map,
    Navigation,
    Compass,
    Mail,
    Inbox,
    Send,
    MessageSquare,
    Phone,
    Calendar,
    Clock,
    User,
    Users,
    UserPlus,
    UserMinus,
    UserCheck,
    Heart,
    ThumbsUp,
    Award,
    Trophy,
    Crown,
    Flag,
    Book,
    BookOpen,
    GraduationCap,
    Briefcase,
    ShoppingCart,
    Package,
    Truck,
    Building,
    Store,
    Hospital,
    School,
    Coffee,
    Utensils,
    Car,
    Bike,
    Plane,
    Train,
    Ship,
    Rocket,
    Satellite,
    Telescope,
    Microscope,
    Flask,
    Beaker,
    Atom,
    Leaf,
    Tree,
    Flower,
    Mountain,
    Waves,
    CloudRain,
    CloudSnow,
    CloudLightning,
    Snowflake,
    Umbrella,
    Thermometer,
    Wind,
    Droplet,
    Sunrise,
    Sunset,
    Sparkles,
    Play,
    Users as UsersIcon
} from 'lucide-react';

// ============================
// 1. ENHANCED TOGGLE BUTTON COMPONENT
// ============================
export const ToggleButton = React.memo(({
    isOn = false,
    onToggle = () => { },
    size = 'md',
    variant = 'default',
    disabled = false,
    loading = false,
    pulse = false,
    glow = false,
    rounded = 'full',
    iconOn = null,
    iconOff = null,
    showIcon = true,
    showLabel = false,
    labelOn = 'ON',
    labelOff = 'OFF',
    className = '',
    tooltip = '',
    ariaLabel = '',
    animate = true
}) => {
    const [isPressed, setIsPressed] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const sizeClasses = {
        xs: 'w-8 h-4',
        sm: 'w-10 h-5',
        md: 'w-12 h-6',
        lg: 'w-16 h-8',
        xl: 'w-20 h-10'
    };

    const knobSizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-7 h-7',
        xl: 'w-9 h-9'
    };

    const iconSizeClasses = {
        xs: 'w-2 h-2',
        sm: 'w-2.5 h-2.5',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
        xl: 'w-5 h-5'
    };

    const variantClasses = {
        default: {
            bg: isOn ? 'bg-blue-600' : 'bg-gray-300',
            hover: isOn ? 'hover:bg-blue-700' : 'hover:bg-gray-400',
            active: isOn ? 'active:bg-blue-800' : 'active:bg-gray-500',
            knob: 'bg-white',
            border: isOn ? 'border-blue-700' : 'border-gray-400',
            shadow: isOn ? 'shadow-blue-500/20' : 'shadow-gray-400/20'
        },
        primary: {
            bg: isOn ? 'bg-purple-600' : 'bg-gray-300',
            hover: isOn ? 'hover:bg-purple-700' : 'hover:bg-gray-400',
            active: isOn ? 'active:bg-purple-800' : 'active:bg-gray-500',
            knob: 'bg-white',
            border: isOn ? 'border-purple-700' : 'border-gray-400',
            shadow: isOn ? 'shadow-purple-500/20' : 'shadow-gray-400/20'
        },
        success: {
            bg: isOn ? 'bg-green-600' : 'bg-gray-300',
            hover: isOn ? 'hover:bg-green-700' : 'hover:bg-gray-400',
            active: isOn ? 'active:bg-green-800' : 'active:bg-gray-500',
            knob: 'bg-white',
            border: isOn ? 'border-green-700' : 'border-gray-400',
            shadow: isOn ? 'shadow-green-500/20' : 'shadow-gray-400/20'
        },
        warning: {
            bg: isOn ? 'bg-yellow-600' : 'bg-gray-300',
            hover: isOn ? 'hover:bg-yellow-700' : 'hover:bg-gray-400',
            active: isOn ? 'active:bg-yellow-800' : 'active:bg-gray-500',
            knob: 'bg-white',
            border: isOn ? 'border-yellow-700' : 'border-gray-400',
            shadow: isOn ? 'shadow-yellow-500/20' : 'shadow-gray-400/20'
        },
        danger: {
            bg: isOn ? 'bg-red-600' : 'bg-gray-300',
            hover: isOn ? 'hover:bg-red-700' : 'hover:bg-gray-400',
            active: isOn ? 'active:bg-red-800' : 'active:bg-gray-500',
            knob: 'bg-white',
            border: isOn ? 'border-red-700' : 'border-gray-400',
            shadow: isOn ? 'shadow-red-500/20' : 'shadow-gray-400/20'
        },
        gradient: {
            bg: isOn ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-gray-300 to-gray-400',
            hover: isOn ? 'hover:from-purple-700 hover:to-pink-700' : 'hover:from-gray-400 hover:to-gray-500',
            active: isOn ? 'active:from-purple-800 active:to-pink-800' : 'active:from-gray-500 active:to-gray-600',
            knob: 'bg-white',
            border: isOn ? 'border-purple-700' : 'border-gray-400',
            shadow: isOn ? 'shadow-purple-500/20' : 'shadow-gray-400/20'
        },
        dark: {
            bg: isOn ? 'bg-gray-900' : 'bg-gray-300',
            hover: isOn ? 'hover:bg-black' : 'hover:bg-gray-400',
            active: isOn ? 'active:bg-black' : 'active:bg-gray-500',
            knob: 'bg-white',
            border: isOn ? 'border-gray-900' : 'border-gray-400',
            shadow: isOn ? 'shadow-gray-900/20' : 'shadow-gray-400/20'
        }
    };

    const roundedClasses = {
        full: 'rounded-full',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        none: 'rounded-none'
    };

    const currentVariant = variantClasses[variant] || variantClasses.default;
    const currentRounded = roundedClasses[rounded];
    const currentSize = sizeClasses[size];
    const currentKnobSize = knobSizeClasses[size];
    const currentIconSize = iconSizeClasses[size];

    const handleClick = (e) => {
        if (!disabled && !loading) {
            e.preventDefault();
            e.stopPropagation();
            onToggle(!isOn);
            if (tooltip) {
                toast.success(isOn ? `${tooltip} disabled` : `${tooltip} enabled`, {
                    icon: isOn ? '🔴' : '🟢',
                    duration: 1500
                });
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
        }
    };

    const handleMouseEnter = () => {
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);

    const renderIcon = () => {
        if (!showIcon) return null;

        const icon = isOn ? iconOn : iconOff;
        if (!icon) return null;

        return React.cloneElement(icon, {
            className: `${currentIconSize} ${isOn ? 'text-white' : 'text-gray-600'} transition-opacity duration-200`
        });
    };

    const renderLabel = () => {
        if (!showLabel) return null;

        return (
            <span className={`text-xs font-medium absolute top-1/2 transform -translate-y-1/2 ${isOn ? 'left-1.5 text-white' : 'right-1.5 text-gray-600'}`}>
                {isOn ? labelOn : labelOff}
            </span>
        );
    };

    return (
        <div className="relative inline-block">
            {/* Tooltip */}
            <AnimatePresence>
                {showTooltip && tooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
                    >
                        <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
                            {tooltip}
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Container */}
            <button
                type="button"
                role="switch"
                aria-checked={isOn}
                aria-label={ariaLabel || tooltip || 'Toggle'}
                disabled={disabled || loading}
                onClick={handleClick}
                onKeyDown={handleKeyPress}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
                className={`
                    relative inline-flex items-center cursor-pointer transition-all duration-200 ease-in-out
                    ${currentSize}
                    ${currentVariant.bg}
                    ${currentVariant.border}
                    ${!disabled && currentVariant.hover}
                    ${currentRounded}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${loading ? 'cursor-wait' : ''}
                    ${pulse && isOn ? 'animate-pulse' : ''}
                    ${glow && isOn ? 'ring-2 ring-offset-2 ring-opacity-50 ring-current' : ''}
                    ${isPressed ? 'scale-95' : ''}
                    border-2
                    shadow-lg
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    ${className}
                `}
            >
                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                    </div>
                )}

                {/* Toggle Knob */}
                <motion.span
                    layout
                    transition={animate ? {
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                    } : { duration: 0.2 }}
                    className={`
                        absolute inline-block transform transition-all duration-200 ease-in-out
                        ${currentKnobSize}
                        ${currentVariant.knob}
                        ${currentRounded}
                        shadow-lg
                        flex items-center justify-center
                        ${isOn ?
                            size === 'xs' ? 'translate-x-5' :
                                size === 'sm' ? 'translate-x-6' :
                                    size === 'md' ? 'translate-x-7' :
                                        size === 'lg' ? 'translate-x-9' : 'translate-x-11'
                            : 'translate-x-0.5'
                        }
                    `}
                >
                    {/* Glow effect */}
                    {glow && isOn && (
                        <motion.div
                            className="absolute inset-0 rounded-full bg-current opacity-20"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    )}

                    {/* Icon inside knob */}
                    {renderIcon()}
                </motion.span>

                {/* Labels */}
                {renderLabel()}
            </button>
        </div>
    );
});

// Pre-configured toggle button variants
ToggleButton.AI = (props) => (
    <ToggleButton
        variant="gradient"
        iconOn={<Brain className="w-4 h-4" />}
        iconOff={<Brain className="w-4 h-4" />}
        pulse={props.isOn}
        glow={props.isOn}
        {...props}
    />
);

ToggleButton.Sidebar = (props) => (
    <ToggleButton
        variant="primary"
        iconOn={<PanelRightClose className="w-4 h-4" />}
        iconOff={<PanelRight className="w-4 h-4" />}
        {...props}
    />
);

ToggleButton.DarkMode = (props) => (
    <ToggleButton
        variant="dark"
        iconOn={<Moon className="w-4 h-4" />}
        iconOff={<Sun className="w-4 h-4" />}
        {...props}
    />
);

ToggleButton.AutoSave = (props) => (
    <ToggleButton
        variant="success"
        iconOn={<Save className="w-4 h-4" />}
        iconOff={<CloudOff className="w-4 h-4" />}
        {...props}
    />
);

ToggleButton.Notifications = (props) => (
    <ToggleButton
        variant="warning"
        iconOn={<Bell className="w-4 h-4" />}
        iconOff={<BellOff className="w-4 h-4" />}
        {...props}
    />
);

ToggleButton.Wifi = (props) => (
    <ToggleButton
        variant="default"
        iconOn={<Wifi className="w-4 h-4" />}
        iconOff={<WifiOff className="w-4 h-4" />}
        {...props}
    />
);

ToggleButton.CloudSync = (props) => (
    <ToggleButton
        variant="primary"
        iconOn={<Cloud className="w-4 h-4" />}
        iconOff={<CloudOff className="w-4 h-4" />}
        {...props}
    />
);

ToggleButton.BatterySaver = (props) => (
    <ToggleButton
        variant="success"
        iconOn={<BatteryCharging className="w-4 h-4" />}
        iconOff={<Battery className="w-4 h-4" />}
        {...props}
    />
);

ToggleButton.Accessibility = (props) => (
    <ToggleButton
        variant="primary"
        iconOn={<Eye className="w-4 h-4" />}
        iconOff={<EyeOff className="w-4 h-4" />}
        {...props}
    />
);

ToggleButton.Performance = (props) => (
    <ToggleButton
        variant="warning"
        iconOn={<Zap className="w-4 h-4" />}
        iconOff={<Zap className="w-4 h-4" />}
        {...props}
    />
);

ToggleButton.Security = (props) => (
    <ToggleButton
        variant="danger"
        iconOn={<Shield className="w-4 h-4" />}
        iconOff={<Shield className="w-4 h-4" />}
        {...props}
    />
);

ToggleButton.Audio = (props) => (
    <ToggleButton
        variant="default"
        iconOn={<Volume2 className="w-4 h-4" />}
        iconOff={<VolumeX className="w-4 h-4" />}
        {...props}
    />
);

// ============================
// 2. SIDEBAR TOGGLE BUTTONS COMPONENT
// ============================
export const SidebarToggleButtons = ({
    leftSidebarOpen,
    rightSidebarOpen,
    onToggleLeft,
    onToggleRight,
    onMaximizeEditor,
    onRestoreSidebars,
    isFullscreen,
    onToggleFullscreen,
    isMobile,
    aiCredits,
    onSave,
    onExport,
    onPrint,
    onShare,
    isSaving,
    isExporting,
    onSettings,
    onHelp
}) => {
    // Desktop floating controls
    const DesktopControls = () => (
        <div className="fixed top-24 left-4 z-50 flex flex-col gap-4">
            {/* Left Sidebar Toggle */}
            <div className="flex flex-col gap-2">
                <div className="text-xs text-gray-500 font-medium ml-1">Navigation</div>
                <ToggleButton.Sidebar
                    isOn={leftSidebarOpen}
                    onToggle={onToggleLeft}
                    size="lg"
                    glow={leftSidebarOpen}
                    tooltip="Navigation Sidebar"
                    ariaLabel="Toggle navigation sidebar"
                    showLabel
                    labelOn="Visible"
                    labelOff="Hidden"
                />
            </div>

            {/* Right Sidebar Toggle */}
            <div className="flex flex-col gap-2">
                <div className="text-xs text-gray-500 font-medium ml-1">AI Assistant</div>
                <ToggleButton.AI
                    isOn={rightSidebarOpen}
                    onToggle={onToggleRight}
                    size="lg"
                    glow={rightSidebarOpen}
                    pulse={rightSidebarOpen}
                    tooltip="AI Assistant"
                    ariaLabel="Toggle AI assistant"
                    showLabel
                    labelOn="Active"
                    labelOff="Hidden"
                />
            </div>

            {/* Layout Controls */}
            <div className="bg-white rounded-xl shadow-xl border-2 border-gray-300 p-3 mt-2">
                <div className="flex flex-col gap-2">
                    <div className="text-xs text-gray-500 font-medium">Layout</div>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onMaximizeEditor}
                            className="flex-1 p-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 flex items-center justify-center gap-2"
                            title="Maximize Editor (Ctrl+1)"
                        >
                            <Expand size={16} />
                            <span className="text-xs">Maximize</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onRestoreSidebars}
                            className="flex-1 p-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 flex items-center justify-center gap-2"
                            title="Restore Sidebars (Ctrl+2)"
                        >
                            <Shrink size={16} />
                            <span className="text-xs">Restore</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Fullscreen Toggle */}
            <div className="flex flex-col gap-2">
                <div className="text-xs text-gray-500 font-medium ml-1">Display</div>
                <ToggleButton
                    isOn={isFullscreen}
                    onToggle={onToggleFullscreen}
                    variant="warning"
                    iconOn={<Minimize2 className="w-4 h-4" />}
                    iconOff={<Maximize2 className="w-4 h-4" />}
                    size="lg"
                    pulse={isFullscreen}
                    tooltip="Fullscreen Mode"
                    ariaLabel="Toggle fullscreen"
                    showLabel
                    labelOn="Full"
                    labelOff="Normal"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-xl border-2 border-gray-300 p-3">
                <div className="space-y-3">
                    <div className="text-xs text-gray-500 font-medium">Actions</div>
                    <div className="grid grid-cols-2 gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onSave}
                            disabled={isSaving}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex flex-col items-center gap-1"
                            title="Save Resume (Ctrl+S)"
                        >
                            {isSaving ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <Save size={14} />
                                </motion.div>
                            ) : (
                                <Save size={14} />
                            )}
                            <span className="text-xs">Save</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onExport}
                            disabled={isExporting}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors flex flex-col items-center gap-1"
                            title="Export PDF"
                        >
                            <Download size={14} />
                            <span className="text-xs">Export</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onPrint}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex flex-col items-center gap-1"
                            title="Print Resume"
                        >
                            <Printer size={14} />
                            <span className="text-xs">Print</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onShare}
                            className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors flex flex-col items-center gap-1"
                            title="Share Resume"
                        >
                            <Share2 size={14} />
                            <span className="text-xs">Share</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* AI Credits Display */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-100 rounded-xl shadow-lg border-2 border-yellow-200 p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Zap size={16} className="text-yellow-600 fill-yellow-500" />
                        <span className="text-xs font-medium text-gray-800">AI Credits</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-700">{aiCredits}</span>
                </div>
                <div className="w-full h-1.5 bg-yellow-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (aiCredits / 200) * 100)}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                    />
                </div>
                <div className="text-xs text-gray-600 mt-1">
                    {aiCredits < 50 ? "Low credits - consider purchasing more" : "Credits available for AI features"}
                </div>
            </div>

            {/* Help Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onHelp}
                className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2"
                title="Help & Shortcuts (?)"
            >
                <HelpCircle size={16} />
                <span className="text-xs">Help</span>
            </motion.button>
        </div>
    );

    // Mobile bottom controls
    const MobileControls = () => (
        <div className="fixed bottom-4 left-4 right-4 z-50">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-300 p-3">
                <div className="flex items-center justify-between">
                    {/* Left side: Sidebar toggles */}
                    <div className="flex items-center gap-2">
                        <ToggleButton.Sidebar
                            isOn={leftSidebarOpen}
                            onToggle={onToggleLeft}
                            size="md"
                            showIcon={true}
                            showLabel={false}
                            animate={false}
                        />
                        <ToggleButton.AI
                            isOn={rightSidebarOpen}
                            onToggle={onToggleRight}
                            size="md"
                            showIcon={true}
                            showLabel={false}
                            animate={false}
                        />
                    </div>

                    {/* Center: Save and Export */}
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={onSave}
                            disabled={isSaving}
                            className={`px-3 py-2 rounded-lg flex items-center gap-2 ${isSaving
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {isSaving ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <Save size={16} />
                                </motion.div>
                            ) : (
                                <Save size={16} />
                            )}
                            <span className="text-sm font-medium">Save</span>
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={onExport}
                            disabled={isExporting}
                            className="px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
                        >
                            <Download size={16} />
                            <span className="text-sm font-medium">Export</span>
                        </motion.button>
                    </div>

                    {/* Right side: Extra actions */}
                    <div className="flex items-center gap-1">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={onToggleFullscreen}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                        >
                            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={onHelp}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <HelpCircle size={20} />
                        </motion.button>
                    </div>
                </div>

                {/* Mobile AI Credits */}
                <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="text-yellow-600 fill-yellow-500" />
                            <span className="text-xs font-medium text-gray-700">AI Credits: {aiCredits}</span>
                        </div>
                        <div className="w-24 h-1.5 bg-yellow-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                                style={{ width: `${Math.min(100, (aiCredits / 200) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isMobile) {
        return <MobileControls />;
    }

    return <DesktopControls />;
};

// ============================
// 3. SIDEBAR OVERLAY SYSTEM
// ============================
export const SidebarOverlaySystem = ({
    leftSidebarOpen,
    rightSidebarOpen,
    isMobile,
    onCloseAll
}) => {
    return (
        <AnimatePresence>
            {(leftSidebarOpen || rightSidebarOpen) && isMobile && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCloseAll}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                />
            )}
        </AnimatePresence>
    );
};

// ============================
// 4. EDITOR CONTROLS COMPONENT
// ============================
export const EditorControls = ({
    zoomLevel,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    showProgress,
    onToggleProgress,
    activeSection,
    completedSections,
    sections,
    onNavigateSection,
    stats
}) => {
    const activeSectionData = sections?.find(s => s.id === activeSection);
    const isLastSection = activeSection === sections?.[sections?.length - 1]?.id;
    const isFirstSection = activeSection === sections?.[0]?.id;

    return (
        <div className="fixed top-20 right-4 z-40 hidden md:flex flex-col gap-4">
            {/* Zoom Controls */}
            <div className="bg-white rounded-xl shadow-xl border-2 border-gray-300 p-3">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">Zoom</span>
                        <span className="text-sm font-bold text-gray-700">{zoomLevel}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onZoomOut}
                            className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center"
                            title="Zoom Out"
                        >
                            <Minus size={14} />
                        </button>
                        <button
                            onClick={onZoomReset}
                            className="flex-1 p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center justify-center"
                            title="Reset Zoom"
                        >
                            <Search size={14} />
                        </button>
                        <button
                            onClick={onZoomIn}
                            className="flex-1 p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors flex items-center justify-center"
                            title="Zoom In"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Toggle */}
            <div className="bg-white rounded-xl shadow-xl border-2 border-gray-300 p-3">
                <div className="space-y-3">
                    <div className="text-xs text-gray-500 font-medium">Progress Display</div>
                    <ToggleButton
                        isOn={showProgress}
                        onToggle={onToggleProgress}
                        variant={showProgress ? "success" : "default"}
                        iconOn={<EyeOff className="w-4 h-4" />}
                        iconOff={<Eye className="w-4 h-4" />}
                        size="lg"
                        showLabel={true}
                        labelOn="Hidden"
                        labelOff="Visible"
                        tooltip="Toggle Progress Display"
                    />
                </div>
            </div>

            {/* Quick Navigation */}
            <div className="bg-white rounded-xl shadow-xl border-2 border-blue-300 p-3">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {activeSectionData?.icon && React.createElement(activeSectionData.icon, {
                                size: 16,
                                className: "text-blue-600"
                            })}
                            <span className="text-sm font-medium text-gray-900">
                                {activeSectionData?.label || activeSection}
                            </span>
                        </div>
                        <span className="text-xs text-gray-500">
                            {sections?.findIndex(s => s.id === activeSection) + 1}/{sections?.length}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={() => onNavigateSection('prev')}
                            disabled={isFirstSection}
                            className={`flex-1 p-2 rounded-lg text-sm flex items-center justify-center gap-1 ${isFirstSection
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            title="Previous Section"
                        >
                            <ArrowLeft size={14} />
                            <span>Prev</span>
                        </button>

                        <div className="flex-1">
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                                    style={{ width: `${stats?.completeness || 0}%` }}
                                />
                            </div>
                            <div className="text-xs text-center text-gray-600 mt-1">
                                {stats?.completeness || 0}%
                            </div>
                        </div>

                        <button
                            onClick={() => onNavigateSection('next')}
                            disabled={isLastSection}
                            className={`flex-1 p-2 rounded-lg text-sm flex items-center justify-center gap-1 ${isLastSection
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            title="Next Section"
                        >
                            <span>Next</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg border-2 border-blue-200 p-3">
                <div className="space-y-2">
                    <div className="text-xs text-gray-500 font-medium">Stats</div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Progress</span>
                            <span className="text-sm font-bold text-blue-700">{stats?.completeness || 0}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Sections</span>
                            <span className="text-sm font-bold text-green-700">
                                {completedSections?.length || 0}/{sections?.length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">ATS Score</span>
                            <span className="text-sm font-bold text-purple-700">{stats?.atsScore || 85}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Words</span>
                            <span className="text-sm font-bold text-orange-700">{stats?.wordCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================
// 5. KEYBOARD SHORTCUTS HELPER
// ============================
export const useSidebarKeyboardShortcuts = ({
    leftSidebarOpen,
    rightSidebarOpen,
    isFullscreen,
    onToggleLeft,
    onToggleRight,
    onMaximizeEditor,
    onRestoreSidebars,
    onSave,
    onHelp
}) => {
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Don't trigger shortcuts when user is typing
            if (e.target.tagName === 'INPUT' ||
                e.target.tagName === 'TEXTAREA' ||
                e.target.isContentEditable) {
                return;
            }

            // Ctrl/Cmd + L to toggle left sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                onToggleLeft();
                toast.success(
                    leftSidebarOpen ? 'Navigation sidebar hidden' : 'Navigation sidebar shown',
                    {
                        icon: leftSidebarOpen ? '←' : '→',
                        duration: 1000,
                        position: 'top-right'
                    }
                );
            }

            // Ctrl/Cmd + R to toggle right sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                onToggleRight();
                toast.success(
                    rightSidebarOpen ? 'AI Assistant hidden' : 'AI Assistant shown',
                    {
                        icon: rightSidebarOpen ? '←' : '→',
                        duration: 1000,
                        position: 'top-right'
                    }
                );
            }

            // Ctrl/Cmd + 1 to maximize editor
            if ((e.ctrlKey || e.metaKey) && e.key === '1') {
                e.preventDefault();
                onMaximizeEditor();
                toast.success('Editor maximized', {
                    icon: '📝',
                    duration: 1500
                });
            }

            // Ctrl/Cmd + 2 to restore sidebars
            if ((e.ctrlKey || e.metaKey) && e.key === '2') {
                e.preventDefault();
                onRestoreSidebars();
                toast.info('Sidebars restored', {
                    icon: '↔️',
                    duration: 1500
                });
            }

            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                onSave();
            }

            // ? for help
            if (e.key === '?') {
                e.preventDefault();
                onHelp();
            }

            // Escape to close sidebars on mobile
            if (e.key === 'Escape' && (leftSidebarOpen || rightSidebarOpen)) {
                if (leftSidebarOpen) onToggleLeft();
                if (rightSidebarOpen) onToggleRight();
                toast.info('Sidebars closed', {
                    icon: '❌',
                    duration: 1000
                });
            }

            // F11 for fullscreen
            if (e.key === 'F11') {
                e.preventDefault();
                // Browser handles F11 natively
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [leftSidebarOpen, rightSidebarOpen, isFullscreen, onToggleLeft, onToggleRight, onMaximizeEditor, onRestoreSidebars, onSave, onHelp]);
};

// ============================
// 6. MOBILE TOGGLE HANDLER
// ============================
export const useMobileToggleHandler = ({
    isMobile,
    leftSidebarOpen,
    rightSidebarOpen,
    onToggleLeft,
    onToggleRight
}) => {
    useEffect(() => {
        const handleMobileToggle = () => {
            // On mobile, close sidebars when switching between them
            if (isMobile) {
                if (leftSidebarOpen && !rightSidebarOpen) {
                    // If left is open and we're toggling right, close left first
                    onToggleLeft();
                } else if (rightSidebarOpen && !leftSidebarOpen) {
                    // If right is open and we're toggling left, close right first
                    onToggleRight();
                }
            }
        };

        // This would be connected to actual toggle events in your app
        if (isMobile) {
            const handleLeftToggle = () => handleMobileToggle();
            const handleRightToggle = () => handleMobileToggle();

            // Simulate event listeners
            const simulateEvent = () => {
                // Your event handling logic here
            };

            return () => {
                // Cleanup
            };
        }
    }, [isMobile, leftSidebarOpen, rightSidebarOpen, onToggleLeft, onToggleRight]);
};

// ============================
// 7. SIDEBAR STATE MANAGER
// ============================
export const useSidebarStateManager = (initialState = { left: true, right: true }) => {
    const [sidebarStates, setSidebarStates] = useState(initialState);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleLeft = useCallback(() => {
        setSidebarStates(prev => ({
            ...prev,
            left: !prev.left
        }));
    }, []);

    const toggleRight = useCallback(() => {
        setSidebarStates(prev => ({
            ...prev,
            right: !prev.right
        }));
    }, []);

    const maximizeEditor = useCallback(() => {
        setSidebarStates({ left: false, right: false });
    }, []);

    const restoreSidebars = useCallback(() => {
        if (!isMobile) {
            setSidebarStates({ left: true, right: true });
        }
    }, [isMobile]);

    const closeAll = useCallback(() => {
        setSidebarStates({ left: false, right: false });
    }, []);

    return {
        leftSidebarOpen: sidebarStates.left,
        rightSidebarOpen: sidebarStates.right,
        isMobile,
        toggleLeft,
        toggleRight,
        maximizeEditor,
        restoreSidebars,
        closeAll
    };
};

// ============================
// 8. PROGRESS INDICATOR COMPONENT
// ============================
export const ProgressIndicator = ({
    progress,
    size = 'md',
    showLabel = true,
    showPercentage = true,
    color = 'blue'
}) => {
    const sizes = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3'
    };

    const colors = {
        blue: 'from-blue-500 to-purple-500',
        green: 'from-green-500 to-emerald-500',
        purple: 'from-purple-500 to-pink-500',
        orange: 'from-orange-500 to-red-500',
        gradient: 'from-blue-500 via-purple-500 to-pink-500'
    };

    const height = sizes[size];
    const gradient = colors[color];

    return (
        <div className="space-y-1">
            {showLabel && (
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Progress</span>
                    {showPercentage && (
                        <span className="text-xs font-medium text-gray-700">{progress}%</span>
                    )}
                </div>
            )}
            <div className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                />
            </div>
        </div>
    );
};

// ============================
// 9. SIDEBAR HEADER COMPONENT
// ============================
export const SidebarHeader = ({
    title,
    subtitle,
    onClose,
    showCloseButton = true,
    icon: Icon
}) => {
    return (
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                    )}
                    <div>
                        <h1 className="font-bold text-gray-900 text-base">{title}</h1>
                        {subtitle && (
                            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>
                {showCloseButton && (
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                )}
            </div>
        </div>
    );
};

// ============================
// 10. QUICK ACTIONS BAR
// ============================
export const QuickActionsBar = ({
    actions = [],
    isMobile = false
}) => {
    if (actions.length === 0) return null;

    return (
        <div className={`${isMobile ? 'fixed bottom-4 left-4 right-4' : 'absolute bottom-4 left-4 right-4'} z-40`}>
            <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-gray-300 p-3">
                <div className="grid grid-cols-3 gap-2">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            title={action.title}
                        >
                            <div className={`p-2 rounded-lg ${action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                action.color === 'green' ? 'bg-green-100 text-green-600' :
                                    action.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                        action.color === 'red' ? 'bg-red-100 text-red-600' :
                                            action.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-gray-100 text-gray-600'
                                }`}>
                                {action.icon}
                            </div>
                            <span className="text-xs font-medium text-gray-700">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default {
    ToggleButton,
    SidebarToggleButtons,
    SidebarOverlaySystem,
    EditorControls,
    useSidebarKeyboardShortcuts,
    useMobileToggleHandler,
    useSidebarStateManager,
    ProgressIndicator,
    SidebarHeader,
    QuickActionsBar
};