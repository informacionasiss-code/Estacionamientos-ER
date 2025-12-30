// Supabase Configuration
// IMPORTANT: Replace these with your actual Supabase credentials
// Get them from: https://app.supabase.com/project/_/settings/api

const SUPABASE_CONFIG = {
    url: 'https://kzslhhctjfxsdvcrqvvs.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6c2xoaGN0amZ4c2R2Y3JxdnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDAzODQsImV4cCI6MjA4MTQxNjM4NH0.NQ1maFD5Nl8y-5TxJFjeSdhOSzOi-6Hd8o4VcrmLUKo'
};

// Admin password for desktop panel
const ADMIN_PASSWORD = 'Zulu2025';

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_CONFIG, ADMIN_PASSWORD };
}
