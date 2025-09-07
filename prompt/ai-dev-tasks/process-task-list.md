# Task List Management

Guidelines for managing task lists in markdown files to track progress on completing a PRD

## Task Implementation
- **One sub-task at a time:** Do **NOT** start the next sub‑task until you ask the user for permission and they say "yes" or "y"
- **Completion protocol:**
  1. When you finish a **sub‑task**, immediately mark it as completed by changing `[ ]` to `[x]`.
  2. **⚠️ CRITICAL: Verify actual completion before marking complete**
     - **DO NOT** mark tasks complete based on assumptions or estimates
     - **MUST** perform actual functional testing to verify implementation works
     - **REQUIRED**: Test actual user scenarios, not just code existence
  3. If **all** subtasks underneath a parent task are now `[x]`, follow this sequence:
    - **First**: Run the full test suite (`pytest`, `npm test`, `bin/rails test`, etc.)
    - **Only if all tests pass**: Stage changes (`git add .`)
    - **Clean up**: Remove any temporary files and temporary code before committing
    - **Commit**: Use a descriptive commit message that:
      - Uses conventional commit format (`feat:`, `fix:`, `refactor:`, etc.)
      - Summarizes what was accomplished in the parent task
      - Lists key changes and additions
      - References the task number and PRD context
      - **Formats the message as a single-line command using `-m` flags**, e.g.:

        ```
        git commit -m "feat: add payment validation logic" -m "- Validates card type and expiry" -m "- Adds unit tests for edge cases" -m "Related to T123 in PRD"
        ```
  4. Once all the subtasks are marked completed and changes have been committed, mark the **parent task** as completed.
- Stop after each sub‑task and wait for the user's go‑ahead.

## Task List Maintenance

1. **Update the task list as you work:**
   - Mark tasks and subtasks as completed (`[x]`) per the protocol above.
   - Add new tasks as they emerge.

2. **Maintain the "Relevant Files" section:**
   - List every file created or modified.
   - Give each file a one‑line description of its purpose.

## AI Instructions

When working with task lists, the AI must:

1. Regularly update the task list file after finishing any significant work.
2. Follow the completion protocol:
   - Mark each finished **sub‑task** `[x]`.
   - Mark the **parent task** `[x]` once **all** its subtasks are `[x]`.
3. Add newly discovered tasks.
4. Keep "Relevant Files" accurate and up to date.
5. Before starting work, check which sub‑task is next.
6. After implementing a sub‑task, update the file and then pause for user approval.

## Completion Verification Standards

### ❌ Incorrect Completion Criteria (DO NOT USE)
- "Code exists" - Just having code written doesn't mean it works
- "No syntax errors" - Code can compile but still not function correctly  
- "Looks complete" - Visual completion doesn't guarantee functional completion
- "Should work" - Assumptions are not acceptable for completion verification

### ✅ Correct Completion Criteria (REQUIRED)

#### For Implementation Tasks:
- [ ] **Functional Testing**: Feature actually works when tested manually
- [ ] **Integration Testing**: Works with existing system without breaking other features
- [ ] **Data Validation**: Correct data flows through the system
- [ ] **Error Handling**: Appropriate responses to invalid inputs/edge cases

#### For Test Tasks (8.x series):
- [ ] **Actual Test Execution**: Tests were run, not just planned
- [ ] **Multiple Environments**: Tested in different browsers/devices as applicable
- [ ] **User Scenario Testing**: Real user workflows tested end-to-end
- [ ] **Issue Documentation**: Any found issues documented and resolved

#### For UI/UX Tasks:
- [ ] **Visual Verification**: All UI elements display correctly
- [ ] **Interaction Testing**: All clickable elements respond appropriately
- [ ] **Responsive Behavior**: Layout works across different screen sizes
- [ ] **Accessibility**: Basic accessibility standards met

### Examples of Proper Verification

#### Example 1: Database Integration
**❌ Wrong**: "Added database queries to the code"
**✅ Right**: "Tested CRUD operations - can create, read, update, delete records successfully. Verified data persistence across server restarts."

#### Example 2: Responsive Design  
**❌ Wrong**: "Added CSS media queries"
**✅ Right**: "Tested layout on mobile (360px), tablet (768px), desktop (1200px). Navigation collapses properly, tables scroll horizontally on mobile."

#### Example 3: User Authentication
**❌ Wrong**: "Login form exists"
**✅ Right**: "Tested login with valid/invalid credentials. Proper redirects occur. Session management works. Logout clears session correctly."

### Verification Checklist Template

Before marking any task complete, use this checklist:

```markdown
## Task Completion Verification

**Task**: [Task Description]

### Implementation Verification
- [ ] Code written and syntax-error free
- [ ] Manual testing performed - feature works as expected
- [ ] Integration testing - doesn't break existing features
- [ ] Edge cases tested (invalid inputs, boundary conditions)
- [ ] Error handling verified

### Quality Verification  
- [ ] Code follows project conventions
- [ ] No temporary/debug code left in
- [ ] Comments added where necessary
- [ ] Performance acceptable

### Documentation
- [ ] Changes documented if needed
- [ ] Any new dependencies noted
- [ ] Breaking changes communicated

**Verified by**: [Name]
**Date**: [YYYY-MM-DD]
**Notes**: [Any additional notes or known limitations]
```

## Common Pitfalls to Avoid

1. **Marking tests complete without running them**
   - PRD shows "✅ Testing complete" but no actual testing occurred
   - Results in bugs discovered by users instead of during development

2. **Assuming implementation works**  
   - Code exists but was never executed to verify functionality
   - Integration issues not discovered until production

3. **Visual completion vs functional completion**
   - UI looks right but doesn't actually work
   - Forms exist but don't submit data correctly

4. **Partial implementation marked as complete**
   - Basic case works but edge cases crash
   - Happy path tested but error paths ignored

Remember: **If you wouldn't confidently demo this feature to a user right now, it's not complete.**