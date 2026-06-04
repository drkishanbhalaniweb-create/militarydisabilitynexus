-- Migration: 037_rpc_related_content.sql
-- Description: Adds RPCs to push "Related Insights" compute to PostgreSQL

CREATE OR REPLACE FUNCTION get_related_blogs(
  target_category text,
  target_tags text[],
  exclude_id uuid,
  limit_count int DEFAULT 3
)
RETURNS SETOF blog_posts
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT b.*
  FROM blog_posts b
  WHERE b.id != exclude_id
    AND b.is_published = true
  ORDER BY 
    (CASE WHEN b.category = target_category THEN 10 ELSE 0 END) +
    (SELECT count(*) * 5 FROM unnest(b.tags) t(tag) WHERE tag = ANY(target_tags)) DESC,
    b.created_at DESC
  LIMIT limit_count;
END;
$$;

CREATE OR REPLACE FUNCTION get_related_case_studies(
  target_tags text[],
  exclude_id uuid,
  limit_count int DEFAULT 3
)
RETURNS SETOF case_studies
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT c.*
  FROM case_studies c
  WHERE c.id != exclude_id
    AND c.is_published = true
  ORDER BY 
    (SELECT count(*) * 5 FROM unnest(c.tags) t(tag) WHERE tag = ANY(target_tags)) DESC,
    c.created_at DESC
  LIMIT limit_count;
END;
$$;
