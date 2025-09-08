import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  Software as SoftwareIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { ReactNode } from 'react';

interface InfoDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  showDivider?: boolean;
  actions?: ReactNode;
  icon?: ReactNode;
  onEdit?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  editLabel?: string;
  printLabel?: string;
  shareLabel?: string;
  closeLabel?: string;
}

export function InfoDialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  fullWidth = true,
  showDivider = true,
  actions,
  icon,
  onEdit,
  onPrint,
  onShare,
  editLabel = 'Edit',
  printLabel = 'Print',
  shareLabel = 'Share',
  closeLabel = 'Close',
}: InfoDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      scroll="paper"
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pb: showDivider ? 1 : 2,
          pr: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {icon && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {icon}
            </Box>
          )}
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ mt: -0.5, mr: -0.5 }}
          aria-label="Close dialog"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {showDivider && <Divider />}

      {/* Dialog Content */}
      <DialogContent sx={{ py: 3 }}>
        {children}
      </DialogContent>

      {/* Dialog Actions */}
      {(actions || onEdit || onPrint || onShare) && (
        <>
          {showDivider && <Divider />}
          <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {onEdit && (
                <Button
                  onClick={onEdit}
                  variant="outlined"
                  startIcon={<EditIcon />}
                  color="primary"
                >
                  {editLabel}
                </Button>
              )}
              {onPrint && (
                <Button
                  onClick={onPrint}
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  color="inherit"
                >
                  {printLabel}
                </Button>
              )}
              {onShare && (
                <Button
                  onClick={onShare}
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  color="inherit"
                >
                  {shareLabel}
                </Button>
              )}
              {actions}
            </Box>
            
            <Button
              onClick={onClose}
              variant="contained"
              color="primary"
            >
              {closeLabel}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

// Info field component for structured data display
interface InfoFieldProps {
  label: string;
  value: string | number | ReactNode;
  variant?: 'default' | 'chip' | 'list';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  xs?: number;
  sm?: number;
  md?: number;
}

export function InfoField({ 
  label, 
  value, 
  variant = 'default',
  color = 'primary',
  xs = 12,
  sm = 6,
  md = 4
}: InfoFieldProps) {
  const renderValue = () => {
    if (variant === 'chip' && typeof value === 'string') {
      return (
        <Chip 
          label={value} 
          color={color}
          size="small"
        />
      );
    }
    
    if (variant === 'list' && Array.isArray(value)) {
      return (
        <List dense sx={{ py: 0 }}>
          {value.map((item, index) => (
            <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
              <ListItemText 
                primary={item} 
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>
      );
    }
    
    return (
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || '—'}
      </Typography>
    );
  };

  return (
    <Grid item xs={xs} sm={sm} md={md}>
      <Box sx={{ mb: 2 }}>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 0.5, fontWeight: 600 }}
        >
          {label}
        </Typography>
        {renderValue()}
      </Box>
    </Grid>
  );
}

// Section component for organizing info
interface InfoSectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function InfoSection({ 
  title, 
  children, 
  icon,
  collapsible = false,
  defaultExpanded = true 
}: InfoSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (collapsible) {
      setExpanded(!expanded);
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            cursor: collapsible ? 'pointer' : 'default'
          }}
          onClick={handleToggle}
        >
          {icon && (
            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
              {icon}
            </Box>
          )}
          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
            {title}
          </Typography>
          {collapsible && (
            <IconButton size="small">
              {expanded ? '−' : '+'}
            </IconButton>
          )}
        </Box>
        
        {expanded && (
          <Grid container spacing={2}>
            {children}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized info dialogs for different entity types
interface EmployeeInfoDialogProps extends Omit<InfoDialogProps, 'title' | 'icon' | 'children'> {
  employee: {
    id: string;
    name: string;
    department: string;
    email?: string;
    phone?: string;
    position?: string;
    hireDate?: string;
    status: string;
    assignedAssets?: number;
  };
}

export function EmployeeInfoDialog({ employee, ...props }: EmployeeInfoDialogProps) {
  return (
    <InfoDialog
      {...props}
      title={employee.name}
      subtitle={`Employee ID: ${employee.id}`}
      icon={<PersonIcon color="primary" sx={{ fontSize: 32 }} />}
    >
      <InfoSection title="Basic Information" icon={<PersonIcon />}>
        <InfoField label="Employee ID" value={employee.id} />
        <InfoField label="Name" value={employee.name} />
        <InfoField label="Department" value={employee.department} />
        <InfoField label="Position" value={employee.position} />
        <InfoField 
          label="Status" 
          value={employee.status}
          variant="chip"
          color={employee.status === 'Active' ? 'success' : 'default'}
        />
        <InfoField label="Hire Date" value={employee.hireDate} />
      </InfoSection>
      
      <InfoSection title="Contact Information" icon={<InfoIcon />}>
        <InfoField label="Email" value={employee.email} />
        <InfoField label="Phone" value={employee.phone} />
      </InfoSection>
      
      <InfoSection title="Asset Information" icon={<AssignmentIcon />}>
        <InfoField 
          label="Assigned Assets" 
          value={`${employee.assignedAssets || 0} items`}
          variant="chip"
          color="info"
        />
      </InfoSection>
    </InfoDialog>
  );
}

interface HardwareInfoDialogProps extends Omit<InfoDialogProps, 'title' | 'icon' | 'children'> {
  hardware: {
    id: string;
    name: string;
    type: string;
    manufacturer?: string;
    model?: string;
    serial?: string;
    assignedTo?: string;
    status: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
  };
}

export function HardwareInfoDialog({ hardware, ...props }: HardwareInfoDialogProps) {
  return (
    <InfoDialog
      {...props}
      title={hardware.name}
      subtitle={`Asset ID: ${hardware.id}`}
      icon={<ComputerIcon color="primary" sx={{ fontSize: 32 }} />}
    >
      <InfoSection title="Hardware Details" icon={<ComputerIcon />}>
        <InfoField label="Asset ID" value={hardware.id} />
        <InfoField label="Name" value={hardware.name} />
        <InfoField label="Type" value={hardware.type} />
        <InfoField label="Manufacturer" value={hardware.manufacturer} />
        <InfoField label="Model" value={hardware.model} />
        <InfoField label="Serial Number" value={hardware.serial} />
      </InfoSection>
      
      <InfoSection title="Assignment & Status" icon={<AssignmentIcon />}>
        <InfoField 
          label="Status" 
          value={hardware.status}
          variant="chip"
          color={hardware.status === 'Assigned' ? 'primary' : 'success'}
        />
        <InfoField label="Assigned To" value={hardware.assignedTo} />
      </InfoSection>
      
      <InfoSection title="Purchase Information" icon={<InfoIcon />}>
        <InfoField label="Purchase Date" value={hardware.purchaseDate} />
        <InfoField label="Warranty Expiry" value={hardware.warrantyExpiry} />
      </InfoSection>
    </InfoDialog>
  );
}

interface SoftwareInfoDialogProps extends Omit<InfoDialogProps, 'title' | 'icon' | 'children'> {
  software: {
    id: string;
    name: string;
    manufacturer?: string;
    version?: string;
    type: string;
    licenseType?: string;
    totalLicenses: number;
    usedLicenses: number;
    availableLicenses: number;
  };
}

export function SoftwareInfoDialog({ software, ...props }: SoftwareInfoDialogProps) {
  return (
    <InfoDialog
      {...props}
      title={software.name}
      subtitle={`Software ID: ${software.id}`}
      icon={<SoftwareIcon color="primary" sx={{ fontSize: 32 }} />}
    >
      <InfoSection title="Software Details" icon={<SoftwareIcon />}>
        <InfoField label="Software ID" value={software.id} />
        <InfoField label="Name" value={software.name} />
        <InfoField label="Manufacturer" value={software.manufacturer} />
        <InfoField label="Version" value={software.version} />
        <InfoField label="Type" value={software.type} />
        <InfoField label="License Type" value={software.licenseType} />
      </InfoSection>
      
      <InfoSection title="License Information" icon={<AssignmentIcon />}>
        <InfoField label="Total Licenses" value={software.totalLicenses} />
        <InfoField label="Used Licenses" value={software.usedLicenses} />
        <InfoField 
          label="Available Licenses" 
          value={software.availableLicenses}
          variant="chip"
          color={software.availableLicenses > 0 ? 'success' : 'error'}
        />
      </InfoSection>
    </InfoDialog>
  );
}

// Hook for managing info dialog state
export function useInfoDialog() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>(null);

  const showInfo = (infoData: any) => {
    setData(infoData);
    setOpen(true);
  };

  const hideInfo = () => {
    setOpen(false);
    setData(null);
  };

  return {
    open,
    data,
    showInfo,
    hideInfo,
  };
}