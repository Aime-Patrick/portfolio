import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { FaAward, FaExternalLinkAlt, FaCalendar } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  image: string;
  credentialUrl?: string;
}

const CertificatesSection: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const certificatesCollection = collection(db, 'certificates');
        const certificatesSnapshot = await getDocs(certificatesCollection);
        const certificatesList = certificatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Certificate[];
        
        certificatesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setCertificates(certificatesList);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <section className="certificates section" id="certificates">
        <h2 className="section__title-2"><span>Certificates</span></h2>
        <div className="container text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading certificates...</p>
        </div>
      </section>
    );
  }

  if (certificates.length === 0) {
    return null; // Don't show section if no certificates
  }

  return (
    <section className="certificates section" id="certificates">
      <h2 className="section__title-2 text-3xl md:text-4xl lg:text-5xl mb-8">
        <span>Certificates & Achievements</span>
      </h2>

      <div 
        className="certificates__container container grid gap-8"
        style={certificates.length === 1 ? { gridTemplateColumns: '1fr', maxWidth: '350px', marginLeft: 'auto', marginRight: 'auto' } : undefined}
      >
        {certificates.map((cert, _index) => (
          <motion.article
            key={cert.id}
            whileHover={{ y: -8 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="group relative p-8 min-h-[320px] flex flex-col text-center transition-all duration-300 overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-orange-500/20"
            style={{
              '--border-angle': '0turn',
              border: 'solid 4px transparent',
              background: `
                linear-gradient(var(--body-color), var(--body-color)) padding-box,
                conic-gradient(
                  from var(--border-angle),
                  transparent 20%,
                  #ff6b35,
                  #f44a00,
                  #2a2a2a,
                  #141414 50%,
                  #2a2a2a,
                  #f44a00,
                  #ff6b35,
                  transparent 80%
                ) border-box,
                linear-gradient(var(--body-color), var(--body-color)) border-box
              `,
              animation: 'border-spin 3s linear infinite',
            } as React.CSSProperties}
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--first-color)]/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Image */}
            <div className="relative mb-6 w-full h-40 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
              <img
                src={cert.image}
                alt={cert.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="absolute top-2 right-2 bg-[var(--first-color)]/90 backdrop-blur-sm p-2 rounded-lg shadow-lg">
                <FaAward className="text-white text-lg" />
              </div>
            </div>

            {/* Title */}
            <h3 className="relative text-xl font-bold text-[#000000] dark:text-white mb-2 bg-gradient-to-r from-[#000000] to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text group-hover:text-transparent transition-all duration-300">
              {cert.title}
            </h3>

            {/* Issuer */}
            <p className="relative text-sm text-[var(--first-color)] font-semibold mb-3">
              {cert.issuer}
            </p>

            {/* Date */}
            <div className="relative flex items-center justify-center gap-2 text-xs text-[#000000] dark:text-gray-400 mb-4">
              <FaCalendar className="text-[10px]" />
              <span>{new Date(cert.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>

            {/* Description */}
            <p className="relative text-[#000000] dark:text-gray-300 leading-relaxed text-sm mb-4 line-clamp-3 flex-1">
              {cert.description}
            </p>

            {/* Link */}
            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center justify-center gap-2 text-sm font-semibold text-[var(--first-color)] hover:text-white transition-colors group/link"
              >
                <span>View Credential</span>
                <FaExternalLinkAlt className="text-xs group-hover/link:translate-x-1 transition-transform" />
              </a>
            )}

            {/* Decorative corner elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-[var(--first-color)]/10 to-transparent rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

export default CertificatesSection;

