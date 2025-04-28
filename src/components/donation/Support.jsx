import React from 'react';

// Shared Tailwind CSS classes
const primaryButtonClasses = 'mt-6 bg-blue-600 text-white hover:bg-blue-700 py-2 px-4 rounded-lg';

const SupportAlmaMater = () => {
  // Function to handle the donation button click
  const handleDonateClick = async () => {
    try {
      // Call to your serverless function to create a Stripe checkout session
      const response = await fetch('/api/create-stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // You can send preset amounts or other donation details here
          // For simplicity, we'll just use a basic configuration
        }),
      });

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-red-800 to-red-500 p-8 text-center">
      <h1 className="text-3xl font-bold text-white">Support Your Alma Mater</h1>
      <p className="mt-4 text-lg text-white">Your donation helps shape the future of our university and its students.</p>
      <button 
        className={primaryButtonClasses}
        onClick={handleDonateClick}
      >
        Donate Now ❤
      </button>
    </div>
  );
};

export default SupportAlmaMater;