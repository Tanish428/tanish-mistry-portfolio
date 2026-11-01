import HeroSection from './HeroSection.jsx';
import AboutSection from './AboutSection.jsx';
import ProjectsSection from './ProjectsSection.jsx';
import SkillsSection from './SkillsSection.jsx';
import ExperienceSection from './ExperienceSection.jsx';
import EducationSection from './EducationSection.jsx';
import SocialLinksSection from './SocialLinksSection.jsx';
import ContactSection from './ContactSection.jsx';

// Explicit Allowlist Registry matching backend SECTION_TYPES
const SECTION_REGISTRY = {
  hero: HeroSection,
  about: AboutSection,
  projects: ProjectsSection,
  skills: SkillsSection,
  experience: ExperienceSection,
  education: EducationSection,
  social_links: SocialLinksSection,
  contact: ContactSection,
};

/**
 * SectionRenderer maps dynamic section documents to their dedicated React presentation components.
 * Unknown or corrupted section types are safely skipped.
 *
 * @param {{ section: object }} props
 */
export default function SectionRenderer({ section }) {
  if (!section || !section.type) {
    return null;
  }

  const Component = SECTION_REGISTRY[section.type];
  if (!Component) {
    // Unknown or unsupported section type; safely ignore
    return null;
  }

  return <Component section={section} />;
}
