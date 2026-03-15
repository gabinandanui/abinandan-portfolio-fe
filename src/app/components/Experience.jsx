'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiBriefcase } from 'react-icons/fi';
import { parseExperience } from '@/lib/drupal';

function TimelineItem({ entry, index, total }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    const isEven = index % 2 === 0;

    return (
        <div
            ref={ref}
            className={`relative flex items-start gap-4 md:gap-0 ${index < total - 1 ? 'pb-12' : ''
                }`}
        >
            {/* Timeline dot */}
            <div className="timeline-dot" />

            {/* Mobile: always right. Desktop: alternate sides */}
            <motion.div
                initial={{ opacity: 0, x: isEven ? -30 : 30, y: 10 }}
                animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 }}
                className={`ml-10 md:ml-0 md:w-[calc(50%-30px)] glass rounded-xl p-6 text-left ${isEven
                        ? 'md:mr-auto'
                        : 'md:ml-auto'
                    }`}
            >
                {/* Duration chip */}
                <span className="inline-block px-3 py-1 mb-3 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                    {entry.duration}
                </span>

                <h3 className="text-lg font-semibold text-white mb-1">{entry.jobTitle?.replace(/&amp;/g, '&')}</h3>
                <p className="text-sm text-[var(--accent)] mb-3 flex items-center gap-1.5 justify-start">
                    <FiBriefcase className="w-3.5 h-3.5" />
                    {entry.company?.replace(/&amp;/g, '&')}
                </p>

                {entry.responsibilities.length > 0 && (
                    <ul className="space-y-1.5 text-left flex flex-col items-start font">
                        {entry.responsibilities.map((bullet, bi) => (
                            <li key={bi} className="text-sm text-gray-400 leading-relaxed flex items-start gap-2">
                                <span className="text-[var(--primary)] shrink-0">▸</span>
                                <span>{bullet?.replace(/&amp;/g, '&')}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </motion.div>
        </div>
    );
}

export default function Experience({ data }) {
    if (!data) return null;

    const { attributes: attrs } = data;
    const title = attrs.field_title?.replace(/&amp;/g, '&') || '';
    const entries = parseExperience(attrs.field_body?.processed);

    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="experience" className="section-padding" ref={ref}>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                        <span className="gradient-text">{title}</span>
                    </h2>
                    <div className="w-16 h-1 rounded-full gradient-bg mx-auto" />
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    <div className="timeline-line" />

                    {entries.map((entry, i) => (
                        <TimelineItem
                            key={`${entry.company}-${i}`}
                            entry={entry}
                            index={i}
                            total={entries.length}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
