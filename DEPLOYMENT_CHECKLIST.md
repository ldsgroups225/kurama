# Deployment Checklist: Profile Implementation

Use this checklist to deploy the profile implementation to production.

## Pre-Deployment

### Code Review
- [ ] Review all new files
- [ ] Check TypeScript compilation
- [ ] Verify no console errors
- [ ] Review security implications
- [ ] Check for hardcoded values

### Testing
- [ ] Test student profile flow
- [ ] Test parent profile flow
- [ ] Test profile guard redirect
- [ ] Test form validation
- [ ] Test error handling
- [ ] Test back navigation
- [ ] Test on mobile devices
- [ ] Test with slow network
- [ ] Test with different browsers

### Database Preparation
- [ ] Backup production database
- [ ] Review migration files
- [ ] Test migrations on staging
- [ ] Prepare rollback plan
- [ ] Document database changes

## Deployment Steps

### Step 1: Build Data-Ops Package
```bash
pnpm run build:data-ops
```
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] Dist folder created

### Step 2: Generate Migrations
```bash
cd packages/data-ops
pnpm run drizzle:generate
```
- [ ] Migration files generated
- [ ] Review migration SQL
- [ ] Check for breaking changes
- [ ] Verify table names

### Step 3: Apply Migrations (Staging)
```bash
# On staging environment
pnpm run drizzle:migrate
```
- [ ] Migrations apply successfully
- [ ] All tables created
- [ ] Foreign keys established
- [ ] Indexes created

### Step 4: Seed Database (Staging)
```bash
node packages/data-ops/dist/database/seed-db.js
```
- [ ] Seeding completes
- [ ] All grades inserted (13)
- [ ] All series inserted (4)
- [ ] All subjects inserted (12)
- [ ] Level-series mappings created
- [ ] Subject offerings created

### Step 5: Test on Staging
- [ ] Sign in with test account
- [ ] Complete student profile
- [ ] Verify redirect to app
- [ ] Sign out and sign in again
- [ ] Verify no onboarding shown
- [ ] Test parent profile flow
- [ ] Check database records

### Step 6: Deploy to Production
```bash
# Deploy frontend
pnpm run deploy:kurama-frontend

# Deploy backend (if separate)
pnpm run deploy:kurama-backend
```
- [ ] Frontend deployed
- [ ] Backend deployed (if applicable)
- [ ] Environment variables set
- [ ] Database connection verified

### Step 7: Apply Migrations (Production)
```bash
# On production environment
pnpm run drizzle:migrate
```
- [ ] Migrations applied
- [ ] No errors
- [ ] Tables created
- [ ] Verify with SQL query

### Step 8: Seed Database (Production)
```bash
node packages/data-ops/dist/database/seed-db.js
```
- [ ] Seeding completed
- [ ] Verify data with SQL queries
- [ ] Check counts match expected

## Post-Deployment

### Verification
- [ ] Visit production URL
- [ ] Sign in with test account
- [ ] Complete onboarding
- [ ] Verify profile saved
- [ ] Check database records
- [ ] Test returning user flow

### Monitoring
- [ ] Check error logs
- [ ] Monitor database queries
- [ ] Watch for failed requests
- [ ] Check performance metrics
- [ ] Monitor user completion rates

### User Communication
- [ ] Notify team of deployment
- [ ] Update documentation
- [ ] Prepare support materials
- [ ] Brief support team

## Rollback Plan

If issues occur:

### Step 1: Revert Frontend
```bash
# Revert to previous deployment
git revert <commit-hash>
pnpm run deploy:kurama-frontend
```

### Step 2: Revert Database (if needed)
```bash
# Restore from backup
psql -U username -d database < backup.sql
```

### Step 3: Notify Team
- [ ] Alert team of rollback
- [ ] Document issues encountered
- [ ] Plan fix and redeployment

## Database Verification Queries

### Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Check Grades
```sql
SELECT COUNT(*) as total, category, COUNT(*) 
FROM grades 
GROUP BY category;
-- Expected: PRIMARY=6, COLLEGE=4, LYCEE=3
```

### Check Series
```sql
SELECT * FROM series ORDER BY display_order;
-- Expected: 4 rows (A, C, D, E)
```

### Check Subjects
```sql
SELECT COUNT(*) FROM subjects;
-- Expected: 12
```

### Check Level-Series Mappings
```sql
SELECT COUNT(*) FROM level_series;
-- Expected: 12 (3 lycée levels × 4 series)
```

### Check Subject Offerings
```sql
SELECT COUNT(*) FROM subject_offerings;
-- Expected: 150+
```

### Check User Profiles
```sql
SELECT 
  user_type,
  COUNT(*) as count,
  SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) as completed
FROM user_profiles
GROUP BY user_type;
```

## Environment Variables

Verify these are set in production:

```bash
# Database
DATABASE_HOST=your-db-host
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password

# Auth (if needed)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret

# Other
NODE_ENV=production
```

## Performance Checks

### Database Indexes
```sql
-- Check indexes exist
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Query Performance
```sql
-- Test profile status query
EXPLAIN ANALYZE
SELECT * FROM user_profiles WHERE user_id = 'test-user-id';

-- Test educational data query
EXPLAIN ANALYZE
SELECT * FROM grades WHERE is_active = true ORDER BY display_order;
```

## Security Checks

- [ ] All server functions use auth middleware
- [ ] No sensitive data in client code
- [ ] Environment variables not committed
- [ ] Database credentials secure
- [ ] CORS configured correctly
- [ ] Rate limiting in place (if applicable)

## Accessibility Checks

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Focus indicators visible
- [ ] Error messages clear
- [ ] Labels on all inputs

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Mobile Testing

- [ ] Forms work on mobile
- [ ] Touch targets adequate
- [ ] Keyboard doesn't obscure inputs
- [ ] Responsive layout works
- [ ] Loading states visible

## Analytics Setup

- [ ] Track onboarding starts
- [ ] Track onboarding completions
- [ ] Track user type selection
- [ ] Track form errors
- [ ] Track completion time

## Documentation Updates

- [ ] Update README
- [ ] Update API documentation
- [ ] Update user guide
- [ ] Update team wiki
- [ ] Create support articles

## Team Training

- [ ] Brief development team
- [ ] Train support team
- [ ] Update onboarding docs
- [ ] Prepare FAQ
- [ ] Schedule Q&A session

## Success Metrics

Track these for first week:

- [ ] Onboarding completion rate
- [ ] Average completion time
- [ ] Error rate
- [ ] User type distribution
- [ ] Grade/series distribution
- [ ] Support tickets

## Emergency Contacts

- **Database Admin**: [Name/Contact]
- **DevOps Lead**: [Name/Contact]
- **Product Manager**: [Name/Contact]
- **On-Call Engineer**: [Name/Contact]

## Sign-Off

- [ ] Code reviewed by: _______________
- [ ] Tested by: _______________
- [ ] Approved by: _______________
- [ ] Deployed by: _______________
- [ ] Verified by: _______________

**Deployment Date**: _______________
**Deployment Time**: _______________
**Deployed By**: _______________

## Notes

_Add any deployment-specific notes here_

---

**Status**: Ready for deployment ✅
