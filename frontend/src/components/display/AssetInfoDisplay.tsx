/**
 * Asset Information Display Components
 * 
 * Components for displaying asset information (hardware and software)
 * with detailed specifications and status indicators.
 */

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Badge,
  Stack,
  Divider,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Apps as AppsIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Monitor as MonitorIcon,
  Smartphone as SmartphoneIcon,
  Laptop as LaptopIcon,
  Print as PrintIcon,
  Router as RouterIcon,
  Keyboard as KeyboardIcon,
  Mouse as MouseIcon,
  Headset as HeadsetIcon,
  SecurityUpdate as SecurityIcon,
  Update as UpdateIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface AssetInfo {
  id: string;
  name: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  specifications?: {
    cpu?: string;
    memory?: string;
    storage?: string;
    display?: string;
    os?: string;
    version?: string;
  };
  status?: 'available' | 'assigned' | 'maintenance' | 'retired';
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  purchase_date?: string;
  warranty_expiry?: string;
  location?: string;
  notes?: string;
}

interface AssetInfoDisplayProps {
  asset: AssetInfo;
  assetType: 'hardware' | 'software';
  variant?: 'compact' | 'standard' | 'detailed' | 'card';
  showSpecifications?: boolean;
  showStatus?: boolean;
  showWarranty?: boolean;
  size?: 'small' | 'medium' | 'large';
  assignmentCount?: number;
  onAssetClick?: (asset: AssetInfo) => void;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getAssetIcon = (type: string, assetType: 'hardware' | 'software') => {
  if (assetType === 'software') {
    return <AppsIcon />;
  }

  const typeMap: Record<string, JSX.Element> = {
    'Desktop': <ComputerIcon />,
    'Laptop': <LaptopIcon />,
    'Monitor': <MonitorIcon />,
    'Mobile': <SmartphoneIcon />,
    'Tablet': <SmartphoneIcon />,
    'Printer': <PrintIcon />,
    'Network': <RouterIcon />,
    'Router': <RouterIcon />,
    'Switch': <RouterIcon />,
    'Storage': <StorageIcon />,
    'Memory': <MemoryIcon />,
    'Keyboard': <KeyboardIcon />,
    'Mouse': <MouseIcon />,
    'Headset': <HeadsetIcon />,
    'Speaker': <HeadsetIcon />,
  };

  return typeMap[type] || <ComputerIcon />;
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'available': return 'success';
    case 'assigned': return 'primary';
    case 'maintenance': return 'warning';
    case 'retired': return 'error';
    default: return 'default';
  }
};

const getConditionColor = (condition?: string) => {
  switch (condition) {
    case 'excellent': return 'success';
    case 'good': return 'info';
    case 'fair': return 'warning';
    case 'poor': return 'error';
    default: return 'default';
  }
};

