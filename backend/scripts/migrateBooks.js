require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");

const migrateBooks = async () => {
    if (!process.env.MONGO_URI) {
        console.error("❌ Error: MONGO_URI is not defined in .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        const db = mongoose.connection.db;
        const booksCollection = db.collection("books");

        const books = await booksCollection.find({}).toArray();
        console.log(`Found ${books.length} book(s) to process.`);

        let updatedCount = 0;

        for (const book of books) {
            const updates = {};
            const unsets = {};

            // 1. Set quantity if missing
            const quantity = book.quantity !== undefined ? book.quantity : 1;
            if (book.quantity === undefined) {
                updates.quantity = 1;
            }

            // 2. Set availableQuantity if missing
            if (book.availableQuantity === undefined) {
                if (book.status === "Borrowed") {
                    updates.availableQuantity = 0;
                } else {
                    updates.availableQuantity = quantity;
                }
            }

            // 3. Remove obsolete owner and status fields
            if (book.owner !== undefined) {
                unsets.owner = "";
            }
            if (book.status !== undefined) {
                unsets.status = "";
            }

            const updateOp = {};
            if (Object.keys(updates).length > 0) {
                updateOp.$set = updates;
            }
            if (Object.keys(unsets).length > 0) {
                updateOp.$unset = unsets;
            }

            if (Object.keys(updateOp).length > 0) {
                await booksCollection.updateOne({ _id: book._id }, updateOp);
                updatedCount++;
            }
        }

        console.log(`✅ Migration completed. Updated ${updatedCount} book(s).`);
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("Database disconnected.");
        process.exit(0);
    }
};

migrateBooks();
