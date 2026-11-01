import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectBySlug } from '../../api/portfolioApi.js';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    getProjectBySlug(slug)
      .then((data) => {
        if (isMounted) {
          setProject(data);
          setErrorStatus(null);
          setErrorMessage('');
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorStatus(err?.status || 500);
          setErrorMessage(err?.message || 'Failed to load project details');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }} role="status">
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)' }}>Loading project details...</p>
      </div>
    );
  }

  if (errorStatus === 404 || !project) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', maxWidth: '600px', textAlign: 'center' }}>
        <div className="card" style={{ padding: 'var(--space-10) var(--space-6)' }}>
          <span className="badge badge-warning" style={{ marginBottom: 'var(--space-3)' }}>
            404 Not Found
          </span>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>Project Not Found</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
            The project with slug <code>"{slug}"</code> does not exist or has not been published yet.
          </p>
          <Link to="/#projects" className="btn btn-primary">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (errorStatus) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', maxWidth: '600px', textAlign: 'center' }}>
        <div className="card" style={{ padding: 'var(--space-10) var(--space-6)' }}>
          <span className="badge badge-danger" style={{ marginBottom: 'var(--space-3)' }}>
            Error
          </span>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>Failed to Load Project</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
            {errorMessage}
          </p>
          <Link to="/#projects" className="btn btn-primary">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--space-12) 0', maxWidth: '860px' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link
          to="/#projects"
          style={{
            color: 'var(--color-primary)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-medium)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
        >
          ← Back to Projects
        </Link>
      </div>

      <article className="card" style={{ padding: 'var(--space-8)' }}>
        {project.thumbnailUrl && (
          <div
            style={{
              maxHeight: '400px',
              width: '100%',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              marginBottom: 'var(--space-6)',
              backgroundColor: 'var(--color-bg-subtle)',
            }}
          >
            <img
              src={project.thumbnailUrl}
              alt={project.thumbnailAlt || project.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              {project.category && (
                <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                  {project.category.replace(/-/g, ' ')}
                </span>
              )}
              {project.isFeatured && <span className="badge badge-success">Featured Project</span>}
            </div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)' }}>{project.title}</h1>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {project.liveDemoUrl && (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Live Demo ↗
              </a>
            )}
            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                GitHub Repo ↗
              </a>
            )}
          </div>
        </div>

        {project.shortDescription && (
          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              marginBottom: 'var(--space-6)',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: 'var(--space-4)',
            }}
          >
            {project.shortDescription}
          </p>
        )}

        {project.role && (
          <div style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            <strong>My Role:</strong> {project.role}
          </div>
        )}

        {project.description && (
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-3)' }}>
              Project Overview
            </h2>
            <div
              style={{
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                whiteSpace: 'pre-line',
              }}
            >
              {project.description}
            </div>
          </div>
        )}

        {project.keyFeatures && project.keyFeatures.length > 0 && (
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-3)' }}>
              Key Features
            </h2>
            <ul style={{ paddingLeft: 'var(--space-5)', listStyleType: 'disc', color: 'var(--color-text-secondary)' }}>
              {project.keyFeatures.map((feat, idx) => (
                <li key={idx} style={{ marginBottom: 'var(--space-2)', lineHeight: 'var(--leading-normal)' }}>
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        )}

        {project.technologies && project.technologies.length > 0 && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-3)' }}>
              Technologies Used
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="card"
                  style={{
                    padding: 'var(--space-1) var(--space-3)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--weight-medium)',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
