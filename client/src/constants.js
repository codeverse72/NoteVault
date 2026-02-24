// ========================================
// NoteVault — Constants
// ========================================

export const SUBJECTS = [
    { id: 'math', name: 'Mathematics', icon: '📐', color: '#8b5cf6' },
    { id: 'physics', name: 'Physics', icon: '⚛️', color: '#06b6d4' },
    { id: 'cs', name: 'Computer Science', icon: '💻', color: '#3b82f6' },
    { id: 'english', name: 'English', icon: '📝', color: '#ec4899' },
    { id: 'history', name: 'History', icon: '📜', color: '#f97316' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: '#10b981' },
    { id: 'biology', name: 'Biology', icon: '🧬', color: '#fbbf24' },
    { id: 'economics', name: 'Economics', icon: '📊', color: '#a78bfa' }
];

export const CLASSES = [
    { id: '9', name: 'Class 9' },
    { id: '10', name: 'Class 10' },
    { id: '11', name: 'Class 11' },
    { id: '12', name: 'Class 12' },
    { id: 'ug', name: 'Undergraduate' }
];

export const TOPICS = {
    math: ['Algebra', 'Geometry', 'Calculus', 'Trigonometry', 'Statistics', 'Probability', 'Linear Algebra', 'Number Theory'],
    physics: ['Mechanics', 'Thermodynamics', 'Optics', 'Electromagnetism', 'Modern Physics', 'Waves', 'Quantum Physics'],
    cs: ['Data Structures', 'Algorithms', 'OOP', 'Databases', 'Web Development', 'Machine Learning', 'Networks', 'Operating Systems'],
    english: ['Grammar', 'Literature', 'Essay Writing', 'Poetry', 'Comprehension', 'Vocabulary', 'Creative Writing'],
    history: ['Ancient History', 'Medieval History', 'Modern History', 'World Wars', 'Indian History', 'Civilization Studies'],
    chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Electrochemistry', 'Atomic Structure'],
    biology: ['Cell Biology', 'Genetics', 'Ecology', 'Human Anatomy', 'Evolution', 'Microbiology', 'Botany'],
    economics: ['Microeconomics', 'Macroeconomics', 'Statistics', 'Indian Economy', 'Development', 'Money & Banking']
};

export const BADGES = [
    { id: 'first_note', name: 'First Steps', icon: '🌟', desc: 'Share your first note', requirement: { type: 'notes_count', value: 1 } },
    { id: 'five_notes', name: 'Rising Star', icon: '⭐', desc: 'Share 5 notes', requirement: { type: 'notes_count', value: 5 } },
    { id: 'ten_notes', name: 'Prolific Writer', icon: '✨', desc: 'Share 10 notes', requirement: { type: 'notes_count', value: 10 } },
    { id: 'twenty_notes', name: 'Note Master', icon: '🏆', desc: 'Share 20 notes', requirement: { type: 'notes_count', value: 20 } },
    { id: 'popular', name: 'Crowd Favorite', icon: '❤️', desc: 'Get 10 total likes', requirement: { type: 'total_likes', value: 10 } },
    { id: 'viral', name: 'Going Viral', icon: '🔥', desc: 'Get 50 total likes', requirement: { type: 'total_likes', value: 50 } },
    { id: 'multi_subject', name: 'Renaissance', icon: '🎨', desc: 'Share notes in 3+ subjects', requirement: { type: 'unique_subjects', value: 3 } },
    { id: 'all_rounder', name: 'All-Rounder', icon: '🌈', desc: 'Share notes in 5+ subjects', requirement: { type: 'unique_subjects', value: 5 } },
    { id: 'follower_5', name: 'Influencer', icon: '👥', desc: 'Gain 5 followers', requirement: { type: 'followers_count', value: 5 } },
    { id: 'follower_20', name: 'Community Star', icon: '💫', desc: 'Gain 20 followers', requirement: { type: 'followers_count', value: 20 } }
];
