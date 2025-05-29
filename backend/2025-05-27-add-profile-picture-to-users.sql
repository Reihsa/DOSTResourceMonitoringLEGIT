-- Migration: Add profile_picture column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255) NOT NULL DEFAULT 'default-profile.jpg';
