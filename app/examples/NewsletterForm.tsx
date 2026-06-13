'use client';

import { useState } from 'react';
import { useSubscribeToNewsletter } from '../hooks/useApi';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const { mutate: subscribe, isPending, isSuccess, error } = useSubscribeToNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    subscribe({ email });
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="flex-1 px-4 py-2 border rounded"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Subscribing...' : 'Subscribe'}
      </button>
      {isSuccess && (
        <div className="text-green-600">Successfully subscribed!</div>
      )}
      {error && (
        <div className="text-red-600">Error: {error.message}</div>
      )}
    </form>
  );
}
