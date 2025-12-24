interface FeaturedBadgeProps {
    type: 'basic' | 'premium' | 'spotlight';
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge component to display on featured salon listings
 * Shows different styling based on the tier level
 */
export default function FeaturedBadge({ type, size = 'md' }: FeaturedBadgeProps) {
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5'
    };

    const typeStyles = {
        basic: {
            bg: 'bg-blue-500/90',
            text: 'text-white',
            icon: '✨',
            label: 'Featured'
        },
        premium: {
            bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
            text: 'text-white',
            icon: '💎',
            label: 'Premium'
        },
        spotlight: {
            bg: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500',
            text: 'text-white',
            icon: '⭐',
            label: 'Verified'
        }
    };

    const style = typeStyles[type];
    const sizeClass = sizeClasses[size];

    return (
        <span
            className={`inline-flex items-center gap-1 font-bold rounded-full backdrop-blur-sm shadow-lg ${style.bg} ${style.text} ${sizeClass}`}
        >
            <span>{style.icon}</span>
            <span>{style.label}</span>
        </span>
    );
}

/**
 * Card wrapper with featured styling
 * Wrap a salon card with this to give it the featured appearance
 */
export function FeaturedCardWrapper({
    children,
    type
}: {
    children: React.ReactNode;
    type: 'basic' | 'premium' | 'spotlight';
}) {
    const borderStyles = {
        basic: 'ring-2 ring-blue-400/50 hover:ring-blue-400/70',
        premium: 'ring-2 ring-purple-400/50 hover:ring-purple-400/70 shadow-lg shadow-purple-500/10',
        spotlight: 'ring-2 ring-amber-400/50 hover:ring-amber-400/70 shadow-xl shadow-amber-500/20'
    };

    return (
        <div className={`relative ${borderStyles[type]} rounded-xl transition-all`}>
            {/* Spotlight glow effect for top tier */}
            {type === 'spotlight' && (
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 via-amber-500/20 to-orange-500/20 rounded-xl blur-sm -z-10"></div>
            )}
            {children}
        </div>
    );
}
