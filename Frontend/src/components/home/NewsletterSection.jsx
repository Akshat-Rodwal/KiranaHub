import { useState } from 'react';
import { motion } from 'framer-motion';

import Container from '../common/Container.jsx';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import { toast } from '../common/Toast.jsx';
import { validateEmail } from '../../utils/index.js';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    toast.success('Subscribed!', {
      description: 'Weekly deals and fresh arrivals will land in your inbox.',
    });
    setEmail('');
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="py-6 lg:py-10"
    >
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 px-5 py-10 text-center sm:px-10">
          <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <div className="absolute -bottom-14 -right-8 h-44 w-44 rounded-full bg-white/10" />
          <div className="relative mx-auto max-w-lg">
            <h2 className="headline text-xl text-white sm:text-2xl">
              Get weekly fresh deals
            </h2>
            <p className="mt-2 text-sm text-brand-100">
              Join our newsletter for exclusive offers, new arrivals and
              money-saving combos.
            </p>
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
              noValidate
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter your email"
                error={error}
                wrapperClassName="flex-1 text-left"
              />
              <Button
                type="submit"
                variant="accent"
                size="md"
                className="shrink-0"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </motion.section>
  );
}
