/**
 * Assignment Search Component
 * 
 * Advanced search functionality for assignments with intelligent text matching,
 * search suggestions, and real-time results.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Autocomplete,
  Chip,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';

// Import assignment types and utilities
import {
  Assignment,
  AssignmentWithDetails,
  AssignmentFilters
} from '@/types/assignment';

import {
  searchAssignments,
  formatDate
} from '@/utils/assignment.utils';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface SearchSuggestion {
  type: 'employee' | 'asset' | 'assignment' | 'department' | 'status';
  value: string;
  label: string;
  description?: string;
  count?: number;
  assignment?: AssignmentWithDetails;
}

interface AssignmentSearchProps {
  assignments: (Assignment | AssignmentWithDetails)[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  onAdvancedSearch?: () => void;
  placeholder?: string;
  showSuggestions?: boolean;
  showRecentSearches?: boolean;
  maxSuggestions?: number;
  size?: 'small' | 'medium';
  variant?: 'standard' | 'outlined' | 'filled';
}

interface SearchHistory {
  query: string;
  timestamp: number;
  resultCount: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateSearchSuggestions = (
  assignments: (Assignment | AssignmentWithDetails)[],
  query: string,
  maxSuggestions: number = 10
): SearchSuggestion[] => {
  if (!query || query.length < 2) return [];

  const suggestions: SearchSuggestion[] = [];
  const queryLower = query.toLowerCase();
  const seen = new Set<string>();

  // Helper function to add unique suggestions
  const addSuggestion = (suggestion: SearchSuggestion) => {
    const key = `${suggestion.type}:${suggestion.value}`;
    if (!seen.has(key) && suggestions.length < maxSuggestions) {
      seen.add(key);
      suggestions.push(suggestion);
    }
  };

  // Search through assignments
  assignments.forEach(assignment => {
    // Employee suggestions
    if (assignment.employee_name.toLowerCase().includes(queryLower)) {
      addSuggestion({
        type: 'employee',
        value: assignment.employee_name,
        label: assignment.employee_name,
        description: 'employee' in assignment && assignment.employee 
          ? `${assignment.employee.department} • ${assignment.employee.position}`
          : '직원',
        assignment: assignment as AssignmentWithDetails
      });
    }

    // Department suggestions
    if ('employee' in assignment && assignment.employee) {
      if (assignment.employee.department.toLowerCase().includes(queryLower)) {
        addSuggestion({
          type: 'department',
          value: assignment.employee.department,
          label: assignment.employee.department,
          description: '부서',
        });
      }
    }

    // Asset suggestions
    const assetName = 'asset' in assignment && assignment.asset
      ? assignment.asset.name
      : assignment.asset_description || assignment.asset_id;
    
    if (assetName.toLowerCase().includes(queryLower)) {
      addSuggestion({
        type: 'asset',
        value: assetName,
        label: assetName,
        description: `${assignment.asset_type === 'hardware' ? '하드웨어' : '소프트웨어'} • ${assignment.asset_id}`,
        assignment: assignment as AssignmentWithDetails
      });
    }

    // Asset ID suggestions
    if (assignment.asset_id.toLowerCase().includes(queryLower)) {
      addSuggestion({
        type: 'asset',
        value: assignment.asset_id,
        label: assignment.asset_id,
        description: `자산 ID • ${assetName}`,
        assignment: assignment as AssignmentWithDetails
      });
    }

    // Assignment ID suggestions
    if (assignment.id.toLowerCase().includes(queryLower)) {
      addSuggestion({
        type: 'assignment',
        value: assignment.id,
        label: assignment.id,
        description: `할당 ID • ${assignment.employee_name}`,
        assignment: assignment as AssignmentWithDetails
      });
    }

    // Manufacturer suggestions (for hardware)
    if ('asset' in assignment && assignment.asset && assignment.asset.manufacturer) {
      if (assignment.asset.manufacturer.toLowerCase().includes(queryLower)) {
        addSuggestion({
          type: 'asset',
          value: assignment.asset.manufacturer,
          label: assignment.asset.manufacturer,
          description: `제조사 • ${assignment.asset.type}`,
        });
      }
    }

    // Status suggestions
    if (assignment.status.includes(query)) {
      addSuggestion({
        type: 'status',
        value: assignment.status,
        label: assignment.status,
        description: '상태',
      });
    }
  });

  return suggestions;
};

const getSearchHistory = (): SearchHistory[] => {
  try {
    const history = localStorage.getItem('assignment_search_history');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

const addToSearchHistory = (query: string, resultCount: number) => {
  if (query.length < 2) return;
  
  try {
    const history = getSearchHistory();
    const newEntry: SearchHistory = {
      query,
      timestamp: Date.now(),
      resultCount
    };
    
    // Remove existing entry for the same query
    const filteredHistory = history.filter(item => item.query !== query);
    
    // Add new entry at the beginning
    const updatedHistory = [newEntry, ...filteredHistory].slice(0, 10);
    
    localStorage.setItem('assignment_search_history', JSON.stringify(updatedHistory));
  } catch {
    // Ignore localStorage errors
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AssignmentSearch({
  assignments,
  searchQuery,
  onSearchChange,
  onSuggestionSelect,
  onAdvancedSearch,
  placeholder = "직원명, 자산 ID, 할당 ID로 검색...",
  showSuggestions = true,
  showRecentSearches = true,
  maxSuggestions = 8,
  size = 'medium',
  variant = 'outlined'
}: AssignmentSearchProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);

  // Generate suggestions based on current query
  const suggestions = useMemo(() => {
    if (!showSuggestions || !isFocused) return [];
    
    if (inputValue.length >= 2) {
      return generateSearchSuggestions(assignments, inputValue, maxSuggestions);
    } else if (showRecentSearches) {
      // Show recent searches when no current query
      const history = getSearchHistory();
      return history.slice(0, 5).map(item => ({
        type: 'assignment' as const,
        value: item.query,
        label: item.query,
        description: `최근 검색 • ${item.resultCount}개 결과`,
      }));
    }
    
    return [];
  }, [assignments, inputValue, isFocused, showSuggestions, showRecentSearches, maxSuggestions]);

  // Update input value when external searchQuery changes
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Handle search input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    onSearchChange(value);
  }, [onSearchChange]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    setInputValue(suggestion.value);
    onSearchChange(suggestion.value);
    setIsFocused(false);
    
    // Add to search history
    const results = searchAssignments(assignments, suggestion.value);
    addToSearchHistory(suggestion.value, results.length);
    
    onSuggestionSelect?.(suggestion);
  }, [assignments, onSearchChange, onSuggestionSelect]);

  // Handle clear search
  const handleClear = useCallback(() => {
    setInputValue('');
    onSearchChange('');
    setIsFocused(false);
  }, [onSearchChange]);

  // Handle search submission
  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    if (inputValue.trim()) {
      const results = searchAssignments(assignments, inputValue);
      addToSearchHistory(inputValue, results.length);
    }
    setIsFocused(false);
  }, [assignments, inputValue]);

  // Get suggestion icon
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'employee':
      case 'department':
        return <PersonIcon fontSize="small" />;
      case 'asset':
        return <ComputerIcon fontSize="small" />;
      case 'assignment':
        return <AssignmentIcon fontSize="small" />;
      default:
        return <SearchIcon fontSize="small" />;
    }
  };

  // Get suggestion color
  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'employee':
      case 'department':
        return 'primary.main';
      case 'asset':
        return 'info.main';
      case 'assignment':
        return 'success.main';
      case 'status':
        return 'warning.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          size={size}
          variant={variant}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow clicking
            setTimeout(() => setIsFocused(false), 200);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {inputValue && (
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
                {onAdvancedSearch && (
                  <Tooltip title="고급 검색">
                    <IconButton
                      size="small"
                      onClick={onAdvancedSearch}
                      edge="end"
                      sx={{ ml: 0.5 }}
                    >
                      <FilterIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </InputAdornment>
            ),
            sx: {
              '& .MuiOutlinedInput-root': {
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                },
              },
            }
          }}
        />
      </form>

      {/* Search Suggestions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            mt: 0.5,
            maxHeight: 400,
            overflow: 'auto',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <List dense disablePadding>
            {suggestions.map((suggestion, index) => (
              <React.Fragment key={`${suggestion.type}-${suggestion.value}-${index}`}>
                <ListItem
                  button
                  onClick={() => handleSuggestionSelect(suggestion)}
                  sx={{
                    py: 1,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: getSuggestionColor(suggestion.type),
                        fontSize: '0.875rem',
                      }}
                    >
                      {getSuggestionIcon(suggestion.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight="medium">
                        {suggestion.label}
                      </Typography>
                    }
                    secondary={
                      suggestion.description && (
                        <Typography variant="caption" color="text.secondary">
                          {suggestion.description}
                        </Typography>
                      )
                    }
                  />
                  {suggestion.type === 'assignment' && !suggestion.description?.includes('최근 검색') && (
                    <TrendingIcon fontSize="small" color="action" />
                  )}
                </ListItem>
                {index < suggestions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Search Results Summary */}
      {inputValue && !isFocused && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            "{inputValue}"에 대한 검색 결과: {searchAssignments(assignments, inputValue).length}개
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// SEARCH RESULTS COMPONENT
// ============================================================================

interface SearchResultsProps {
  assignments: (Assignment | AssignmentWithDetails)[];
  searchQuery: string;
  onAssignmentClick?: (assignment: Assignment | AssignmentWithDetails) => void;
  maxResults?: number;
}

export function SearchResults({
  assignments,
  searchQuery,
  onAssignmentClick,
  maxResults = 50
}: SearchResultsProps) {
  const results = useMemo(() => {
    if (!searchQuery) return assignments;
    return searchAssignments(assignments, searchQuery).slice(0, maxResults);
  }, [assignments, searchQuery, maxResults]);

  if (!searchQuery) return null;

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        검색 결과 ({results.length}개)
      </Typography>
      
      {results.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            "{searchQuery}"에 대한 검색 결과가 없습니다.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            다른 검색어를 시도해보세요.
          </Typography>
        </Box>
      ) : (
        <List>
          {results.map((assignment) => (
            <ListItem
              key={assignment.id}
              button={!!onAssignmentClick}
              onClick={() => onAssignmentClick?.(assignment)}
              divider
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: assignment.asset_type === 'hardware' ? 'info.main' : 'success.main',
                  }}
                >
                  {assignment.asset_type === 'hardware' ? <ComputerIcon /> : <AssignmentIcon />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${assignment.employee_name} • ${assignment.asset_id}`}
                secondary={`${formatDate(assignment.assigned_date)} • ${assignment.status}`}
              />
              <Chip
                label={assignment.status}
                size="small"
                color={assignment.status === '사용중' ? 'primary' : 'default'}
                variant="outlined"
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AssignmentSearch;