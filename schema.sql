-- ==============================================================================
-- Hamoksha Advertising Platform - Database Schema & Security Policies (Supabase / PostgreSQL)
-- مخطط قاعدة البيانات الكامل وسياسات الأمان وحماية البيانات (RLS)
-- ==============================================================================

-- 1. جدول مديري النظام (Admin Users)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    security_question TEXT NOT NULL DEFAULT 'ما هي بلدتك أو مدينتك المفضلة؟',
    security_answer_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. جدول إعدادات الموقع والنصوص (Site Settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'primary',
    site_title VARCHAR(255) NOT NULL DEFAULT 'حموكشة للدعاية والإعلانات',
    tagline TEXT NOT NULL DEFAULT 'لو عايز تكبر مشروعك.. تعالا عندنا!',
    bio_text TEXT NOT NULL,
    whatsapp_number VARCHAR(30) NOT NULL DEFAULT '01226438938',
    owner_name VARCHAR(100) NOT NULL DEFAULT 'حموكشة',
    location_city VARCHAR(255) NOT NULL DEFAULT 'جهينة الغربية، محافظة سوهاج، مصر',
    hero_image TEXT,
    stage_image TEXT,
    profile_image TEXT,
    announcement_text TEXT,
    show_announcement BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. جدول العروض والخصومات (Offers)
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    discount_badge VARCHAR(100),
    image_url TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    priority_order INT DEFAULT 1,
    whatsapp_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. جدول الحملات التسويقية ونماذج الأعمال (Campaigns)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(100) NOT NULL,
    media_type VARCHAR(20) DEFAULT 'image',
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    views_count VARCHAR(50),
    campaign_date VARCHAR(50),
    featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. جدول الريلز والفلوغات اليومية (Reels)
CREATE TABLE IF NOT EXISTS public.reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    duration VARCHAR(20) DEFAULT '0:45',
    views VARCHAR(50) DEFAULT '50K',
    upload_date VARCHAR(50) DEFAULT 'اليوم',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. جدول مناطق التغطية الميدانية في سوهاج (Coverage Areas)
CREATE TABLE IF NOT EXISTS public.coverage_areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- 7. جدول التقييمات مع نظام الاعتماد الأمني (Reviews & Moderation)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name VARCHAR(150) NOT NULL,
    business_name VARCHAR(200),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- سياسات الأمان على مستوى الصفوف (Row Level Security - RLS)
-- ==============================================================================

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coverage_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- السماح للعامة بقراءة المحتوى المنشور والمفعل فقط
CREATE POLICY "Public can view settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view active offers" ON public.offers FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active campaigns" ON public.campaigns FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active reels" ON public.reels FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view coverage areas" ON public.coverage_areas FOR SELECT USING (true);

-- سياسة التقييمات: العامة يرون التقييمات المعتمدة (approved) فقط!
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');

-- السماح للزوار بإرسال تقييم بحالة pending فقط (حماية من النشر المباشر)
CREATE POLICY "Public can submit pending reviews" ON public.reviews FOR INSERT WITH CHECK (status = 'pending');

-- عمليات التعديل والحذف مقصورة على المدير المصادق عليه (Authenticated Admin)
CREATE POLICY "Admin full access settings" ON public.site_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access offers" ON public.offers FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access campaigns" ON public.campaigns FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access reels" ON public.reels FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access areas" ON public.coverage_areas FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access reviews" ON public.reviews FOR ALL TO authenticated USING (true);

-- ==============================================================================
-- البيانات الأولية للمناطق المعتمدة (13 مركز في سوهاج)
-- ==============================================================================
INSERT INTO public.coverage_areas (name, is_available, notes) VALUES
('جهينة الغربية', true, 'المقر الرئيسي - تغطية يومية فورية'),
('جهينة الشرقية', true, 'تغطية مستمرة وتصوير ميداني'),
('طهطا', true, 'تغطيات أسبوعية لكبرى المحلات والمولات'),
('طما', true, 'متاح تصوير فلوجات وحملات إعلانية'),
('المراغة', true, 'خدمات إعلانية وزيارات للمحلات'),
('سوهاج', true, 'تغطية شاملة لعاصمة المحافظة والمراكز التجارية'),
('أخميم', true, 'حملات موجهة ودعم مشروعات الحرف والتجارة'),
('ساقلتة', true, 'تغطيات افتتاح وفلوجات خاصة'),
('المنشأة', true, 'متاح حجز مسبق للتصوير والإعلان'),
('جرجا', true, 'حملات إعلانية كبرى للأسواق والمحلات'),
('البلينا', true, 'خدمات إعلانية ودعم مشروعات الشباب'),
('دار السلام', true, 'تغطيات ميدانية وتصوير عروض'),
('العسيرات', true, 'متاح للزيارات والحملات الإعلانية')
ON CONFLICT (name) DO NOTHING;
