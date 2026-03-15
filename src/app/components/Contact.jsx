'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiLinkedin, FiMail, FiGithub } from 'react-icons/fi';
import { parseContactInfo } from '@/lib/drupal';

const contactItems = [
    {
        key: 'linkedin',
        label: 'LinkedIn',
        icon: FiLinkedin,
        color: '#0A66C2',
    },
    {
        key: 'email',
        label: 'Email',
        icon: FiMail,
        color: '#EA4335',
        prefix: 'mailto:',
    },
    {
        key: 'github',
        label: 'GitHub',
        icon: FiGithub,
        color: '#ffffff',
    },
];

function ContactCard({ item, value, index }) {
    const Icon = item.icon;

    let href = value;
    if (item.key === 'email') href = `mailto:${value}`;
    else if (item.key === 'phone') href = `tel:${value.replace(/\s/g, '')}`;
    else if (!value.startsWith('http')) href = `https://${value}`;

    return (
        <motion.a
            href={href}
            target={item.key === 'email' || item.key === 'phone' ? undefined : '_blank'}
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="contact-card glass rounded-xl p-6 flex items-center gap-4 group"
        >
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}30` }}
            >
                <Icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <div>
                <p className="text-sm text-gray-500 mb-0.5">{item.label}</p>
                <p className="text-white text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
                    {value}
                </p>
            </div>
        </motion.a>
    );
}

export default function Contact({ data, footerData }) {
    if (!data) return null;

    const { attributes: attrs } = data;
    const title = attrs.field_title;
    const parsed = parseContactInfo(attrs.field_body?.processed);

    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="contact" className="section-padding" ref={ref}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                        <span className="gradient-text">{title}</span>
                    </h2>
                    <div className="w-16 h-1 rounded-full gradient-bg mx-auto mb-4" />
                    <p className="text-gray-400">
                        Feel free to reach out — I&apos;m always open to new opportunities and collaborations.
                    </p>
                </motion.div>

                {/* Cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                    {contactItems.map((item, i) => {
                        const value = parsed[item.key];
                        if (!value) return null;
                        
                        return <ContactCard 
                            key={item.key} 
                            item={item} 
                            value={value} 
                            index={i} 
                        />;
                    })}
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 pt-8 border-t border-white/5 text-center"
                >
                    {footerData ? (
                        <div 
                            className="text-sm text-gray-500 footer-content"
                            dangerouslySetInnerHTML={{ __html: footerData }}
                        />
                    ) : (
                        <p className="text-sm text-gray-600">
                            © {new Date().getFullYear()} Abinandan G. Built with Next.js &amp; Drupal.
                        </p>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
