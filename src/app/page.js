import {
  getHomePage,
  getSections,
  getFooter,
} from '@/lib/drupal';
import { getAllProjects } from '@/services/drupalApi';

import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Contact from './components/Contact';

export default async function Home() {
  const [homeData, footerContent, allProjects] = await Promise.all([
    getHomePage(),
    getFooter(),
    getAllProjects(),
  ]);
  
  const { components } = homeData;
  const sections = getSections(components);
  
  return (
    <>
      <Hero data={sections.hero} />
      <About data={sections.about} />
      <Skills data={sections.skills} />
      <Projects data={sections.projects} projects={allProjects} />
      <Experience data={sections.experience} />
      <Contact data={sections.contact} footerData={footerContent} />
    </>
  );
}
