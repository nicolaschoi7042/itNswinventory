/**
 * Assignment Notes Editor Component
 * 
 * Advanced notes editor with rich text capabilities, templates,
 * and collaboration features for assignment management.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Alert,
  Stack,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha
} from '@mui/material';
import {
  Notes as NotesIcon,
  Template as TemplateIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Share as ShareIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// ============================================================================
// INTERFACES
// ============================================================================

export interface AssignmentNote {
  id: string;
  content: string;
  type: 'general' | 'technical' | 'issue' | 'schedule' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  author: string;
  authorName: string;
  created_at: string;
  updated_at?: string;
  tags: string[];
  visibility: 'public' | 'internal' | 'private';
  scheduledFor?: string;
  resolved?: boolean;
  references?: string[]; // Other assignment IDs or asset IDs
}

export interface NoteTemplate {
  id: string;
  name: string;
  content: string;
  type: AssignmentNote['type'];
  tags: string[];
  category: string;
}

interface AssignmentNotesEditorProps {
  assignmentId?: string;
  initialNotes?: AssignmentNote[];
  onNotesChange?: (notes: AssignmentNote[]) => void;
  readOnly?: boolean;
  compact?: boolean;
  showTemplates?: boolean;
  allowScheduling?: boolean;
  maxNotes?: number;
}

// ============================================================================
// NOTE TEMPLATES
// ============================================================================

const DEFAULT_TEMPLATES: NoteTemplate[] = [
  {
    id: 'tech-setup',
    name: '기술적 설정',
    content: '## 설정 사항\n- 소프트웨어 설치: \n- 계정 생성: \n- 권한 설정: \n- 네트워크 구성: \n\n## 확인 사항\n- [ ] 정상 작동 확인\n- [ ] 사용자 교육 완료\n- [ ] 문서 전달',
    type: 'technical',
    tags: ['설정', '기술지원'],
    category: 'setup'
  },
  {
    id: 'hardware-check',
    name: '하드웨어 점검',
    content: '## 하드웨어 상태\n- 외관 상태: \n- 성능 테스트: \n- 주변기기: \n\n## 문제점\n- 발견된 이슈: \n- 해결 방법: \n\n## 권장사항\n- ',
    type: 'technical',
    tags: ['하드웨어', '점검'],
    category: 'maintenance'
  },
  {
    id: 'issue-report',
    name: '문제 보고',
    content: '## 문제 상황\n- 발생 시간: \n- 문제 내용: \n- 영향도: \n\n## 조치 사항\n- 즉시 조치: \n- 추가 필요사항: \n\n## 후속 조치\n- ',
    type: 'issue',
    tags: ['문제', '보고'],
    category: 'issues'
  },
  {
    id: 'schedule-reminder',
    name: '일정 알림',
    content: '## 예정 작업\n- 작업 내용: \n- 예상 소요시간: \n- 필요 준비사항: \n\n## 주의사항\n- ',
    type: 'schedule',
    tags: ['일정', '알림'],
    category: 'scheduling'
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getNoteTypeColor = (type: AssignmentNote['type']) => {
  switch (type) {
    case 'technical': return 'info';
    case 'issue': return 'error';
    case 'schedule': return 'warning';
    case 'reminder': return 'secondary';
    default: return 'default';
  }
};

const getPriorityColor = (priority: AssignmentNote['priority']) => {
  switch (priority) {
    case 'urgent': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'info';
    default: return 'default';
  }
};

const formatNoteDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return date.toLocaleDateString('ko-KR');
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AssignmentNotesEditor({
  assignmentId,
  initialNotes = [],
  onNotesChange,
  readOnly = false,
  compact = false,
  showTemplates = true,
  allowScheduling = true,
  maxNotes = 50
}: AssignmentNotesEditorProps) {
  const theme = useTheme();
  
  const [notes, setNotes] = useState<AssignmentNote[]>(initialNotes);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<AssignmentNote | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<AssignmentNote['type']>('general');
  const [newNotePriority, setNewNotePriority] = useState<AssignmentNote['priority']>('medium');
  const [newNoteTags, setNewNoteTags] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  
  const [templateMenuAnchor, setTemplateMenuAnchor] = useState<HTMLElement | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplate | null>(null);

  // Available tags from existing notes
  const availableTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  // Handle notes change
  useEffect(() => {
    if (onNotesChange) {
      onNotesChange(notes);
    }
  }, [notes, onNotesChange]);

  // Create new note
  const handleCreateNote = useCallback(() => {
    if (!newNoteContent.trim()) return;

    const newNote: AssignmentNote = {
      id: `note_${Date.now()}`,
      content: newNoteContent,
      type: newNoteType,
      priority: newNotePriority,
      author: 'current_user', // Should be from auth context
      authorName: '현재 사용자', // Should be from auth context
      created_at: new Date().toISOString(),
      tags: newNoteTags,
      visibility: 'internal',
      scheduledFor: scheduledDate || undefined,
      resolved: false
    };

    setNotes(prev => [newNote, ...prev]);
    
    // Reset form
    setNewNoteContent('');
    setNewNoteType('general');
    setNewNotePriority('medium');
    setNewNoteTags([]);
    setScheduledDate('');
    setIsEditing(false);
  }, [newNoteContent, newNoteType, newNotePriority, newNoteTags, scheduledDate]);

  // Update existing note
  const handleUpdateNote = useCallback((noteId: string, updates: Partial<AssignmentNote>) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updated_at: new Date().toISOString() }
        : note
    ));
  }, []);

  // Delete note
  const handleDeleteNote = useCallback((noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  }, []);

  // Apply template
  const handleApplyTemplate = useCallback((template: NoteTemplate) => {
    setNewNoteContent(template.content);
    setNewNoteType(template.type);
    setNewNoteTags(template.tags);
    setTemplateMenuAnchor(null);
    setIsEditing(true);
  }, []);

  // Toggle note resolution
  const handleToggleResolved = useCallback((noteId: string) => {
    handleUpdateNote(noteId, { 
      resolved: !notes.find(n => n.id === noteId)?.resolved 
    });
  }, [notes, handleUpdateNote]);

  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotesIcon color="primary" />
            <Typography variant="h6">할당 노트</Typography>
            <Chip label={notes.length} size="small" color="primary" />
          </Box>
        }
        action={
          !readOnly && (
            <Stack direction="row" spacing={1}>
              {showTemplates && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<TemplateIcon />}
                  onClick={(e) => setTemplateMenuAnchor(e.currentTarget)}
                >
                  템플릿
                </Button>
              )}
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setIsEditing(true)}
                disabled={notes.length >= maxNotes}
              >
                노트 추가
              </Button>
            </Stack>
          )
        }
      />

      <CardContent>
        {/* New Note Editor */}
        {isEditing && !readOnly && (
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>새 노트 작성</Typography>
              
              <Stack spacing={2}>
                {/* Note Type and Priority */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Autocomplete
                    size="small"
                    value={newNoteType}
                    onChange={(_, value) => setNewNoteType(value || 'general')}
                    options={['general', 'technical', 'issue', 'schedule', 'reminder']}
                    getOptionLabel={(option) => {
                      const labels = {
                        general: '일반',
                        technical: '기술',
                        issue: '문제',
                        schedule: '일정',
                        reminder: '알림'
                      };
                      return labels[option];
                    }}
                    renderInput={(params) => <TextField {...params} label="유형" />}
                    sx={{ minWidth: 120 }}
                  />
                  
                  <Autocomplete
                    size="small"
                    value={newNotePriority}
                    onChange={(_, value) => setNewNotePriority(value || 'medium')}
                    options={['low', 'medium', 'high', 'urgent']}
                    getOptionLabel={(option) => {
                      const labels = {
                        low: '낮음',
                        medium: '보통',
                        high: '높음',
                        urgent: '긴급'
                      };
                      return labels[option];
                    }}
                    renderInput={(params) => <TextField {...params} label="우선순위" />}
                    sx={{ minWidth: 120 }}
                  />

                  {allowScheduling && (
                    <TextField
                      size="small"
                      type="datetime-local"
                      label="예약 시간"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ minWidth: 200 }}
                    />
                  )}
                </Box>

                {/* Tags */}
                <Autocomplete
                  multiple
                  size="small"
                  value={newNoteTags}
                  onChange={(_, value) => setNewNoteTags(value)}
                  options={availableTags}
                  freeSolo
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={index}
                        label={option}
                        size="small"
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="태그"
                      placeholder="태그 추가..."
                    />
                  )}
                />

                {/* Content */}
                <TextField
                  multiline
                  rows={compact ? 3 : 5}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="노트 내용을 입력하세요..."
                  fullWidth
                />

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setIsEditing(false);
                      setNewNoteContent('');
                      setNewNoteTags([]);
                      setScheduledDate('');
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<SaveIcon />}
                    onClick={handleCreateNote}
                    disabled={!newNoteContent.trim()}
                  >
                    저장
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Notes List */}
        {notes.length === 0 ? (
          <Alert severity="info">
            아직 작성된 노트가 없습니다. 첫 번째 노트를 추가해보세요.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {notes.map((note) => (
              <Card key={note.id} variant="outlined" sx={{ 
                opacity: note.resolved ? 0.7 : 1,
                borderLeft: `4px solid ${theme.palette[getPriorityColor(note.priority)].main}`
              }}>
                <CardContent>
                  {/* Note Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={note.type === 'general' ? '일반' : 
                              note.type === 'technical' ? '기술' :
                              note.type === 'issue' ? '문제' :
                              note.type === 'schedule' ? '일정' : '알림'}
                        size="small"
                        color={getNoteTypeColor(note.type) as any}
                      />
                      <Chip
                        label={note.priority === 'low' ? '낮음' :
                              note.priority === 'medium' ? '보통' :
                              note.priority === 'high' ? '높음' : '긴급'}
                        size="small"
                        color={getPriorityColor(note.priority) as any}
                        variant="outlined"
                      />
                      {note.resolved && (
                        <Chip label="해결됨" size="small" color="success" />
                      )}
                    </Box>

                    {!readOnly && (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleResolved(note.id)}
                          color={note.resolved ? "success" : "default"}
                        >
                          <FlagIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteNote(note.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  {/* Note Content */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      mb: 2,
                      textDecoration: note.resolved ? 'line-through' : 'none'
                    }}
                  >
                    {note.content}
                  </Typography>

                  {/* Note Tags */}
                  {note.tags.length > 0 && (
                    <Box sx={{ mb: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {note.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Note Meta */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    pt: 1,
                    borderTop: `1px solid ${theme.palette.divider}`
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="caption">
                        {note.authorName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatNoteDate(note.created_at)}
                      </Typography>
                      {note.updated_at && note.updated_at !== note.created_at && (
                        <Typography variant="caption" color="text.secondary">
                          (수정됨)
                        </Typography>
                      )}
                    </Box>

                    {note.scheduledFor && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ScheduleIcon fontSize="small" color="warning" />
                        <Typography variant="caption" color="warning.main">
                          {new Date(note.scheduledFor).toLocaleString('ko-KR')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        {/* Template Menu */}
        <Menu
          anchorEl={templateMenuAnchor}
          open={Boolean(templateMenuAnchor)}
          onClose={() => setTemplateMenuAnchor(null)}
        >
          {DEFAULT_TEMPLATES.map((template) => (
            <MenuItem
              key={template.id}
              onClick={() => handleApplyTemplate(template)}
            >
              <Box>
                <Typography variant="body2">{template.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {template.category}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AssignmentNotesEditor;