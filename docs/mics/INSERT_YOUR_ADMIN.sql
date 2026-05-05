-- ============================================
-- INSERT YOUR ADMIN ACCOUNT
-- Replace the values below with YOUR information
-- ============================================

-- Your user ID from the error: 934093a8-ce71-4080-8a57-05da1489ade1
-- Replace 'your-email@example.com' with your actual email
-- Replace 'Your Name' with your actual name

INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  '934093a8-ce71-4080-8a57-05da1489ade1',
  'your-email@example.com',
  'Your Name',
  'super_admin',
  true
)
ON CONFLICT (id) DO UPDATE 
SET role = 'super_admin', is_active = true;

-- Verify it worked:
SELECT * FROM admin_users WHERE id = '934093a8-ce71-4080-8a57-05da1489ade1';
