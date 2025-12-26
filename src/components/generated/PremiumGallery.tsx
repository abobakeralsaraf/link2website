import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { motion } from 'framer-motion';
import { Images, Expand } from 'lucide-react';
import { useState } from 'react';

interface PremiumGalleryProps {
  business: BusinessData;
}

export function PremiumGallery({ business }: PremiumGalleryProps) {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!business.photos || business.photos.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <section id="gallery" className="py-20 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 mb-6">
              <Images className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold text-sm tracking-wider uppercase">
                {t('gallery')}
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('discoverOurSpace')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('galleryDescription')}
            </p>
          </motion.div>

          {/* Gallery Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {business.photos.slice(0, 8).map((photo, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`relative group cursor-pointer rounded-2xl overflow-hidden ${
                  index === 0 ? 'col-span-2 row-span-2' : ''
                }`}
                onClick={() => setSelectedImage(photo)}
              >
                <div className={`relative ${index === 0 ? 'aspect-square' : 'aspect-square'}`}>
                  <img
                    src={photo}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-300" />
                  
                  {/* Expand Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <motion.div 
                      className="w-14 h-14 rounded-full gradient-gold flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Expand className="w-6 h-6 text-primary-foreground" />
                    </motion.div>
                  </div>
                  
                  {/* Border Gradient on Hover */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/50 transition-all duration-300 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/90 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            src={selectedImage}
            alt="Gallery image"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center text-primary-foreground transition-colors"
          >
            ✕
          </button>
        </motion.div>
      )}
    </>
  );
}
