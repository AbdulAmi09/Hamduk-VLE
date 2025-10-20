-- Hamduk VLE Sample Data
-- Phase 4: Seed database with sample data for testing

-- Insert institutions
INSERT INTO institutions (name, country) VALUES
('University of Lagos', 'Nigeria'),
('Covenant University', 'Nigeria'),
('University of Ibadan', 'Nigeria')
ON CONFLICT DO NOTHING;

-- Insert users (passwords should be hashed in production)
INSERT INTO users (email, password_hash, full_name, role, institution_id, avatar_url) VALUES
('admin@hamduk.edu', 'hashed_password_1', 'Admin User', 'admin', (SELECT id FROM institutions WHERE name = 'University of Lagos'), 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'),
('instructor1@hamduk.edu', 'hashed_password_2', 'Dr. Adekunle Okafor', 'instructor', (SELECT id FROM institutions WHERE name = 'University of Lagos'), 'https://api.dicebear.com/7.x/avataaars/svg?seed=instructor1'),
('instructor2@hamduk.edu', 'hashed_password_3', 'Prof. Chioma Adeyemi', 'instructor', (SELECT id FROM institutions WHERE name = 'University of Lagos'), 'https://api.dicebear.com/7.x/avataaars/svg?seed=instructor2'),
('student1@hamduk.edu', 'hashed_password_4', 'Tunde Oladele', 'student', (SELECT id FROM institutions WHERE name = 'University of Lagos'), 'https://api.dicebear.com/7.x/avataaars/svg?seed=student1'),
('student2@hamduk.edu', 'hashed_password_5', 'Zainab Hassan', 'student', (SELECT id FROM institutions WHERE name = 'University of Lagos'), 'https://api.dicebear.com/7.x/avataaars/svg?seed=student2'),
('student3@hamduk.edu', 'hashed_password_6', 'Chinedu Nwosu', 'student', (SELECT id FROM institutions WHERE name = 'University of Lagos'), 'https://api.dicebear.com/7.x/avataaars/svg?seed=student3'),
('student4@hamduk.edu', 'hashed_password_7', 'Amara Obi', 'student', (SELECT id FROM institutions WHERE name = 'University of Lagos'), 'https://api.dicebear.com/7.x/avataaars/svg?seed=student4')
ON CONFLICT DO NOTHING;

-- Insert courses
INSERT INTO courses (code, title, description, instructor_id, institution_id, semester, start_date, end_date) VALUES
('CS101', 'Introduction to Computer Science', 'Fundamentals of computer science and programming', 
  (SELECT id FROM users WHERE email = 'instructor1@hamduk.edu'),
  (SELECT id FROM institutions WHERE name = 'University of Lagos'),
  'Fall 2024', '2024-09-01', '2024-12-15'),
('CS201', 'Data Structures and Algorithms', 'Advanced data structures and algorithm design',
  (SELECT id FROM users WHERE email = 'instructor1@hamduk.edu'),
  (SELECT id FROM institutions WHERE name = 'University of Lagos'),
  'Fall 2024', '2024-09-01', '2024-12-15'),
('MATH101', 'Calculus I', 'Differential and integral calculus',
  (SELECT id FROM users WHERE email = 'instructor2@hamduk.edu'),
  (SELECT id FROM institutions WHERE name = 'University of Lagos'),
  'Fall 2024', '2024-09-01', '2024-12-15')
ON CONFLICT DO NOTHING;

-- Insert enrollments
INSERT INTO enrollments (student_id, course_id, status) VALUES
((SELECT id FROM users WHERE email = 'student1@hamduk.edu'), (SELECT id FROM courses WHERE code = 'CS101'), 'active'),
((SELECT id FROM users WHERE email = 'student2@hamduk.edu'), (SELECT id FROM courses WHERE code = 'CS101'), 'active'),
((SELECT id FROM users WHERE email = 'student3@hamduk.edu'), (SELECT id FROM courses WHERE code = 'CS101'), 'active'),
((SELECT id FROM users WHERE email = 'student4@hamduk.edu'), (SELECT id FROM courses WHERE code = 'CS101'), 'active'),
((SELECT id FROM users WHERE email = 'student1@hamduk.edu'), (SELECT id FROM courses WHERE code = 'CS201'), 'active'),
((SELECT id FROM users WHERE email = 'student2@hamduk.edu'), (SELECT id FROM courses WHERE code = 'CS201'), 'active'),
((SELECT id FROM users WHERE email = 'student1@hamduk.edu'), (SELECT id FROM courses WHERE code = 'MATH101'), 'active'),
((SELECT id FROM users WHERE email = 'student3@hamduk.edu'), (SELECT id FROM courses WHERE code = 'MATH101'), 'active')
ON CONFLICT DO NOTHING;

-- Insert lectures
INSERT INTO lectures (course_id, title, description, video_url, duration_minutes, scheduled_date, is_mandatory) VALUES
((SELECT id FROM courses WHERE code = 'CS101'), 'Introduction to Programming', 'Learn the basics of programming', 'https://example.com/video1.mp4', 60, '2024-09-05 10:00:00', true),
((SELECT id FROM courses WHERE code = 'CS101'), 'Variables and Data Types', 'Understanding variables and data types', 'https://example.com/video2.mp4', 45, '2024-09-12 10:00:00', true),
((SELECT id FROM courses WHERE code = 'CS101'), 'Control Flow', 'If statements and loops', 'https://example.com/video3.mp4', 50, '2024-09-19 10:00:00', true),
((SELECT id FROM courses WHERE code = 'CS201'), 'Arrays and Lists', 'Working with arrays and linked lists', 'https://example.com/video4.mp4', 55, '2024-09-06 14:00:00', true),
((SELECT id FROM courses WHERE code = 'MATH101'), 'Limits and Continuity', 'Understanding limits in calculus', 'https://example.com/video5.mp4', 65, '2024-09-07 09:00:00', true)
ON CONFLICT DO NOTHING;

-- Insert assessments
INSERT INTO assessments (course_id, title, type, due_date, total_points) VALUES
((SELECT id FROM courses WHERE code = 'CS101'), 'Quiz 1: Programming Basics', 'quiz', '2024-09-15 23:59:59', 20),
((SELECT id FROM courses WHERE code = 'CS101'), 'Assignment 1: Hello World', 'assignment', '2024-09-20 23:59:59', 30),
((SELECT id FROM courses WHERE code = 'CS201'), 'Midterm Exam', 'exam', '2024-10-15 14:00:00', 100),
((SELECT id FROM courses WHERE code = 'MATH101'), 'Problem Set 1', 'assignment', '2024-09-20 23:59:59', 25)
ON CONFLICT DO NOTHING;

-- Insert sample attendance records
INSERT INTO attendance (lecture_id, student_id, attended, watched_duration_minutes, marked_at) VALUES
((SELECT id FROM lectures WHERE title = 'Introduction to Programming'), (SELECT id FROM users WHERE email = 'student1@hamduk.edu'), true, 60, CURRENT_TIMESTAMP),
((SELECT id FROM lectures WHERE title = 'Introduction to Programming'), (SELECT id FROM users WHERE email = 'student2@hamduk.edu'), true, 55, CURRENT_TIMESTAMP),
((SELECT id FROM lectures WHERE title = 'Introduction to Programming'), (SELECT id FROM users WHERE email = 'student3@hamduk.edu'), false, 30, CURRENT_TIMESTAMP),
((SELECT id FROM lectures WHERE title = 'Variables and Data Types'), (SELECT id FROM users WHERE email = 'student1@hamduk.edu'), true, 45, CURRENT_TIMESTAMP),
((SELECT id FROM lectures WHERE title = 'Variables and Data Types'), (SELECT id FROM users WHERE email = 'student2@hamduk.edu'), true, 40, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Insert sample grades
INSERT INTO grades (assessment_id, student_id, score, feedback, submitted_at, graded_at) VALUES
((SELECT id FROM assessments WHERE title = 'Quiz 1: Programming Basics'), (SELECT id FROM users WHERE email = 'student1@hamduk.edu'), 18, 'Excellent work!', '2024-09-14 15:30:00', '2024-09-14 16:00:00'),
((SELECT id FROM assessments WHERE title = 'Quiz 1: Programming Basics'), (SELECT id FROM users WHERE email = 'student2@hamduk.edu'), 16, 'Good effort, review loops', '2024-09-14 14:20:00', '2024-09-14 16:00:00'),
((SELECT id FROM assessments WHERE title = 'Assignment 1: Hello World'), (SELECT id FROM users WHERE email = 'student1@hamduk.edu'), 28, 'Well structured code', '2024-09-19 10:15:00', '2024-09-19 11:00:00'),
((SELECT id FROM assessments WHERE title = 'Problem Set 1'), (SELECT id FROM users WHERE email = 'student1@hamduk.edu'), 23, 'Great problem solving', '2024-09-19 18:45:00', '2024-09-19 19:30:00')
ON CONFLICT DO NOTHING;
