-- ==============================================================================
-- RENFORCEMENT DE SÉCURITÉ : POLITIQUES RLS MULTI-TENANT STRICTES (SUPABASE & BACKEND)
-- ==============================================================================
-- Ce script active RLS sur TOUTES les tables sensibles et impose une isolation
-- stricte par tenantId à partir du JWT serveur et du paramètre de session.

-- 1. Table TenantUser
ALTER TABLE "TenantUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantUser" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_user_isolation ON "TenantUser";
CREATE POLICY tenant_user_isolation ON "TenantUser" 
    FOR ALL 
    TO authenticated
    USING (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    ) 
    WITH CHECK (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    );

-- 2. Table Class
ALTER TABLE "Class" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Class" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS class_isolation ON "Class";
CREATE POLICY class_isolation ON "Class" 
    FOR ALL 
    TO authenticated
    USING (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    ) 
    WITH CHECK (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    );

-- 3. Table Student
ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Student" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS student_isolation ON "Student";
CREATE POLICY student_isolation ON "Student" 
    FOR ALL 
    TO authenticated
    USING (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    ) 
    WITH CHECK (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    );

-- 4. Table Teacher
ALTER TABLE "Teacher" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Teacher" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS teacher_isolation ON "Teacher";
CREATE POLICY teacher_isolation ON "Teacher" 
    FOR ALL 
    TO authenticated
    USING (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    ) 
    WITH CHECK (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    );

-- 5. Table Course
ALTER TABLE "Course" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Course" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS course_isolation ON "Course";
CREATE POLICY course_isolation ON "Course" 
    FOR ALL 
    TO authenticated
    USING (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    ) 
    WITH CHECK (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    );

-- 6. Table Timetable
ALTER TABLE "Timetable" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Timetable" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS timetable_isolation ON "Timetable";
CREATE POLICY timetable_isolation ON "Timetable" 
    FOR ALL 
    TO authenticated
    USING (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    ) 
    WITH CHECK (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    );

-- 7. Table TenantExpense (Mise en conformité RLS)
ALTER TABLE "TenantExpense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantExpense" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_expense_isolation ON "TenantExpense";
CREATE POLICY tenant_expense_isolation ON "TenantExpense" 
    FOR ALL 
    TO authenticated
    USING (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    ) 
    WITH CHECK (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    );

-- 8. Table Attendance (Mise en conformité RLS)
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS attendance_isolation ON "Attendance";
CREATE POLICY attendance_isolation ON "Attendance" 
    FOR ALL 
    TO authenticated
    USING (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    ) 
    WITH CHECK (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    );

-- 9. Table TenantModule (Mise en conformité RLS)
ALTER TABLE "TenantModule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantModule" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_module_isolation ON "TenantModule";
CREATE POLICY tenant_module_isolation ON "TenantModule" 
    FOR ALL 
    TO authenticated
    USING (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    ) 
    WITH CHECK (
        "tenantId"::text = auth.jwt() ->> 'tenant_id' 
        OR auth.jwt() ->> 'role' = 'super_admin' 
        OR "tenantId"::text = current_setting('app.tenant_id', true)
    );
