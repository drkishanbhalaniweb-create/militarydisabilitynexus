import { NextResponse } from 'next/server';

export function middleware(request) {
    const hostname = request.headers.get('host') || '';

    // Force redirect from non-www to www
    if (hostname === 'militarydisabilitynexus.com') {
        const url = request.nextUrl.clone();
        url.hostname = 'www.militarydisabilitynexus.com';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
