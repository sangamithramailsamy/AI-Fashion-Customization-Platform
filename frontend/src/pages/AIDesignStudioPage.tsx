import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Shirt,
  Palette,
  Scissors,
  Type,
  Grid3x3,
  ArrowRight,
  Upload,
  X,
  Loader2,
  Download,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '@/components/SectionHeading';

const OPTIONS = [
  {
    icon: Shirt,
    label: 'Garment Type',
    desc: 'Saree, lehenga, kurti, gown, dress, co-ord set and more.',
  },
  {
    icon: Palette,
    label: 'Fabric',
    desc: 'Silk, cotton, linen, chiffon, organza and bespoke blends.',
  },
  {
    icon: Type,
    label: 'Color',
    desc: 'From earthy naturals to vivid festive tones.',
  },
  {
    icon: Grid3x3,
    label: 'Neckline',
    desc: 'Round, V, boat, sweetheart, high-collar and more.',
  },
  {
    icon: Scissors,
    label: 'Sleeve',
    desc: 'Sleeveless, cap, three-quarter, bell, full.',
  },
  {
    icon: Sparkles,
    label: 'Embroidery & Pattern',
    desc: 'Thread work, mirror, zari, hand-paint, prints.',
  },
];

export default function AIDesignStudioPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);

    setImages((currentImages) => [
      ...currentImages,
      ...selectedFiles,
    ]);

    // Allows selecting the same file again later
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((currentImages) =>
      currentImages.filter((_, i) => i !== index)
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe the design you want to create.');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedImage('');

    try {
      const formData = new FormData();

      formData.append('prompt', prompt.trim());

      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await fetch(
        'http://127.0.0.1:8000/api/ai-design/generate/',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to generate the design.'
        );
      }

      setGeneratedImage(data.image);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while generating the design.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'ai-design.png';
    link.click();
  };

  return (
    <div className="pt-28 md:pt-36 pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-8">

        {/* Intro */}
        <div className="text-center">
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-token mb-6"
            style={{
              background: 'var(--primary)',
              color: 'var(--btn-text)',
            }}
          >
            <Sparkles size={28} strokeWidth={1.5} />
          </motion.span>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-3"
          >
            AI Design Studio
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl text-token leading-tight"
          >
            Design Your Dream Dress with AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-body text-base md:text-lg text-muted mt-5 max-w-2xl mx-auto leading-relaxed"
          >
            Upload reference images, describe your vision, and let AI
            create a unique fashion design inspired by your ideas.
          </motion.p>
        </div>

        {/* AI Design Studio */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 border border-token bg-surface p-6 md:p-10"
        >
          <SectionHeading
            eyebrow="Create Your Design"
            title={<>Bring Your Vision to Life</>}
            align="center"
          />

          {/* Image Upload */}
          <div className="mt-8">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-dashed border-token px-6 py-10 text-center transition hover:bg-surface"
            >
              <span
                className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-token"
                style={{ color: 'var(--anim-bronze)' }}
              >
                <Upload size={24} strokeWidth={1.5} />
              </span>

              <h3 className="font-display text-xl text-token mt-4">
                Add Reference Images
              </h3>

              <p className="font-body text-sm text-muted mt-2">
                Upload one or multiple images for inspiration
              </p>

              <p className="font-body text-xs text-muted mt-2">
                You can describe what each image should contribute
                in your prompt.
              </p>
            </button>
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={`${image.name}-${index}`}
                  className="relative aspect-square border border-token overflow-hidden"
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Reference ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/70 text-white flex items-center justify-center"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X size={16} />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1">
                    Image {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prompt */}
          <div className="mt-8">
            <label
              htmlFor="ai-design-prompt"
              className="font-body text-sm text-token"
            >
              Describe your design
            </label>

            <textarea
              id="ai-design-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Example: Create a frock using the sleeve design from image 1 and the neck design from image 2. Use pink silk fabric with subtle gold embroidery."
              rows={6}
              maxLength={2000}
              className="mt-3 w-full border border-token bg-transparent px-4 py-4 font-body text-sm text-token outline-none resize-none"
            />

            <div className="mt-2 text-right">
              <span className="font-body text-xs text-muted">
                {prompt.length}/2000
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 border border-red-300 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary px-8 py-4 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Generate Design
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Generated Result */}
        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-12 border border-token bg-surface p-6 md:p-10"
          >
            <SectionHeading
              eyebrow="Your AI Design"
              title={<>Generated Result</>}
              align="center"
            />

            <div className="mt-8 max-w-3xl mx-auto">
              <img
                src={generatedImage}
                alt="AI generated fashion design"
                className="w-full h-auto border border-token"
              />

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="btn-primary px-7 py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center gap-2"
                >
                  <Download size={16} />
                  Download Design
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Customization Options */}
        <div className="mt-16">
          <SectionHeading
            eyebrow="Customization Options"
            title={<>What You Can Personalize</>}
            align="center"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {OPTIONS.map((o, i) => {
              const Icon = o.icon;

              return (
                <motion.div
                  key={o.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{
                    once: true,
                    margin: '-60px',
                  }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.08,
                  }}
                  className="bg-surface border border-token p-6"
                >
                  <span
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-token mb-4"
                    style={{ color: 'var(--anim-bronze)' }}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                  </span>

                  <h3 className="font-display text-xl text-token">
                    {o.label}
                  </h3>

                  <p className="font-body text-sm text-muted mt-2 leading-relaxed">
                    {o.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Custom Designs CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center border border-token bg-surface px-6 py-12 md:px-12"
        >
          <p className="font-body text-sm text-muted max-w-xl mx-auto leading-relaxed">
            Once your AI design is ready, you can use it as inspiration
            for your custom fashion creation with our atelier.
          </p>

          <Link
            to="/custom-designs"
            className="btn-primary mt-6 px-7 py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center gap-2"
          >
            Explore Custom Designs
            <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}