// ========================================
// NoteVault — Sample Data for Seeding
// ========================================

const now = Date.now();
const day = 86400000;

const sampleUsers = [
    { id: 'user_1', name: 'wani shahid', username: '@wani', email: 'wani@notevault.com', bio: 'Developer of NoteVault! ❤️', avatar_gradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', followers: ['user_2', 'user_3', 'user_5'], following: ['user_2', 'user_4'], badges: ['first_note', 'five_notes'] },
    { id: 'user_2', name: 'Aisha Khan', username: '@aisha_k', email: 'aisha@notevault.com', bio: 'Math enthusiast & problem solver 🧮', avatar_gradient: 'linear-gradient(135deg, #ec4899, #f97316)', followers: ['user_1', 'user_4', 'user_5'], following: ['user_1', 'user_3'], badges: ['first_note', 'five_notes', 'popular'] },
    { id: 'user_3', name: 'Raghav Patel', username: '@raghav_p', email: 'raghav@notevault.com', bio: 'Physics lover | Exploring the universe 🚀', avatar_gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)', followers: ['user_1', 'user_2'], following: ['user_1', 'user_6'], badges: ['first_note', 'multi_subject'] },
    { id: 'user_4', name: 'Priya Sharma', username: '@priya_codes', email: 'priya@notevault.com', bio: 'CS student | Open source contributor', avatar_gradient: 'linear-gradient(135deg, #3b82f6, #10b981)', followers: ['user_1', 'user_6'], following: ['user_2'], badges: ['first_note', 'ten_notes', 'all_rounder'] },
    { id: 'user_5', name: 'Arjun Mehta', username: '@arjun_m', email: 'arjun@notevault.com', bio: 'Biology & Chemistry geek 🧪', avatar_gradient: 'linear-gradient(135deg, #10b981, #fbbf24)', followers: ['user_1', 'user_2'], following: ['user_1', 'user_3'], badges: ['first_note'] },
    { id: 'user_6', name: 'Sneha Reddy', username: '@sneha_r', email: 'sneha@notevault.com', bio: 'History buff & storyteller 📜', avatar_gradient: 'linear-gradient(135deg, #f97316, #ec4899)', followers: ['user_3'], following: ['user_3', 'user_4'], badges: ['first_note'] }
];

const sampleNotes = [
    {
        id: 'note_1', userId: 'user_2', subject: 'math', classLevel: '11', topic: 'Calculus',
        title: 'Introduction to Limits & Continuity',
        content: `Understanding limits is the foundation of calculus. A limit describes the value a function approaches as the input approaches a certain point.\n\nKey Concepts:\n1. Left-hand limit (LHL)\n2. Right-hand limit (RHL)\n3. A limit exists when LHL = RHL`,
        likes: 24, likedBy: ['user_1', 'user_3', 'user_5'], views: 156, createdAt: now - 2 * day
    },
    {
        id: 'note_2', userId: 'user_3', subject: 'physics', classLevel: '12', topic: 'Electromagnetism',
        title: 'Maxwell\'s Equations Simplified',
        content: `Maxwell's four equations unify electricity and magnetism:\n1. Gauss's Law\n2. Faraday's Law\n3. Ampere-Maxwell Law`,
        likes: 31, likedBy: ['user_1', 'user_2', 'user_4', 'user_5'], views: 203, createdAt: now - 1 * day
    },
    {
        id: 'note_3', userId: 'user_4', subject: 'cs', classLevel: 'ug', topic: 'Data Structures',
        title: 'Binary Search Tree — Operations',
        content: `A BST maintains the property: Left values < node value, Right values > node value.\nSearching, Insertion, and Deletion are O(h).`,
        likes: 18, likedBy: ['user_1', 'user_2'], views: 134, createdAt: now - 3 * day
    },
    {
        id: 'note_4', userId: 'user_1', subject: 'math', classLevel: '10', topic: 'Algebra',
        title: 'Quadratic Equations Guide',
        content: `Standard form: ax² + bx + c = 0. Use the quadratic formula: x = (-b ± √(b²-4ac)) / 2a`,
        likes: 12, likedBy: ['user_2', 'user_3'], views: 98, createdAt: now - 5 * day
    },
    {
        id: 'note_5', userId: 'user_6', subject: 'history', classLevel: '10', topic: 'Modern History',
        title: 'The French Revolution — Impact',
        content: `The French Revolution (1789-1799) fundamentally transformed France, ending absolute monarchy.`,
        likes: 9, likedBy: ['user_1', 'user_3'], views: 67, createdAt: now - 3 * day
    },
    {
        id: 'note_6', userId: 'user_5', subject: 'chemistry', classLevel: '11', topic: 'Organic Chemistry',
        title: 'IUPAC Naming Rules',
        content: `Find the longest chain, number from closest substituent, list alphabetically.`,
        likes: 15, likedBy: ['user_1', 'user_2', 'user_4'], views: 112, createdAt: now - 1.5 * day
    }
];

module.exports = { sampleUsers, sampleNotes };
