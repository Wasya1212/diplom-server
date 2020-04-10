const { Store } = require("koa-session2");
const mongoose = require("mongoose");

class MongoStore extends Store {
    constructor(collection) {
        super();
        this.model = {};
        this.collection = collection;
        this.init();
    }

    async init() {
        try {
            const Schema = mongoose.Schema;
            let sessionSchema = new Schema({
                sid: String,
                session: { type: Schema.Types.Mixed },
                lastAccess: { type: Date, index:true }
            })

            this.model = mongoose.model(this.collection, sessionSchema);
        } catch (error) {
            throw error;
        }
    }

    async get(sid) {
        try {
            let session;
            let document = await this.model.findOne({ sid: sid });
            if (document) {
                let created = new Date(document.lastAccess);
                let now = new Date();
                let time = now.getTime() - created.getTime();
                session = document.session;
                if (time > 3600) {
                    document.lastAccess = now;
                    await document.save();
                }
            }
            return session;
        } catch (error) {
            throw error;
        }
    }

    async set(session, { sid = this.getID(24) }) {
        try {
            let document = await this.model.findOne({ sid: sid })
            if (document) {
                document.session = session;
                document.markModified('session');
                await document.save()
            } else {
                this.model.create({
                    sid: sid,
                    session: session,
                    lastAccess: new Date()
                })
            }
            return sid;
        } catch (error) {
            throw error;
        }
    }

    async destroy(sid) {
        try {
            await this.model.deleteOne({ sid: sid });
            console.log(`session ${sid} destroyed`);
        } catch (error) {
            throw error;
        }
    }
}


module.exports = MongoStore;
