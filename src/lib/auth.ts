import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.DELIVERY_SHOP_DB_URL!);
const db = client.db('delivery-shop');

export const auth = betterAuth({
	database: mongodbAdapter(db),
	//...
});
