import { NextResponse } from 'next/server';
import { DodoPayments } from 'dodopayments';
import { SUBSCRIPTION_PLANS } from '@/config/subscriptions';

const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: 'live_mode',
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const planKey = searchParams.get('plan');

    if (!planKey || !SUBSCRIPTION_PLANS[planKey as keyof typeof SUBSCRIPTION_PLANS]) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const plan = SUBSCRIPTION_PLANS[planKey as keyof typeof SUBSCRIPTION_PLANS];

    try {
        const session = await client.checkoutSessions.create({
            product_cart: [
                {
                    product_id: plan.id,
                    quantity: 1,
                },
            ],
            // Add return_url to bring them back to the app
            return_url: `${new URL(request.url).origin}/for-salons/success`,
        });

        if (session.checkout_url) {
            return NextResponse.redirect(session.checkout_url);
        } else {
            throw new Error('No checkout URL returned');
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Error creating checkout session details:', {
            message: errorMessage,
            stack: errorStack,
        });
        return NextResponse.json({
            error: 'Failed to create checkout session',
            details: errorMessage,
        }, { status: 500 });
    }
}
