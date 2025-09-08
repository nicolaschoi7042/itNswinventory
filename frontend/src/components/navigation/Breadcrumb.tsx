import {
  Breadcrumbs,
  Typography,
  Link,
  Box,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Skeleton,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';
import { ReactNode, Fragment } from 'react';

export interface BreadcrumbItem {
  id: string;
  label: string;
  path?: string;
  icon?: ReactNode;
  disabled?: boolean;
  tooltip?: string;
  badge?: number | string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  homeIcon?: ReactNode;
  homeLabel?: string;
  homePath?: string;
  onHomeClick?: () => void;
  onItemClick?: (item: BreadcrumbItem) => void;
  maxItems?: number;
  separator?: ReactNode;
  showBack?: boolean;
  onBackClick?: () => void;
  loading?: boolean;
  variant?: 'default' | 'compact' | 'outlined';
  sx?: any;
}

export function Breadcrumb({
  items,
  showHome = true,
  homeIcon = <HomeIcon fontSize="small" />,
  homeLabel = '홈',
  homePath = '/',
  onHomeClick,
  onItemClick,
  maxItems = 8,
  separator,
  showBack = false,
  onBackClick,
  loading = false,
  variant = 'default',
  sx,
}: BreadcrumbProps) {
  const theme = useTheme();

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.disabled) return;
    
    if (item.onClick) {
      item.onClick();
    } else if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else if (onItemClick) {
      onItemClick({
        id: 'home',
        label: homeLabel,
        path: homePath,
        icon: homeIcon,
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1, ...sx }}>
        <Skeleton variant="rectangular" width={24} height={24} />
        <Skeleton variant="text" width={60} />
        <NavigateNextIcon fontSize="small" color="disabled" />
        <Skeleton variant="text" width={80} />
        <NavigateNextIcon fontSize="small" color="disabled" />
        <Skeleton variant="text" width={100} />
      </Box>
    );
  }

  // Build breadcrumb items including home
  const allItems: BreadcrumbItem[] = [];

  if (showHome) {
    allItems.push({
      id: 'home',
      label: homeLabel,
      path: homePath,
      icon: homeIcon,
    });
  }

  allItems.push(...items);

  // Handle maxItems truncation
  let displayItems = allItems;
  let hasCollapsed = false;

  if (maxItems && allItems.length > maxItems) {
    const lastItem = allItems[allItems.length - 1];
    const firstItems = allItems.slice(0, 2); // Always show first 2 items
    const remainingItems = allItems.slice(-2); // Always show last 2 items
    
    if (allItems.length > 4) {
      displayItems = [
        ...firstItems,
        {
          id: 'collapsed',
          label: '...',
          disabled: true,
          icon: <MoreHorizIcon fontSize="small" />,
        },
        ...remainingItems,
      ];
      hasCollapsed = true;
    }
  }

  const renderBreadcrumbItem = (item: BreadcrumbItem, isLast: boolean) => {
    const content = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {item.icon && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {item.icon}
          </Box>
        )}
        
        <Typography
          variant="body2"
          sx={{
            fontWeight: isLast ? 600 : 400,
            color: isLast ? 'text.primary' : 'text.secondary',
            ...(variant === 'compact' && {
              fontSize: '0.75rem',
            }),
          }}
        >
          {item.label}
        </Typography>

        {item.badge && (
          <Chip
            label={item.badge}
            size="small"
            color="primary"
            sx={{
              height: 16,
              fontSize: '0.6rem',
              '& .MuiChip-label': { px: 0.5 },
            }}
          />
        )}
      </Box>
    );

    if (isLast || item.disabled || item.id === 'collapsed') {
      return (
        <Typography
          key={item.id}
          variant="body2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: isLast ? 'text.primary' : 'text.secondary',
            fontWeight: isLast ? 600 : 400,
            ...(item.disabled && {
              color: 'text.disabled',
              cursor: 'default',
            }),
          }}
        >
          {content}
        </Typography>
      );
    }

    return (
      <Link
        key={item.id}
        component="button"
        variant="body2"
        onClick={() => handleItemClick(item)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: 'text.secondary',
          textDecoration: 'none',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          p: 0,
          borderRadius: 1,
          transition: 'all 0.2s',
          '&:hover': {
            color: 'primary.main',
            backgroundColor: variant === 'outlined' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
          },
          ...(variant === 'outlined' && {
            px: 1,
            py: 0.5,
            border: 1,
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
            },
          }),
        }}
      >
        {content}
      </Link>
    );
  };

  const breadcrumbContent = (
    <Breadcrumbs
      separator={separator || <NavigateNextIcon fontSize="small" />}
      sx={{
        '& .MuiBreadcrumbs-ol': {
          alignItems: 'center',
        },
        '& .MuiBreadcrumbs-separator': {
          color: 'text.disabled',
        },
        ...(variant === 'outlined' && {
          p: 1,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          backgroundColor: 'background.paper',
        }),
      }}
    >
      {displayItems.map((item, index) => 
        renderBreadcrumbItem(item, index === displayItems.length - 1)
      )}
    </Breadcrumbs>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: variant === 'compact' ? 0.5 : 1,
        ...sx,
      }}
    >
      {showBack && onBackClick && (
        <IconButton
          size="small"
          onClick={onBackClick}
          sx={{
            mr: 1,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
      )}

      {breadcrumbContent}
    </Box>
  );
}

