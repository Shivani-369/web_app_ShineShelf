const pool = require('../config/db');

exports.getStats = async (req, res) => {
    const userId = req.user.id;
    try {
        const activeLoans = await pool.query(
            'SELECT COUNT(*) as count FROM transactions WHERE user_id = $1 AND return_date IS NULL',
            [userId]
        );
        const fines = await pool.query(
            'SELECT SUM(fine_amount) as sum FROM transactions WHERE user_id = $1',
            [userId]
        );

        res.json({
            activeLoans: parseInt(activeLoans.rows[0].count || 0),
            totalFines: parseFloat(fines.rows[0].sum || 0),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getActiveLoans = async (req, res) => {
    const userId = req.user.id;
    try {
        const query = `
      SELECT t.id, b.title, t.due_date, t.fine_amount
      FROM transactions t
      JOIN inventory i ON t.inventory_id = i.id
      JOIN books b ON i.book_id = b.id
      WHERE t.user_id = $1 AND t.return_date IS NULL
      ORDER BY t.due_date ASC
    `;
        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
