'use client';

import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

export default function Hero({ data }) {
    if (!data) return null;

    const { attributes: attrs } = data;
    const headline = attrs.field_headline;
    const subheadline = attrs.field_subheadline?.processed || '';
    const ctaLabel = attrs.field_primary_cta_label;
    const ctaUrl = attrs.field_primary_cta_url?.uri || '#';

    // Strip HTML tags from subheadline
    const subText = subheadline.replace(/<[^>]*>/g, '');

    return (
        <section
            id="hero"
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
            {/* Background Orbs */}
            <div className="hero-orb hero-orb-1" />
            <div className="hero-orb hero-orb-2" />
            <div className="hero-orb hero-orb-3" />

            {/* Grid Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                {/* Tagline chip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-white/10 bg-white/5 text-sm text-gray-400"
                >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    AI Accelerated Developer
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
                >
                    <span className="gradient-text">{headline}</span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.25 }}
                    className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    {subText}
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="flex items-center justify-center gap-4"
                >
                    <a
                        href={ctaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium"
                    >
                        <span className="flex items-center gap-2">
                            {ctaLabel}
                            <FiArrowRight className="w-4 h-4" />
                        </span>
                    </a>

                    <a
                        href="#about"
                        onClick={(e) => {
                            e.preventDefault();
                            document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-8 py-3.5 rounded-full border border-white/10 text-gray-300 hover:bg-white/5 hover:border-white/20 transition-all font-medium"
                    >
                        Learn More
                    </a>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
                >
                    <div className="w-1 h-2 rounded-full bg-white/40" />
                </motion.div>
            </motion.div>
        </section>
    );
}
