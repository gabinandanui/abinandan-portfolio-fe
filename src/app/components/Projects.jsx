'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { FiExternalLink, FiGithub, FiFolder, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function DeviceMockup({ image, title }) {
    return (
        <div className="relative w-full max-w-4xl mx-auto flex items-center justify-center py-8 px-6">
            {/* Laptop/Monitor Mockup */}
            <motion.div
                key={`laptop-${title}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full aspect-[16/10] bg-[#0a0a0a] rounded-[1.2rem] border-[6px] border-gray-800 shadow-2xl overflow-hidden flex items-center justify-center"
            >
                {image ? (
                    <img 
                        src={image} 
                        alt={title} 
                        className="max-w-full max-h-full object-contain" 
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                         <FiFolder className="w-16 h-16 text-white/5" />
                         <span className="text-[10px] uppercase tracking-widest text-white/10 font-bold mt-4">No Preview Available</span>
                    </div>
                )}
            </motion.div>

            {/* Background Glow */}
            <div className="absolute inset-0 z-0 bg-[var(--primary)]/5 blur-[80px] rounded-full scale-75" />
        </div>
    );
}

export default function Projects({ data, projects: allProjects = [] }) {
    if (!data) return null;

    const { attributes: attrs } = data;
    const title = attrs.field_section_title || 'Featured Projects';
    const introText = (attrs.field_intro_text?.processed || attrs.field_intro_text || '').replace(/<[^>]*>/g, '');

    const [selectedIndex, setSelectedIndex] = useState(0);
    const sectionRef = useRef(null);
    const inView = useInView(sectionRef, { once: true, margin: '-100px' });

    // Debug: Inspect the projects array to ensure alignment
    useEffect(() => {
        if (allProjects.length > 0) {
            console.log('Showcase Projects Mapping:', allProjects.map(p => ({ title: p.title, hasImage: p.images.length > 0 })));
        }
    }, [allProjects]);

    const selectedProject = allProjects[selectedIndex] || allProjects[0] || null;

    // Reset index if projects change
    useEffect(() => {
        if (selectedIndex >= allProjects.length) {
            setSelectedIndex(0);
        }
    }, [allProjects, selectedIndex]);

    if (allProjects.length === 0) {
        return (
             <section id="projects" className="section-padding" ref={sectionRef}>
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <FiFolder className="w-16 h-16 mx-auto mb-6 text-white/10" />
                    <h2 className="text-3xl font-bold mb-4">{title}</h2>
                    <p className="text-gray-500">No projects found in the CMS.</p>
                </div>
             </section>
        );
    }

    const techTags = selectedProject?.techStack ? 
        (Array.isArray(selectedProject.techStack) ? selectedProject.techStack : selectedProject.techStack.split(',').map(t => t.trim())) 
        : [];

    return (
        <section id="projects" className="section-padding overflow-hidden bg-[#050505]" ref={sectionRef}>
            <div className="max-w-7xl mx-auto px-6">
                
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                        <span className="gradient-text">{title}</span>
                    </h2>
                    <div className="w-16 h-1 rounded-full gradient-bg mb-4" />
                    {introText && (
                        <p className="text-gray-400 max-w-2xl text-base sm:text-lg leading-relaxed">
                            {introText}
                        </p>
                    )}
                </motion.div>

                {/* 1. TOP AREA: Large Preview & Mockups */}
                <div className="mb-0">
                    <DeviceMockup 
                        image={selectedProject?.images?.[0]} 
                        title={selectedProject?.title} 
                    />
                </div>

                {/* 2. MIDDLE AREA: Numbered Thumbnails / Project Switcher */}
                <div className="flex justify-center items-center gap-2 sm:gap-4 mb-16">
                    <button 
                        onClick={() => setSelectedIndex(prev => (prev > 0 ? prev - 1 : allProjects.length - 1))}
                        className="p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                        aria-label="Previous Project"
                    >
                        <FiChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-2 px-4 max-w-full sm:max-w-none">
                        {allProjects.map((project, idx) => (
                            <button
                                key={project.id}
                                onClick={() => setSelectedIndex(idx)}
                                className={`flex-shrink-0 relative group transition-all duration-300 ${
                                    selectedIndex === idx ? 'scale-110' : 'opacity-40 hover:opacity-100 scale-90'
                                }`}
                            >
                                <div className={`absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 blur opacity-0 transition-opacity duration-300 ${
                                    selectedIndex === idx ? 'opacity-30' : 'group-hover:opacity-10'
                                }`} />
                                <div className={`relative flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-2 font-bold text-lg overflow-hidden ${
                                    selectedIndex === idx 
                                    ? 'bg-white/10 border-blue-500/50 text-white' 
                                    : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                                }`}>
                                    {project.images?.[0] ? (
                                        <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover opacity-60" />
                                    ) : (
                                        <span>{idx + 1}</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                                        <span className="text-white drop-shadow-lg">{idx + 1}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setSelectedIndex(prev => (prev < allProjects.length - 1 ? prev + 1 : 0))}
                        className="p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                        aria-label="Next Project"
                    >
                        <FiChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {/* 3. BOTTOM AREA: Content & Details */}
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedProject?.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden backdrop-blur-sm shadow-2xl"
                        >
                            {/* Stats/Badges */}
                            <div className="flex flex-wrap gap-3 mb-8">
                                <span className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-blue-500 shadow-lg shadow-blue-500/30 text-white">
                                    {selectedProject?.role?.replace(/<[^>]*>/g, '') || 'Project Detail'}
                                </span>
                                {techTags.slice(0, 3).map(tech => (
                                    <span key={tech} className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 text-gray-400 border border-white/10">
                                        {tech}
                                    </span>
                                ))}
                            </div>

                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
                                <div className="flex-1">
                                    <h3 className="text-4xl sm:text-5xl font-bold mb-6 text-white leading-tight">
                                        {selectedProject?.title}
                                    </h3>
                                    <div 
                                        className="text-gray-400 text-lg leading-relaxed mb-8 project-showcase-desc"
                                        dangerouslySetInnerHTML={{ __html: selectedProject?.description }}
                                    />
                                    
                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-4">
                                        {selectedProject?.liveUrl && (
                                            <a
                                                href={selectedProject.liveUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-black text-sm font-bold hover:scale-105 transition-all shadow-xl shadow-white/10"
                                            >
                                                <FiExternalLink className="w-5 h-5" />
                                                View Live Site
                                            </a>
                                        )}
                                        {selectedProject?.githubUrl && (
                                            <a
                                                href={selectedProject.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/10 text-white text-sm font-bold hover:bg-white/5 hover:border-white/20 transition-all shadow-xl"
                                            >
                                                <FiGithub className="w-5 h-5" />
                                                Browse Code
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Tech List Desktop */}
                                <div className="hidden lg:block w-64 bg-white/[0.02] rounded-3xl p-6 border border-white/5">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-white/20 mb-4">Technologies</h4>
                                    <div className="flex flex-col gap-3">
                                        {techTags.map(tech => (
                                            <div key={tech} className="flex items-center gap-3 text-sm text-gray-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                {tech}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .project-showcase-desc :global(strong) {
                    color: white;
                }
            `}</style>
        </section>
    );
}
