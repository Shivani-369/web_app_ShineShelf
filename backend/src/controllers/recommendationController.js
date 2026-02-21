const pool = require('../config/db');

// Get personalized recommendations for a user
exports.getPersonalizedRecommendations = async (req, res) => {
    const userId = req.user.id;
    try {
        // Query logic:
        // 1. Get genres the user has borrowed before
        // 2. Recommend books from those genres that the user hasn't borrowed yet
        // 3. Fallback to top rated books if no history
        const query = `
            WITH user_genres AS (
                SELECT DISTINCT b.genre
                FROM transactions t
                JOIN inventory i ON t.inventory_id = i.id
                JOIN books b ON i.book_id = b.id
                WHERE t.user_id = $1
            )
            SELECT b.*
            FROM books b
            JOIN user_genres ug ON b.genre = ug.genre
            WHERE b.id NOT IN (
                SELECT i.book_id 
                FROM transactions t
                JOIN inventory i ON t.inventory_id = i.id
                WHERE t.user_id = $1
            )
            LIMIT 5;
        `;
        const result = await pool.query(query, [userId]);

        // Fallback: If no history-based recommendations, return top rated books
        if (result.rows.length === 0) {
            const fallbackQuery = `
                SELECT b.*, AVG(r.rating) as avg_rating
                FROM books b
                LEFT JOIN reviews r ON b.id = r.book_id
                GROUP BY b.id
                ORDER BY avg_rating IS NULL ASC, avg_rating DESC
                LIMIT 5;
            `;
            const fallbackResult = await pool.query(fallbackQuery);
            return res.json(fallbackResult.rows);
        }

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get "You might also like" for a specific book
exports.getSimilarBooks = async (req, res) => {
    const { bookId } = req.params;
    try {
        const query = `
            SELECT b2.*
            FROM books b1
            JOIN books b2 ON b1.genre = b2.genre AND b1.id <> b2.id
            WHERE b1.id = $1
            LIMIT 5;
        `;
        const result = await pool.query(query, [bookId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
