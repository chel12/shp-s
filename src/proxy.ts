import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
//проверяем куки
export async function proxy(request: NextRequest) {
	//защищенные пути
	const protectedPaths = ['/profile', '/administrator', '/cart', '/favorite'];
	const isProtectedPath = protectedPaths.some((path) =>
		request.nextUrl.pathname.startsWith(path)
	);

	if (isProtectedPath) {
		try {
			//проверка сессиии
			const sessionCookie =
				request.cookies.get('better-auth.session_token') ||
				request.cookies.get('session');
			//шлём нахёр хулигана
			if (!sessionCookie) {
				return NextResponse.redirect(new URL('/', request.url));
			}
		} catch {
			return NextResponse.redirect(new URL('/', request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/profile/:path*', '/administrator/:path*'],
};
