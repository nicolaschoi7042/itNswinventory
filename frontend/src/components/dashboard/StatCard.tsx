import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  LinearProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { ReactNode, useState } from 'react';
import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  trend?: {
    value: number;
    label?: string;
    period?: string;
  };
  progress?: {
    value: number;
    max?: number;
    label?: string;
  };
  onClick?: () => void;
  onInfoClick?: () => void;
  loading?: boolean;
  variant?: 'default' | 'outlined' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  showMore?: boolean;
  additionalInfo?: string | ReactNode;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  progress,
  onClick,
  onInfoClick,
  loading = false,
  variant = 'default',
  size = 'medium',
  showMore = false,
  additionalInfo,
}: StatCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const sizeConfig = {
    small: {
      titleVariant: 'body2' as const,
      valueVariant: 'h6' as const,
      padding: 2,
      iconSize: 24,
    },
    medium: {
      titleVariant: 'body1' as const,
      valueVariant: 'h4' as const,
      padding: 3,
      iconSize: 32,
    },
    large: {
      titleVariant: 'h6' as const,
      valueVariant: 'h3' as const,
      padding: 4,
      iconSize: 40,
    },
  };

  const config = sizeConfig[size];

  const cardSx = {
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease-in-out',
    height: '100%',
    position: 'relative',
    ...(onClick && {
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 3,
      },
    }),
    ...(variant === 'outlined' && {
      border: 1,
      borderColor: 'divider',
    }),
    ...(variant === 'gradient' && {
      background: `linear-gradient(135deg, ${color}.main, ${color}.dark)`,
      color: 'white',
      '& .MuiTypography-root': {
        color: 'inherit',
      },
    }),
  };

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = () => {
    if (!trend) return null;

    const isPositive = trend.value > 0;
    const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;
    const trendColor = isPositive ? 'success' : 'error';

    return (
      <Chip
        icon={<TrendIcon />}
        label={`${trend.value > 0 ? '+' : ''}${trend.value}${trend.label ? ` ${trend.label}` : '%'}`}
        color={trendColor}
        size='small'
        variant='outlined'
      />
    );
  };

  return (
    <Card
      sx={cardSx}
      onClick={onClick}
      elevation={variant === 'outlined' ? 0 : 1}
    >
      <CardContent
        sx={{ p: config.padding, pb: `${config.padding}px !important` }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <LinearProgress sx={{ width: '60%' }} />
          </Box>
        )}

        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            {icon && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: variant === 'gradient' ? 'inherit' : `${color}.main`,
                }}
              >
                {icon &&
                  React.isValidElement(icon) &&
                  React.cloneElement(icon, {
                    style: { fontSize: config.iconSize },
                  })}
              </Box>
            )}

            <Typography
              variant={config.titleVariant}
              color='text.secondary'
              sx={{
                fontWeight: 500,
                ...(variant === 'gradient' && {
                  color: 'inherit',
                  opacity: 0.9,
                }),
              }}
            >
              {title}
            </Typography>
          </Box>

          {(showMore || onInfoClick) && (
            <Box>
              {onInfoClick && (
                <Tooltip title='More information'>
                  <IconButton
                    size='small'
                    onClick={e => {
                      e.stopPropagation();
                      onInfoClick();
                    }}
                  >
                    <InfoIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              )}

              {showMore && (
                <IconButton
                  size='small'
                  onClick={e => {
                    e.stopPropagation();
                    setShowDetails(!showDetails);
                  }}
                >
                  <MoreVertIcon fontSize='small' />
                </IconButton>
              )}
            </Box>
          )}
        </Box>

        {/* Value */}
        <Typography
          variant={config.valueVariant}
          sx={{
            fontWeight: 700,
            mb: subtitle || trend || progress ? 1 : 0,
            color:
              variant === 'gradient'
                ? 'inherit'
                : color === 'primary'
                  ? 'text.primary'
                  : `${color}.main`,
          }}
        >
          {formatValue(value)}
        </Typography>

        {/* Subtitle */}
        {subtitle && (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              mb: trend || progress ? 1 : 0,
              ...(variant === 'gradient' && {
                color: 'inherit',
                opacity: 0.8,
              }),
            }}
          >
            {subtitle}
          </Typography>
        )}

        {/* Progress */}
        {progress && (
          <Box sx={{ mb: trend ? 1 : 0 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.5,
              }}
            >
              {progress.label && (
                <Typography variant='caption' color='text.secondary'>
                  {progress.label}
                </Typography>
              )}
              <Typography variant='caption' color='text.secondary'>
                {progress.value}
                {progress.max ? `/${progress.max}` : ''}
              </Typography>
            </Box>
            <LinearProgress
              variant='determinate'
              value={
                progress.max
                  ? (progress.value / progress.max) * 100
                  : progress.value
              }
              color={color}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        )}

        {/* Trend */}
        {trend && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {getTrendIcon()}
            {trend.period && (
              <Typography variant='caption' color='text.secondary'>
                {trend.period}
              </Typography>
            )}
          </Box>
        )}

        {/* Additional Info */}
        {showDetails && additionalInfo && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            {typeof additionalInfo === 'string' ? (
              <Typography variant='body2' color='text.secondary'>
                {additionalInfo}
              </Typography>
            ) : (
              additionalInfo
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized stat card variants
interface CounterStatCardProps extends Omit<StatCardProps, 'value'> {
  count: number;
  total?: number;
  unit?: string;
  showPercentage?: boolean;
}

export function CounterStatCard({
  count,
  total,
  unit = '',
  showPercentage = false,
  progress,
  ...props
}: CounterStatCardProps) {
  const value = `${count.toLocaleString()}${unit ? ` ${unit}` : ''}`;

  const finalProgress =
    progress ||
    (total
      ? {
          value: count,
          max: total,
          label: showPercentage
            ? `${Math.round((count / total) * 100)}% used`
            : undefined,
        }
      : undefined);

  return <StatCard {...props} value={value} progress={finalProgress} />;
}

interface PercentageStatCardProps extends Omit<StatCardProps, 'value'> {
  percentage: number;
  label?: string;
}

export function PercentageStatCard({
  percentage,
  label = '',
  ...props
}: PercentageStatCardProps) {
  const value = `${Math.round(percentage)}%`;

  const progress = {
    value: percentage,
    label: label || undefined,
  };

  return <StatCard {...props} value={value} progress={progress} />;
}

interface StatusStatCardProps extends Omit<StatCardProps, 'value'> {
  status: 'active' | 'inactive' | 'warning' | 'error';
  count: number;
  unit?: string;
}

export function StatusStatCard({
  status,
  count,
  unit = '',
  ...props
}: StatusStatCardProps) {
  const statusConfig = {
    active: { color: 'success' as const, label: 'Active' },
    inactive: { color: 'secondary' as const, label: 'Inactive' },
    warning: { color: 'warning' as const, label: 'Warning' },
    error: { color: 'error' as const, label: 'Error' },
  };

  const config = statusConfig[status];
  const value = `${count.toLocaleString()}${unit ? ` ${unit}` : ''}`;

  return (
    <StatCard
      {...props}
      value={value}
      color={config.color}
      subtitle={`${config.label} ${props.title?.toLowerCase() || 'items'}`}
    />
  );
}

// Grid container for stat cards
interface StatCardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  spacing?: number;
}

export function StatCardGrid({
  children,
  columns = 3,
  spacing = 3,
}: StatCardGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: spacing,
        '@media (max-width: 900px)': {
          gridTemplateColumns:
            columns > 2 ? 'repeat(2, 1fr)' : `repeat(${columns}, 1fr)`,
        },
        '@media (max-width: 600px)': {
          gridTemplateColumns: '1fr',
        },
      }}
    >
      {children}
    </Box>
  );
}
