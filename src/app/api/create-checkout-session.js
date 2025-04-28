// For Next.js: /pages/api/create-stripe-checkout.js
// For Express: This would be a route in your Express app

import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create a Stripe checkout session with the predefined configuration
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation to Alma Mater',
              description: 'Thank you for your generous support!',
              images: ['https://your-university-logo-url.jpg'], // Optional: Add your university logo
            },
            unit_amount_decimal: '5000', // $50.00 default - Stripe uses cents
          },
          quantity: 1,
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
            maximum: 10,
          },
        },
      ],
      // Allow customers to enter a custom donation amount
      custom_text: {
        submit: {
          message: 'Your donation supports student scholarships and university programs.',
        },
      },
      billing_address_collection: 'auto',
      mode: 'payment',
      // Add your domain here - in production, this should be your actual domain
      success_url: `${req.headers.origin}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`,
    });

    // Return the URL to the client
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
}