/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			// Для API роутов с query-параметрами
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '3000',
				pathname: '/api/auth/avatar/**',
			},
			// Для production - добавьте ваш домен
			{
				protocol: 'https',
				hostname: 'your-domain.com',
				pathname: '/api/auth/avatar/**',
			},
		],
		// Или используйте unoptimized для таких изображений
		unoptimized: false,
	},
	// Другие настройки...
};

module.exports = nextConfig;
