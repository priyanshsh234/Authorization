import mongoose from "mongoose";

const connectdb = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('Database connected'));
        await mongoose.connect(`${process.env.MONGODB_URI}/mern-auth`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export default connectdb;