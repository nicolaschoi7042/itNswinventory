import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Stack,
  Divider,
  Button,
} from '@mui/material';
import {
  Software as SoftwareIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { ReactNode, useState } from 'react';

export interface SoftwareLicense {
  id: string;
  name: string;
  manufacturer?: string;
  version?: string;
  licenseType: string;
  totalLicenses: number;
  usedLicenses: number;
  availableLicenses: number;
  expiryDate?: string;
  cost?: number;
  renewalDate?: string;
  status?: 'active' | 'expiring' | 'expired' | 'exceeded';
}

export interface LicenseStatusProps {
  licenses: SoftwareLicense[];
  title?: string;
  showHeader?: boolean;
  maxItems?: number;
  loading?: boolean;
  onRefresh?: () => void;
  onViewDetails?: (license: SoftwareLicense) => void;
  onViewAll?: () => void;
  showAlerts?: boolean;
  alertThreshold?: number;
  expiryWarningDays?: number;
  dense?: boolean;
}

export function LicenseStatus({
  licenses,
  title = 'Software License Status',
  showHeader = true,
  maxItems,
  loading = false,
  onRefresh,
  onViewDetails,
  onViewAll,
  showAlerts = true,
  alertThreshold = 0.8, // 80% usage warning
  expiryWarningDays = 30,
  dense = false,
}: LicenseStatusProps) {
  const displayLicenses = maxItems ? licenses.slice(0, maxItems) : licenses;

  const getUsagePercentage = (license: SoftwareLicense): number => {
    if (license.totalLicenses === 0) return 0;
    return (license.usedLicenses / license.totalLicenses) * 100;
  };

  const getLicenseStatus = (license: SoftwareLicense): {
    status: 'success' | 'warning' | 'error' | 'info';
    label: string;
    color: string;
  } => {
    const usagePercentage = getUsagePercentage(license);
    
    // Check if exceeded
    if (license.usedLicenses > license.totalLicenses) {
      return {
        status: 'error',
        label: 'Exceeded',
        color: '#f44336',
      };
    }
    
    // Check expiry
    if (license.expiryDate) {
      const expiryDate = new Date(license.expiryDate);
      const now = new Date();
      const daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToExpiry <= 0) {
        return {
          status: 'error',
          label: 'Expired',
          color: '#f44336',
        };
      }
      
      if (daysToExpiry <= expiryWarningDays) {
        return {
          status: 'warning',
          label: `Expires in ${daysToExpiry}d`,
          color: '#ff9800',
        };
      }
    }
    
    // Check usage threshold
    if (usagePercentage >= alertThreshold * 100) {
      return {
        status: 'warning',
        label: 'High Usage',
        color: '#ff9800',
      };
    }
    
    if (usagePercentage > 0) {
      return {
        status: 'success',
        label: 'Active',
        color: '#4caf50',
      };
    }
    
    return {
      status: 'info',
      label: 'Unused',
      color: '#2196f3',
    };
  };

  const getProgressColor = (percentage: number, status: string): 'primary' | 'success' | 'warning' | 'error' => {
    if (status === 'error') return 'error';
    if (status === 'warning') return 'warning';
    if (percentage > 0) return 'success';
    return 'primary';
  };

  const getCriticalLicenses = (): SoftwareLicense[] => {
    return licenses.filter(license => {
      const { status } = getLicenseStatus(license);
      return status === 'error' || status === 'warning';
    });
  };

  const renderLicenseItem = (license: SoftwareLicense) => {
    const usagePercentage = getUsagePercentage(license);
    const { status, label, color } = getLicenseStatus(license);

    return (
      <ListItem
        key={license.id}
        dense={dense}
        sx={{
          px: 0,
          py: 1,
          '&:hover': {
            backgroundColor: 'action.hover',
            borderRadius: 1,
          },
        }}
        onClick={() => onViewDetails?.(license)}
        button={!!onViewDetails}
      >
        <ListItemIcon>
          <SoftwareIcon color="primary" />
        </ListItemIcon>
        
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography
                variant={dense ? 'body2' : 'body1'}
                sx={{ fontWeight: 500, flex: 1 }}
              >
                {license.name}
              </Typography>
              
              <Chip
                label={label}
                size="small"
                sx={{
                  backgroundColor: `${color}20`,
                  color: color,
                  fontWeight: 500,
                }}
              />
            </Box>
          }
          secondary={
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {license.usedLicenses} / {license.totalLicenses} licenses used
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({Math.round(usagePercentage)}%)
                </Typography>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={Math.min(usagePercentage, 100)}
                color={getProgressColor(usagePercentage, status)}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  backgroundColor: 'action.hover',
                }}
              />
              
              {license.manufacturer && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {license.manufacturer} • {license.licenseType}
                </Typography>
              )}
            </Box>
          }
        />

        {onViewDetails && (
          <IconButton size="small" edge="end">
            <VisibilityIcon fontSize="small" />
          </IconButton>
        )}
      </ListItem>
    );
  };

  const renderAlerts = () => {
    const criticalLicenses = getCriticalLicenses();
    
    if (!showAlerts || criticalLicenses.length === 0) {
      return null;
    }

    const expiredLicenses = criticalLicenses.filter(l => getLicenseStatus(l).label === 'Expired');
    const exceededLicenses = criticalLicenses.filter(l => getLicenseStatus(l).label === 'Exceeded');
    const expiringLicenses = criticalLicenses.filter(l => getLicenseStatus(l).label.includes('Expires'));

    return (
      <Stack spacing={1} sx={{ mb: 2 }}>
        {exceededLicenses.length > 0 && (
          <Alert severity="error" variant="outlined" size="small">
            <Typography variant="body2">
              {exceededLicenses.length} license(s) exceeded: {exceededLicenses.map(l => l.name).join(', ')}
            </Typography>
          </Alert>
        )}
        
        {expiredLicenses.length > 0 && (
          <Alert severity="error" variant="outlined" size="small">
            <Typography variant="body2">
              {expiredLicenses.length} license(s) expired: {expiredLicenses.map(l => l.name).join(', ')}
            </Typography>
          </Alert>
        )}
        
        {expiringLicenses.length > 0 && (
          <Alert severity="warning" variant="outlined" size="small">
            <Typography variant="body2">
              {expiringLicenses.length} license(s) expiring soon: {expiringLicenses.map(l => l.name).join(', ')}
            </Typography>
          </Alert>
        )}
      </Stack>
    );
  };

  const renderEmptyState = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        textAlign: 'center',
      }}
    >
      <SoftwareIcon
        sx={{
          fontSize: 48,
          color: 'text.disabled',
          mb: 2,
        }}
      />
      <Typography variant="body2" color="text.secondary">
        No software licenses found
      </Typography>
    </Box>
  );

  const renderStats = () => {
    const totalLicenses = licenses.reduce((sum, license) => sum + license.totalLicenses, 0);
    const totalUsed = licenses.reduce((sum, license) => sum + license.usedLicenses, 0);
    const totalAvailable = licenses.reduce((sum, license) => sum + license.availableLicenses, 0);
    const overallUsage = totalLicenses > 0 ? (totalUsed / totalLicenses) * 100 : 0;

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 2,
          mb: 2,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            {licenses.length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total Software
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
            {totalLicenses.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total Licenses
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="info.main" sx={{ fontWeight: 700 }}>
            {totalUsed.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Used
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
            {totalAvailable.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Available
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center', gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {Math.round(overallUsage)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Overall Usage
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showHeader && (
        <CardHeader
          title={
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          }
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {onRefresh && (
                <Tooltip title="Refresh">
                  <IconButton size="small" onClick={onRefresh} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          }
          sx={{ pb: 1 }}
        />
      )}

      <CardContent sx={{ pt: 0, flex: 1, overflow: 'auto' }}>
        {licenses.length > 0 && renderStats()}
        {renderAlerts()}

        {loading ? (
          <Box sx={{ py: 2 }}>
            <LinearProgress />
          </Box>
        ) : displayLicenses.length === 0 ? (
          renderEmptyState()
        ) : (
          <List dense={dense}>
            {displayLicenses.map((license, index) => (
              <Box key={license.id}>
                {renderLicenseItem(license)}
                {index < displayLicenses.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}

        {!loading && displayLicenses.length > 0 && maxItems && licenses.length > maxItems && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              size="small"
              onClick={onViewAll}
              disabled={!onViewAll}
            >
              View {licenses.length - maxItems} more licenses
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// License summary card
export interface LicenseSummaryProps {
  licenses: SoftwareLicense[];
  showCriticalOnly?: boolean;
}

export function LicenseSummary({ 
  licenses, 
  showCriticalOnly = false 
}: LicenseSummaryProps) {
  const criticalLicenses = licenses.filter(license => {
    const usagePercentage = (license.usedLicenses / license.totalLicenses) * 100;
    return usagePercentage >= 80 || license.usedLicenses > license.totalLicenses;
  });

  const displayLicenses = showCriticalOnly ? criticalLicenses : licenses;

  if (displayLicenses.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {displayLicenses.map((license) => {
        const usagePercentage = (license.usedLicenses / license.totalLicenses) * 100;
        const isOverLimit = license.usedLicenses > license.totalLicenses;
        
        return (
          <Tooltip
            key={license.id}
            title={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {license.name}
                </Typography>
                <Typography variant="caption">
                  {license.usedLicenses} / {license.totalLicenses} licenses used ({Math.round(usagePercentage)}%)
                </Typography>
                {license.manufacturer && (
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    {license.manufacturer}
                  </Typography>
                )}
              </Box>
            }
          >
            <Chip
              label={`${license.name}: ${license.usedLicenses}`}
              color={isOverLimit ? 'error' : usagePercentage >= 80 ? 'warning' : 'default'}
              size="small"
              variant={isOverLimit || usagePercentage >= 80 ? 'filled' : 'outlined'}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
}

// Hook for license management
export function useLicenseStatus(initialLicenses: SoftwareLicense[] = []) {
  const [licenses, setLicenses] = useState<SoftwareLicense[]>(initialLicenses);

  const updateLicenseUsage = (licenseId: string, usedCount: number) => {
    setLicenses(prev =>
      prev.map(license =>
        license.id === licenseId
          ? {
              ...license,
              usedLicenses: usedCount,
              availableLicenses: license.totalLicenses - usedCount,
            }
          : license
      )
    );
  };

  const getCriticalLicenses = () => {
    return licenses.filter(license => {
      const usagePercentage = (license.usedLicenses / license.totalLicenses) * 100;
      return usagePercentage >= 80 || license.usedLicenses > license.totalLicenses;
    });
  };

  const getExpiringLicenses = (days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return licenses.filter(license => {
      if (!license.expiryDate) return false;
      const expiryDate = new Date(license.expiryDate);
      return expiryDate <= cutoffDate && expiryDate >= new Date();
    });
  };

  return {
    licenses,
    setLicenses,
    updateLicenseUsage,
    getCriticalLicenses,
    getExpiringLicenses,
  };
}

