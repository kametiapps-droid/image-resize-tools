-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Tools table
CREATE TABLE IF NOT EXISTS tools (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT NOT NULL,
  category     TEXT NOT NULL,
  icon         TEXT,
  usage_count  INTEGER NOT NULL DEFAULT 0,
  featured     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tool usage events table
CREATE TABLE IF NOT EXISTS tool_usage_events (
  id           SERIAL PRIMARY KEY,
  tool_id      TEXT NOT NULL REFERENCES tools(id),
  file_type    TEXT,
  file_size_kb INTEGER,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Index for faster stats queries
CREATE INDEX IF NOT EXISTS idx_events_created_at ON tool_usage_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_tool_id    ON tool_usage_events(tool_id);

-- 4. Seed initial tools
INSERT INTO tools (id, name, slug, description, category, featured) VALUES
  ('image-resizer',     'Image Resizer',     'image-resizer',     'Resize images to any dimension',           'resize',    TRUE),
  ('image-compressor',  'Image Compressor',  'image-compressor',  'Compress images without losing quality',   'compress',  TRUE),
  ('image-converter',   'Image Converter',   'image-converter',   'Convert images between formats',           'convert',   FALSE),
  ('image-cropper',     'Image Cropper',     'image-cropper',     'Crop images to any size',                  'crop',      FALSE),
  ('watermark',         'Watermark',         'watermark',         'Add watermarks to your images',            'edit',      FALSE),
  ('image-rotator',     'Image Rotator',     'image-rotator',     'Rotate and flip images',                   'edit',      FALSE),
  ('image-to-pdf',      'Image to PDF',      'image-to-pdf',      'Convert images to PDF documents',          'convert',   FALSE),
  ('color-picker',      'Color Picker',      'color-picker',      'Pick colors from any image',               'utility',   FALSE),
  ('metadata-remover',  'Metadata Remover',  'metadata-remover',  'Remove EXIF metadata from images',         'utility',   FALSE)
ON CONFLICT (id) DO NOTHING;