// Compact breadcrumb for toolbars
export function CompactBreadcrumb(props: Omit<BreadcrumbProps, 'variant'>) {
  return <Breadcrumb {...props} variant="compact" />;
}

// Outlined breadcrumb for cards
export function OutlinedBreadcrumb(props: Omit<BreadcrumbProps, 'variant'>) {
  return <Breadcrumb {...props} variant="outlined" />;
}

// Simple breadcrumb with just text
interface SimpleBreadcrumbProps {
  items: string[];
  separator?: string;
  current?: string;
}

export function SimpleBreadcrumb({
  items,
  separator = ' > ',
  current,
}: SimpleBreadcrumbProps) {
  const allItems = current ? [...items, current] : items;

  return (
    <Typography variant="body2" color="text.secondary">
      {allItems.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <Typography
              component="span"
              variant="body2"
              color="text.disabled"
              sx={{ mx: 0.5 }}
            >
              {separator}
            </Typography>
          )}
          <Typography
            component="span"
            variant="body2"
            sx={{
              color: index === allItems.length - 1 ? 'text.primary' : 'text.secondary',
              fontWeight: index === allItems.length - 1 ? 600 : 400,
            }}
          >
            {item}
          </Typography>
        </Fragment>
      ))}
    </Typography>
  );
}

// Hook for breadcrumb state management
export function useBreadcrumbState(initialItems: BreadcrumbItem[] = []) {
  const [items, setItems] = useState<BreadcrumbItem[]>(initialItems);

  const setCurrentPath = (newItems: BreadcrumbItem[]) => {
    setItems(newItems);
  };

  const addItem = (item: BreadcrumbItem) => {
    setItems(prev => [...prev, item]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<BreadcrumbItem>) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const clear = () => {
    setItems([]);
  };

  const navigateBack = () => {
    setItems(prev => prev.slice(0, -1));
  };

  return {
    items,
    setCurrentPath,
    addItem,
    removeItem,
    updateItem,
    clear,
    navigateBack,
  };
}

// Breadcrumb utilities
export const breadcrumbUtils = {
  // Create breadcrumb item
  createItem: (
    id: string,
    label: string,
    options?: Partial<BreadcrumbItem>
  ): BreadcrumbItem => ({
    id,
    label,
    ...options,
  }),

  // Create breadcrumb from path
  fromPath: (path: string, pathLabels: Record<string, string> = {}): BreadcrumbItem[] => {
    const segments = path.split('/').filter(Boolean);
    
    return segments.map((segment, index) => ({
      id: segment,
      label: pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      path: '/' + segments.slice(0, index + 1).join('/'),
    }));
  },

  // Get parent path
  getParentPath: (items: BreadcrumbItem[]): string | null => {
    if (items.length <= 1) return null;
    const parentItem = items[items.length - 2];
    return parentItem.path || null;
  },

  // Get current path
  getCurrentPath: (items: BreadcrumbItem[]): string | null => {
    if (items.length === 0) return null;
    const currentItem = items[items.length - 1];
    return currentItem.path || null;
  },

  // Check if path exists in breadcrumb
  hasPath: (items: BreadcrumbItem[], path: string): boolean => {
    return items.some(item => item.path === path);
  },
};

import { useState } from 'react';