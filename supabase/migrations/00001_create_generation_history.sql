-- إنشاء جدول سجل التوليد للصور والفيديوهات
CREATE TABLE IF NOT EXISTS generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  aspect_ratio TEXT,
  duration TEXT,
  reference_strength DECIMAL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'failed')),
  task_id TEXT,
  result_url TEXT,
  thumbnail_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_generation_history_type ON generation_history(type);
CREATE INDEX IF NOT EXISTS idx_generation_history_created_at ON generation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_history_status ON generation_history(status);

-- تفعيل RLS
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة العامة
CREATE POLICY "Allow public read access" ON generation_history
  FOR SELECT USING (true);

-- سياسة للإدراج العام
CREATE POLICY "Allow public insert access" ON generation_history
  FOR INSERT WITH CHECK (true);

-- سياسة للتحديث العام
CREATE POLICY "Allow public update access" ON generation_history
  FOR UPDATE USING (true);

-- سياسة للحذف العام
CREATE POLICY "Allow public delete access" ON generation_history
  FOR DELETE USING (true);