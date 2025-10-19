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
    <section className="certificates section py-16" id="certificates">
      <div className="container">
        <h2 className="section__title-2 text-center mb-4">
          <span className="bg-gradient-to-r from-[var(--first-color)] to-orange-600 bg-clip-text text-transparent">
            Certificates & Achievements
          </span>
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Professional certifications and achievements that validate my expertise
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                  <FaAward className="text-[var(--first-color)] text-xl" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white line-clamp-2">
                  {cert.title}
                </h3>
                <p className="text-sm text-[var(--first-color)] font-semibold mb-2">
                  {cert.issuer}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <FaCalendar />
                  <span>{new Date(cert.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {cert.description}
                </p>
                
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--first-color)] hover:text-orange-600 transition-colors"
                  >
                    View Credential
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificatesSection;

