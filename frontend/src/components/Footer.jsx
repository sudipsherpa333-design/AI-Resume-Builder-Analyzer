import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'Home', path: '/' },
        { name: 'Builder', path: '/builder' },
        { name: 'Analyzer', path: '/analyzer' },
        { name: 'Templates', path: '/templates' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' }
    ];

    const features = [
        'AI-Powered Analysis',
        'ATS Optimization',
        'Professional Templates',
        'Real-time Feedback',
        'Multi-Format Export',
        'Career Analytics'
    ];

    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                {/* Main Footer Content */}
                <div style={styles.mainContent}>
                    {/* Brand Section */}
                    <div style={styles.brandSection}>
                        <div style={styles.logo}>
                            <span style={styles.logoIcon}>📄</span>
                            <span style={styles.logoText}>ResumeCraft</span>
                        </div>
                        <p style={styles.tagline}>
                            Build professional, ATS-optimized resumes with AI-powered insights and real-time feedback.
                        </p>
                        <div style={styles.socialLinks}>
                            <a href="#" style={styles.socialLink} aria-label="GitHub">
                                <span style={styles.socialIcon}>🐙</span>
                            </a>
                            <a href="#" style={styles.socialLink} aria-label="LinkedIn">
                                <span style={styles.socialIcon}>💼</span>
                            </a>
                            <a href="#" style={styles.socialLink} aria-label="Twitter">
                                <span style={styles.socialIcon}>🐦</span>
                            </a>
                            <a href="#" style={styles.socialLink} aria-label="Email">
                                <span style={styles.socialIcon}>✉️</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div style={styles.linksSection}>
                        <h4 style={styles.sectionTitle}>Quick Links</h4>
                        <ul style={styles.linksList}>
                            {quickLinks.map((link) => (
                                <li key={link.name} style={styles.listItem}>
                                    <Link
                                        to={link.path}
                                        style={styles.link}
                                        onMouseEnter={(e) => e.target.style.color = '#60a5fa'}
                                        onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Features */}
                    <div style={styles.linksSection}>
                        <h4 style={styles.sectionTitle}>Features</h4>
                        <ul style={styles.linksList}>
                            {features.map((feature) => (
                                <li key={feature} style={styles.listItem}>
                                    <span style={styles.featureText}>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Project Info */}
                    <div style={styles.projectSection}>
                        <h4 style={styles.sectionTitle}>Academic Project</h4>
                        <div style={styles.projectInfo}>
                            <p style={styles.projectDetail}>
                                <strong>BCA 6th Semester</strong>
                            </p>
                            <p style={styles.projectDetail}>
                                Tribhuvan University
                            </p>
                            <p style={styles.projectDetail}>
                                Developed by: <strong>Sudip Sherpa</strong>
                            </p>
                            <p style={styles.techStack}>
                                Built with React, Node.js, MongoDB & AI Integration
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div style={styles.divider}></div>

                {/* Bottom Section */}
                <div style={styles.bottomSection}>
                    <div style={styles.copyright}>
                        <p style={styles.copyrightText}>
                            &copy; {currentYear} ResumeCraft AI. All rights reserved.
                        </p>
                        <p style={styles.subText}>
                            BCA 6th Semester Project - Sudip Sherpa
                        </p>
                    </div>

                    <div style={styles.legalLinks}>
                        <a href="/privacy" style={styles.legalLink}>Privacy Policy</a>
                        <span style={styles.separator}>•</span>
                        <a href="/terms" style={styles.legalLink}>Terms of Service</a>
                        <span style={styles.separator}>•</span>
                        <a href="/cookies" style={styles.legalLink}>Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        padding: '3rem 0 1rem',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
    },
    mainContent: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '3rem',
        marginBottom: '2rem',
    },
    brandSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
    },
    logoIcon: {
        fontSize: '2rem',
    },
    logoText: {
        background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: '700',
    },
    tagline: {
        color: '#cbd5e1',
        fontSize: '0.9rem',
        lineHeight: '1.5',
        maxWidth: '300px',
    },
    socialLinks: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem',
    },
    socialLink: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        textDecoration: 'none',
    },
    socialIcon: {
        fontSize: '1.2rem',
    },
    linksSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    sectionTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: '#f8fafc',
    },
    linksList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    listItem: {
        margin: 0,
    },
    link: {
        color: '#cbd5e1',
        textDecoration: 'none',
        fontSize: '0.9rem',
        transition: 'color 0.3s ease',
    },
    featureText: {
        color: '#cbd5e1',
        fontSize: '0.9rem',
    },
    projectSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    projectInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    projectDetail: {
        color: '#cbd5e1',
        fontSize: '0.9rem',
        margin: '0.25rem 0',
    },
    techStack: {
        color: '#60a5fa',
        fontSize: '0.8rem',
        fontStyle: 'italic',
        marginTop: '0.5rem',
    },
    divider: {
        height: '1px',
        background: 'rgba(255, 255, 255, 0.1)',
        margin: '2rem 0',
    },
    bottomSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    copyright: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    copyrightText: {
        color: '#f8fafc',
        fontSize: '0.9rem',
        fontWeight: '500',
        margin: 0,
    },
    subText: {
        color: '#94a3b8',
        fontSize: '0.8rem',
        margin: 0,
    },
    legalLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    legalLink: {
        color: '#cbd5e1',
        textDecoration: 'none',
        fontSize: '0.8rem',
        transition: 'color 0.3s ease',
    },
    separator: {
        color: '#475569',
        fontSize: '0.8rem',
    },
};

// Add hover effects
Object.assign(styles.socialLink, {
    ':hover': {
        background: 'rgba(255, 255, 255, 0.2)',
        transform: 'translateY(-2px)',
    }
});

Object.assign(styles.link, {
    ':hover': {
        color: '#60a5fa',
    }
});

Object.assign(styles.legalLink, {
    ':hover': {
        color: '#60a5fa',
    }
});

export default Footer;