-- ==============================================================================
-- MIGRATION SUPABASE : GESTION DES TARIFS VERROUILLÉS & HISTORIQUE DES PLANS
-- avec Contraintes STRICTES NOT NULL sur plan_id et prix_verrouille
-- ==============================================================================

-- 1. Table plans (Source de vérité des offres SaaS)
CREATE TABLE IF NOT EXISTS public.plans (
    id VARCHAR(50) PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prix NUMERIC(12, 2) NOT NULL CHECK (prix >= 0),
    devise VARCHAR(10) DEFAULT 'FCFA',
    periodicite VARCHAR(20) DEFAULT 'MENSUEL', -- 'MENSUEL' ou 'ANNUEL'
    active_quota INTEGER DEFAULT 50,
    max_students INTEGER DEFAULT 750,
    annual_discount NUMERIC(5, 2) DEFAULT 0,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    statut VARCHAR(20) DEFAULT 'PUBLIE', -- 'BROUILLON' ou 'PUBLIE'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active RLS sur plans
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Policy RLS plans : Lecture publique pour les plans publiés
CREATE POLICY "Les plans publies sont lisibles par tous les utilisateurs authentifies"
    ON public.plans
    FOR SELECT
    TO authenticated
    USING (statut = 'PUBLIE');

-- Policy RLS plans : Seul le super-admin peut inserer/modifier/supprimer
CREATE POLICY "Gestion des plans reservee au superadmin"
    ON public.plans
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'super_admin');

-- 2. Table tenant_subscriptions (Abonnements des organisations)
CREATE TABLE IF NOT EXISTS public.tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL UNIQUE,
    plan_id VARCHAR(50) NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    prix_verrouille NUMERIC(12, 2) NOT NULL CHECK (prix_verrouille >= 0), -- Prix figé au contrat/souscription
    date_debut_cycle TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    date_prochain_renouvellement TIMESTAMP WITH TIME ZONE NOT NULL,
    statut VARCHAR(20) DEFAULT 'ACTIF' NOT NULL, -- 'ACTIF', 'EN_RETARD', 'ANNULE'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active RLS sur tenant_subscriptions
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy RLS : Un tenant ne peut lire que son propre abonnement, le super-admin peut tout lire
CREATE POLICY "Isolation tenant pour abonnement"
    ON public.tenant_subscriptions
    FOR SELECT
    TO authenticated
    USING (tenant_id = auth.jwt() ->> 'tenant_id' OR auth.jwt() ->> 'role' = 'super_admin');

-- Policy RLS : Seul le super-admin ou le processus de création peut insérer un abonnement
CREATE POLICY "Insertion abonnement lors de lonboarding"
    ON public.tenant_subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' = 'super_admin' OR tenant_id = auth.jwt() ->> 'tenant_id');

-- 3. Table plans_history (Traçabilité des changements de tarifs par le Super-Admin)
CREATE TABLE IF NOT EXISTS public.plans_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id VARCHAR(50) NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    ancien_prix NUMERIC(12, 2) NOT NULL,
    nouveau_prix NUMERIC(12, 2) NOT NULL,
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_id VARCHAR(255) DEFAULT 'superadmin@kpsydesk.com'
);

-- Active RLS sur plans_history
ALTER TABLE public.plans_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture historique reservee au superadmin"
    ON public.plans_history
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'super_admin');
