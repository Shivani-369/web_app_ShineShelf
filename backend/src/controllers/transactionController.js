const pool = require('../config/db');

// Borrow a book
exports.borrowBook = async (req, res) => {
    const userId = req.user.id;
    const { bookId } = req.body;

    try {
        // Start transaction - Use IMMEDIATE for exclusive lock in SQLite
        pool.query('BEGIN IMMEDIATE');

        // Find an available copy
        const inventoryResult = pool.query(
            "SELECT id FROM inventory WHERE book_id = $1 AND status = 'available' LIMIT 1",
            [bookId]
        );

        if (inventoryResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ error: 'No available copies for this book' });
        }

        const inventoryId = inventoryResult.rows[0].id;

        // Update inventory status
        await pool.query(
            "UPDATE inventory SET status = 'borrowed' WHERE id = $1",
            [inventoryId]
        );

        // Create transaction record
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        const transactionResult = await pool.query(
            "INSERT INTO transactions (user_id, inventory_id, issue_date, due_date) VALUES ($1, $2, CURRENT_TIMESTAMP, $3) RETURNING *",
            [userId, inventoryId, dueDate.toISOString()]
        );

        await pool.query('COMMIT');

        res.status(201).json({
            message: 'Book borrowed successfully',
            transaction: transactionResult.rows[0]
        });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Borrow error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Return a book
exports.returnBook = async (req, res) => {
    const { transactionId } = req.params;
    try {
        // Get transaction and inventory details
        const txResult = await pool.query(
            "SELECT inventory_id, due_date FROM transactions WHERE id = $1 AND user_id = $2 AND return_date IS NULL",
            [transactionId, req.user.id]
        );

        if (txResult.rows.length === 0) {
            return res.status(404).json({ error: 'Active transaction not found' });
        }

        const { inventory_id, due_date } = txResult.rows[0];

        // Calculate fine if overdue
        const now = new Date();
        const dueDate = new Date(due_date);
        let fine = 0;
        if (now > dueDate) {
            const diffDays = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
            fine = diffDays * 1.50; // $1.50 per day late
        }

        await pool.query('BEGIN');

        // Update transaction
        await pool.query(
            "UPDATE transactions SET return_date = CURRENT_TIMESTAMP, fine_amount = $1 WHERE id = $2",
            [fine, transactionId]
        );

        // Update inventory
        await pool.query(
            "UPDATE inventory SET status = 'available' WHERE id = $1",
            [inventory_id]
        );

        await pool.query('COMMIT');

        res.json({
            message: 'Book returned successfully',
            fineAmount: fine
        });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
};
