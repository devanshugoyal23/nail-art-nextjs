import { NextResponse } from 'next/server';
import { DodoPayments } from 'dodopayments';
import { SUBSCRIPTION_PLANS } from '@/config/subscriptions';

const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: 'test_mode',
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
    } catch (error: any) {
        console.error('Error creating checkout session details:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data,
            status: error.status || error.response?.status
        });
        return NextResponse.json({
            error: 'Failed to create checkout session',
            details: error.message,
            status: error.status || error.response?.status
        }, { status: 500 });
    }
}
