import VerifyEmail from '@/app/(auth)/(reg)/_components/VerifyEmail';
import PasswordResetEmail from '@/app/(auth)/(update-pass)/_components/PasswordResetEmail';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { phoneNumber } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';
import { Resend } from 'resend';

const client = new MongoClient(process.env.DELIVERY_SHOP_DB_URL!);
const db = client.db('deliveryshop');
const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
	database: mongodbAdapter(db),
	session: {
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24,
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		resetPasswordTokenExpiresIn: 86400,
		sendResetPassword: async ({ user, url }) => {
			await resend.emails.send({
				//почтовый домен надо/заглушка щас
				from: 'Северяночка <onboarding@resend.dev>',
				//куда отправлять
				to: user.email,
				//заголовок
				subject: 'Сброс пароля для Северяночки',
				//компонент - тело письма
				react: PasswordResetEmail({
					username: user.name,
					resetUrl: url,
				}),
			});
		},
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			await resend.emails.send({
				//почтовый домен надо/заглушка щас
				from: 'Северяночка <onboarding@resend.dev>',
				//куда отправлять
				to: user.email,
				//заголовок
				subject: 'Подтвердите email',
				//компонент - тело письма
				react: VerifyEmail({ username: user.name, verifyUrl: url }),
			});
		},
		expiresIn: 86400,
		autoSignInAfterVerification: false,
	},
	plugins: [
		phoneNumber({
			sendOTP: async ({ phoneNumber, code }) => {
				console.log(`[DEBUG] Отправка OTP: ${code} для ${phoneNumber}`);
			},
			//чтобы лимиты не тратить берём заглушку сверху, а этот код коментим
			// sendOTP: async ({ phoneNumber, code }) => {
			// 	try {
			// 		const response = await fetch(
			// 			`https://sms.ru/sms/send?api_id=${process.env.SMS_API_ID}&
			// 			to=${phoneNumber}&msg=Ваш код подтверждения от магазина
			// 			"Северяночка" :${code}&json=1`
			// 		);
			// 		const result = await response.json();
			// 		if (result.status !== 'OK') {
			// 			throw new Error(result.status || 'Ошибка отправки SMS');
			// 		}
			// 	} catch (error) {
			// 		console.error('Ошибка отправки SMS:', error);
			// 		throw error;
			// 	}
			// },
			signUpOnVerification: {
				getTempEmail: (phoneNumber) => {
					return `${phoneNumber}@delivery-shop.ru`;
				},
				getTempName: (phoneNumber) => {
					return phoneNumber;
				},
			},
			allowedAttempts: 3,
			otpLength: 4,
			expiresIn: 300,
			requireVerification: true,
		}),
	],
	user: {
		additionalFields: {
			//имя и емаил не надо, это система будет автоматом писать
			phoneNumber: { type: 'string', input: true, required: true },
			surname: { type: 'string', input: true, required: true },
			birthdayDate: { type: 'date', input: true, required: true },
			region: { type: 'string', input: true, required: true },
			location: { type: 'string', input: true, required: true },
			gender: { type: 'string', input: true, required: true },
			card: { type: 'string', input: true, required: false },
			hasCard: { type: 'boolean', input: true, required: false },
		},
	},
});
