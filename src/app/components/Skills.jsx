'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
    FaHtml5, FaCss3Alt, FaSass, FaJs, FaReact, FaNodeJs, FaPython,
    FaFigma, FaGithub, FaBootstrap, FaPalette, FaGem, FaPenNib, FaCode
} from 'react-icons/fa';
import {
    SiNextdotjs, SiTailwindcss, SiRedux, SiFlask,
    SiJquery, SiGulp, SiPwa
} from 'react-icons/si';
import { TbApi } from 'react-icons/tb';

/** Icon mapping for each individual technology with specific color classes */
const skillIconMap = {
    'HTML': { icon: FaHtml5, color: 'text-orange-500' },
    'CSS': { icon: FaCss3Alt, color: 'text-blue-500' },
    'SCSS': { icon: FaSass, color: 'text-pink-500' },
    'JavaScript': { icon: FaJs, color: 'text-yellow-400' },
    'jQuery': { icon: SiJquery, color: 'text-blue-600' },
    'React JS': { icon: FaReact, color: 'text-cyan-400' },
    'Next JS': { icon: SiNextdotjs, color: 'text-white' },
    'Bootstrap': { icon: FaBootstrap, color: 'text-purple-600' },
    'Tailwind CSS': { icon: SiTailwindcss, color: 'text-cyan-400' },
    'Redux': { icon: SiRedux, color: 'text-purple-500' },
    'PWA': { icon: SiPwa, color: 'text-blue-400' },
    'Python': { icon: FaPython, color: 'text-yellow-500' },
    'Flask': { icon: SiFlask, color: 'text-white' },
    'Node.js': { icon: FaNodeJs, color: 'text-green-500' },
    'Figma': { icon: FaFigma, color: 'text-purple-500' },
    'Adobe XD': { icon: FaPenNib, color: 'text-pink-500' },
    'Sketch': { icon: FaGem, color: 'text-orange-500' },
    'Photoshop': { icon: FaPalette, color: 'text-blue-500' },
    'GitHub': { icon: FaGithub, color: 'text-white' },
    'TWIG': { icon: FaReact, color: 'text-green-400' },
    'Gulp': { icon: SiGulp, color: 'text-red-500' },
    'RESTful API': { icon: TbApi, color: 'text-green-400' }
};

function SkillCard({ name, index }) {
    const skillInfo = skillIconMap[name] || {
        icon: FaCode,
        color: 'text-gray-400'
    };
    const Icon = skillInfo.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.2)]"
        >
            <div className={`text-4xl transition-transform duration-300 group-hover:scale-110 ${skillInfo.color}`}>
                <Icon />
            </div>
            <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors text-center">
                {name}
            </span>
        </motion.div>
    );
}

function SkillGroup({ title, skills }) {
    if (!skills || skills.length === 0) return null;

    // Split skills if they contain commas (defensive against grouped strings)
    const processedSkills = skills.flatMap(s => s.split(',').map(item => item.trim())).filter(Boolean);

    return (
        <div className="mb-16 last:mb-0">
            <h3 className="text-xl font-bold text-blue-500 mb-8 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-blue-500/30 rounded-full" />
                {title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {processedSkills.map((skill, i) => (
                    <SkillCard key={`${skill}-${i}`} name={skill} index={i} />
                ))}
            </div>
        </div>
    );
}

export default function Skills({ data }) {
    if (!data) return null;

    const { attributes: attrs } = data;
    const sectionTitle = attrs.field_section_title || 'Skills & Expertise';
    // Handle both field_intro and field_intro.processed structures
    const introText = attrs.field_intro?.processed || attrs.field_intro?.value || '';
    const cleanIntro = introText.replace(/<[^>]*>/g, '');

    const skillCategories = [
        { title: 'FRONTEND', skills: attrs.field_frontend_skills || [] },
        { title: 'BACKEND', skills: attrs.field_backend_skills || [] },
        { title: 'DESIGN & TOOLS', skills: attrs.field_tools_skills || [] }
    ];

    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="skills" className="section-padding relative overflow-hidden" ref={ref}>
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
                        <span className="gradient-text">{sectionTitle}</span>
                    </h2>
                    <div className="w-20 h-1.5 rounded-full gradient-bg mb-6" />
                    <p className="text-gray-400 max-w-3xl text-lg sm:text-xl leading-relaxed">
                        {cleanIntro}
                    </p>
                </motion.div>

                {/* Categories */}
                {skillCategories.map((category, idx) => (
                    <SkillGroup 
                        key={category.title} 
                        title={category.title} 
                        skills={category.skills} 
                    />
                ))}
            </div>
        </section>
    );
}
