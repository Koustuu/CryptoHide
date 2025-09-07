import React from 'react';
import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import HowItWorks from '../components/home/HowItWorks';

const HomePage: React.FC = () => {
  return (
    <Layout>
      <Hero />
      <Features />
      <HowItWorks />
    </Layout>
  );
};

export default HomePage;