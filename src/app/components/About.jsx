'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiUser } from 'react-icons/fi';

export default function About({ data }) {
    if (!data) return null;

    const { attributes: attrs } = data;
    const title = attrs.field_title;
    const body = attrs.field_body?.processed || '';

    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="about" className="section-padding" ref={ref}>
            <div className="max-w-6xl mx-auto">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                        <span className="gradient-text">{title}</span>
                    </h2>
                    <div className="w-16 h-1 rounded-full gradient-bg" />
                </motion.div>

                <div className="grid md:grid-cols-5 gap-10 items-start">
                    {/* Decorative Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="md:col-span-2"
                    >
                        <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden glass">
                            {/* Gradient fill */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-1)]/20 to-[var(--gradient-2)]/20" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mb-6">
                                    <FiUser className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Abinandan G</h3>
                                <p className="text-gray-400 text-sm">Tech Lead · Frontend Developer</p>
                                <p className="text-gray-400 text-sm">UI/UX Designer</p>
                                <div className="mt-6 flex gap-2">
                                    <span className="px-3 py-1 rounded-full text-xs bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                                        11+ Years
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs bg-[var(--secondary)]/10 text-[var(--secondary)] border border-[var(--secondary)]/20">
                                        React · Next.js
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bio Text */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.35 }}
                        className="md:col-span-3 text-gray-300 leading-relaxed space-y-5 text-base sm:text-lg"
                        dangerouslySetInnerHTML={{ __html: body }}
                    />
                </div>
            </div>
        </section>
    );
}
