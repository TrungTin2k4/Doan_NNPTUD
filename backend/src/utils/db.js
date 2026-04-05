var _a;
import mongoose from "mongoose";
const cache = (_a = global.__mongooseCache) !== null && _a !== void 0 ? _a : {
    conn: null,
    promise: null,
};
if (!global.__mongooseCache) {
    global.__mongooseCache = cache;
}
export async function connectToDatabase() {
    if (cache.conn) {
        return cache.conn;
    }
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("MONGODB_URI is required");
    }
    if (!cache.promise) {
        cache.promise = mongoose.connect(mongoUri, {
            dbName: process.env.MONGODB_DB,
        });
    }
    cache.conn = await cache.promise;
    return cache.conn;
}
