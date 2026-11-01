import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BrandLogo from './BrandLogo';
import { getBrandLogoSrc } from '../../utils/brandIcons.js';

describe('BrandLogo Component', () => {
  const testTechnologies = [
    // Programming Languages
    'Java',
    'Python',
    'C++',
    'C#',
    'JavaScript (ES6+)',
    'TypeScript',
    'Dart',

    // Frontend
    'React.js',
    'HTML5',
    'CSS3',
    'Bootstrap',

    // Backend
    'Node.js',
    'Express.js',
    'Django',
    'ASP.NET Core MVC',
    'REST APIs',

    // Databases
    'MongoDB',
    'MySQL',
    'PostgreSQL',
    'SQL Server',
    'SQLite',
    'Supabase',

    // Frameworks & Libraries
    'Flutter',
    'Mongoose ODM',
    'Entity Framework Core',
    'Hibernate',
    'SignalR',

    // Tools
    'Git',
    'GitHub',
    'Docker',
    'Postman',
    'Visual Studio Code',

    // Socials
    'LinkedIn',
    'Email',
  ];

  testTechnologies.forEach((name) => {
    it(`resolves authentic brand SVG for "${name}"`, () => {
      const src = getBrandLogoSrc(name);
      expect(src).toBeTruthy();
      expect(typeof src).toBe('string');
      expect(src.length).toBeGreaterThan(20);
    });
  });

  it('renders img with correct attributes when brand is found', () => {
    render(<BrandLogo name="React.js" size={40} alt="React logo" />);
    const img = screen.getByRole('img', { hidden: true });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'React logo');
    expect(img.style.width).toBe('40px');
    expect(img.style.height).toBe('40px');
    expect(img.style.objectFit).toBe('contain');
  });

  it('renders neutral fallback when brand is unknown', () => {
    render(<BrandLogo name="UnknownTechXYZ" size={24} />);
    const fallback = screen.getByTitle('UnknownTechXYZ');
    expect(fallback).toBeInTheDocument();
  });
});