const getWarrantyStatus = (warrantyExpiry?: string) => {
  if (!warrantyExpiry) return null;
  
  const expiryDate = new Date(warrantyExpiry);
  const currentDate = new Date();
  const diffTime = expiryDate.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { status: 'expired', color: 'error', text: '보증 만료', days: Math.abs(diffDays) };
  } else if (diffDays <= 30) {
    return { status: 'expiring', color: 'warning', text: '보증 만료 임박', days: diffDays };
  } else if (diffDays <= 90) {
    return { status: 'valid', color: 'info', text: '보증 유효', days: diffDays };
  } else {
    return { status: 'valid', color: 'success', text: '보증 유효', days: diffDays };
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AssetInfoDisplay({
  asset,
  assetType,
  variant = 'standard',
  showSpecifications = true,
  showStatus = true,
  showWarranty = true,
  size = 'medium',
  assignmentCount,
  onAssetClick
}: AssetInfoDisplayProps) {
  const theme = useTheme();
  
  const avatarSize = size === 'large' ? 56 : size === 'medium' ? 40 : 32;
  const isHardware = assetType === 'hardware';
  const statusColor = getStatusColor(asset.status);
  const conditionColor = getConditionColor(asset.condition);
  const warrantyStatus = showWarranty ? getWarrantyStatus(asset.warranty_expiry) : null;

  // Compact variant - minimal display
  if (variant === 'compact') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          cursor: onAssetClick ? 'pointer' : 'default',
          '&:hover': onAssetClick ? {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            borderRadius: 1
          } : {}
        }}
        onClick={() => onAssetClick?.(asset)}
      >
        <Avatar 
          sx={{ 
            width: avatarSize, 
            height: avatarSize, 
            bgcolor: isHardware ? 'info.main' : 'success.main',
            fontSize: size === 'large' ? '1.2rem' : size === 'medium' ? '1rem' : '0.8rem'
          }}
        >
          {getAssetIcon(asset.type, assetType)}
        </Avatar>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography 
            variant={size === 'large' ? 'subtitle1' : 'body2'} 
            fontWeight="medium"
            noWrap
          >
            {asset.manufacturer && asset.model ? 
              `${asset.manufacturer} ${asset.model}` : 
              asset.name
            }
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={isHardware ? '하드웨어' : '소프트웨어'}
              size="small"
              color={isHardware ? 'info' : 'success'}
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            <Typography variant="caption" color="text.secondary">
              {asset.id}
            </Typography>
          </Box>
        </Box>
        {showStatus && asset.status && (
          <Chip
            label={asset.status}
            size="small"
            color={statusColor as any}
            variant="outlined"
          />
        )}
      </Box>
    );
  }

  // Card variant - full card display
  if (variant === 'card') {
    return (
      <Card 
        sx={{ 
          cursor: onAssetClick ? 'pointer' : 'default',
          '&:hover': onAssetClick ? {
            boxShadow: theme.shadows[4],
            transform: 'translateY(-2px)'
          } : {},
          transition: 'all 0.2s ease-in-out'
        }}
        onClick={() => onAssetClick?.(asset)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: isHardware ? 'info.main' : 'success.main',
                fontSize: '1.5rem'
              }}
            >
              {getAssetIcon(asset.type, assetType)}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" gutterBottom>
                {asset.name}
              </Typography>
              
              {asset.manufacturer && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {asset.manufacturer} {asset.model}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={isHardware ? '하드웨어' : '소프트웨어'}
                  size="small"
                  color={isHardware ? 'info' : 'success'}
                />
                <Chip
                  label={asset.type}
                  size="small"
                  variant="outlined"
                />
                {showStatus && asset.status && (
                  <Chip
                    label={asset.status}
                    size="small"
                    color={statusColor as any}
                    variant="outlined"
                  />
                )}
              </Box>

              {/* Specifications */}
              {showSpecifications && asset.specifications && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    사양
                  </Typography>
                  <Stack spacing={0.5}>
                    {asset.specifications.cpu && (
                      <Typography variant="caption" color="text.secondary">
                        CPU: {asset.specifications.cpu}
                      </Typography>
                    )}
                    {asset.specifications.memory && (
                      <Typography variant="caption" color="text.secondary">
                        메모리: {asset.specifications.memory}
                      </Typography>
                    )}
                    {asset.specifications.storage && (
                      <Typography variant="caption" color="text.secondary">
                        저장소: {asset.specifications.storage}
                      </Typography>
                    )}
                    {asset.specifications.os && (
                      <Typography variant="caption" color="text.secondary">
                        OS: {asset.specifications.os}
                      </Typography>
                    )}
                    {asset.specifications.version && (
                      <Typography variant="caption" color="text.secondary">
                        버전: {asset.specifications.version}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )}

              {/* Asset Details */}
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  자산 ID: {asset.id}
                </Typography>
                {asset.serial_number && (
                  <Typography variant="caption" color="text.secondary">
                    시리얼: {asset.serial_number}
                  </Typography>
                )}
                {asset.location && (
                  <Typography variant="caption" color="text.secondary">
                    위치: {asset.location}
                  </Typography>
                )}
              </Stack>

              {/* Warranty Status */}
              {warrantyStatus && (
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <SecurityIcon fontSize="small" color={warrantyStatus.color as any} />
                    <Typography variant="body2" color={`${warrantyStatus.color}.main`}>
                      {warrantyStatus.text}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {warrantyStatus.status === 'expired' 
                      ? `${warrantyStatus.days}일 전 만료`
                      : `${warrantyStatus.days}일 남음`
                    }
                  </Typography>
                </Box>
              )}

              {assignmentCount !== undefined && (
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="primary.main">
                    할당 횟수: {assignmentCount}회
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Detailed variant - comprehensive information
  if (variant === 'detailed') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2,
          cursor: onAssetClick ? 'pointer' : 'default',
          '&:hover': onAssetClick ? {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            borderRadius: 1,
            p: 1,
            m: -1
          } : {}
        }}
        onClick={() => onAssetClick?.(asset)}
      >
        <Avatar 
          sx={{ 
            width: avatarSize, 
            height: avatarSize, 
            bgcolor: isHardware ? 'info.main' : 'success.main',
            fontSize: size === 'large' ? '1.2rem' : '1rem'
          }}
        >
          {getAssetIcon(asset.type, assetType)}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography 
            variant={size === 'large' ? 'h6' : 'subtitle1'} 
            fontWeight="medium"
            gutterBottom
          >
            {asset.manufacturer && asset.model ? 
              `${asset.manufacturer} ${asset.model}` : 
              asset.name
            }
          </Typography>
          
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={isHardware ? '하드웨어' : '소프트웨어'}
                size="small"
                color={isHardware ? 'info' : 'success'}
                variant="outlined"
              />
              <Chip
                label={asset.type}
                size="small"
                variant="outlined"
              />
              {showStatus && asset.status && (
                <Chip
                  label={asset.status}
                  size="small"
                  color={statusColor as any}
                />
              )}
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              ID: {asset.id}
              {asset.serial_number && ` • S/N: ${asset.serial_number}`}
            </Typography>
            
            {showSpecifications && asset.specifications && (
              <Box>
                {asset.specifications.cpu && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    CPU: {asset.specifications.cpu}
                  </Typography>
                )}
                {asset.specifications.memory && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    RAM: {asset.specifications.memory}
                  </Typography>
                )}
                {asset.specifications.storage && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    저장소: {asset.specifications.storage}
                  </Typography>
                )}
              </Box>
            )}
            
            {warrantyStatus && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SecurityIcon fontSize="small" color={warrantyStatus.color as any} />
                <Typography variant="caption" color={`${warrantyStatus.color}.main`}>
                  {warrantyStatus.text} ({warrantyStatus.days}일)
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>
    );
  }

  // Standard variant - default display
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5,
        cursor: onAssetClick ? 'pointer' : 'default',
        '&:hover': onAssetClick ? {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          borderRadius: 1
        } : {}
      }}
      onClick={() => onAssetClick?.(asset)}
    >
      <Avatar 
        sx={{ 
          width: avatarSize, 
          height: avatarSize, 
          bgcolor: isHardware ? 'info.main' : 'success.main',
          fontSize: size === 'large' ? '1.2rem' : size === 'medium' ? '1rem' : '0.8rem'
        }}
      >
        {getAssetIcon(asset.type, assetType)}
      </Avatar>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography 
          variant={size === 'large' ? 'subtitle1' : 'body2'} 
          fontWeight="medium"
        >
          {asset.manufacturer && asset.model ? 
            `${asset.manufacturer} ${asset.model}` : 
            asset.name
          }
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={isHardware ? '하드웨어' : '소프트웨어'}
            size="small"
            color={isHardware ? 'info' : 'success'}
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
          <Typography variant="caption" color="text.secondary">
            {asset.id}
          </Typography>
          {warrantyStatus && (
            <Tooltip title={`${warrantyStatus.text} - ${warrantyStatus.days}일`}>
              <SecurityIcon 
                fontSize="small" 
                color={warrantyStatus.color as any}
                sx={{ fontSize: 14 }}
              />
            </Tooltip>
          )}
        </Box>
      </Box>
      {showStatus && asset.status && (
        <Chip
          label={asset.status}
          size="small"
          color={statusColor as any}
          variant="outlined"
        />
      )}
    </Box>
  );
}

// ============================================================================
// QUICK ASSET CARD COMPONENT
// ============================================================================

interface QuickAssetCardProps {
  asset: AssetInfo;
  assetType: 'hardware' | 'software';
  assignments?: number;
  onClick?: () => void;
}

export function QuickAssetCard({ 
  asset, 
  assetType,
  assignments, 
  onClick 
}: QuickAssetCardProps) {
  const theme = useTheme();
  const isHardware = assetType === 'hardware';
  const statusColor = getStatusColor(asset.status);

  return (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-1px)',
          boxShadow: theme.shadows[3]
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: isHardware ? 'info.main' : 'success.main',
              fontSize: '1.1rem'
            }}
          >
            {getAssetIcon(asset.type, assetType)}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight="medium" noWrap>
              {asset.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {asset.manufacturer} {asset.model}
            </Typography>
            <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5 }}>
              <Chip
                label={isHardware ? 'HW' : 'SW'}
                size="small"
                color={isHardware ? 'info' : 'success'}
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
              {asset.status && (
                <Chip
                  label={asset.status}
                  size="small"
                  color={statusColor as any}
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Box>
          </Box>
          {assignments !== undefined && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary.main">
                {assignments}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                할당
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AssetInfoDisplay;