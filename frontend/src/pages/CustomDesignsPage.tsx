import { useRef, useState } from "react";
import BasicPage from "@/components/BasicPage";
import { motion } from "framer-motion";
import {
  Wand2,
  Ruler,
  Sparkles,
  Heart,
  Upload,
  X,
  Check,
} from "lucide-react";
import { customDesignService } from "@/services/customDesignService";
import { useToast } from "@/context/ToastContext";

const STEPS = [
  {
    icon: Heart,
    title: "Share Your Vision",
    text: "Tell us about the occasion, mood, colors and silhouettes you love.",
  },
  {
    icon: Wand2,
    title: "Co-create the Design",
    text: "Our designers sketch and refine the piece with your input.",
  },
  {
    icon: Ruler,
    title: "Measurements & Fit",
    text: "Share your measurements — we perfect the fit for your body.",
  },
  {
    icon: Sparkles,
    title: "Crafted & Delivered",
    text: "Your custom piece is handcrafted in our atelier and delivered.",
  },
];

export default function CustomDesignsPage() {
  const { notify } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [occasion, setOccasion] = useState("");
  const [description, setDescription] = useState("");
  const [colors, setColors] = useState("");
  const [fabric, setFabric] = useState("");
  const [silhouette, setSilhouette] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("Please select an image file", "remove");
      return;
    }

    setImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!occasion.trim()) {
      notify("Please enter the occasion", "remove");
      return;
    }

    if (!description.trim()) {
      notify("Please describe your design", "remove");
      return;
    }

    setSubmitting(true);

    try {
      await customDesignService.create({
        occasion: occasion.trim(),
        description: description.trim(),
        colors: colors.trim(),
        fabric: fabric.trim(),
        silhouette: silhouette.trim(),
        inspiration_image: image,
      });

      notify(
        "Your custom design request has been submitted",
        "info"
      );

      setOccasion("");
      setDescription("");
      setColors("");
      setFabric("");
      setSilhouette("");
      removeImage();
    } catch (error) {
      console.error(
        "Custom design submission failed:",
        error
      );

      notify(
        "Unable to submit your custom design request",
        "remove"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BasicPage
      eyebrow="Custom Designs"
      title="Made Just for You"
      description="Bring your vision to our atelier. From first sketch to final stitch, we craft a piece that's uniquely yours."
      cta={{
        label: "Browse Boutique Creations",
        to: "/collections",
      }}
    >
      {/* Steps */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STEPS.map((s, i) => {
          const Icon = s.icon;

          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{
                once: true,
                margin: "-60px",
              }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
              }}
              className="bg-surface border border-token p-6"
            >
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-token mb-4"
                style={{
                  color: "var(--anim-bronze)",
                }}
              >
                <Icon size={20} strokeWidth={1.5} />
              </span>

              <h3 className="font-display text-lg text-token">
                {s.title}
              </h3>

              <p className="font-body text-sm text-muted mt-2 leading-relaxed">
                {s.text}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Custom Design Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-12 bg-surface border border-token p-6 md:p-8"
      >
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">
            Start Your Request
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-token mt-2">
            Tell Us About Your Dream Design
          </h2>

          <p className="font-body text-sm text-muted mt-2">
            Share your ideas and an inspiration image. Our team will
            review your request and work with you on the design.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Occasion */}
          <div>
            <label className="block font-body text-sm text-token mb-2">
              Occasion *
            </label>

            <input
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="Example: Wedding, Reception, Party"
              className="w-full border border-token bg-transparent px-4 py-3 text-sm text-token outline-none focus:ring-1 focus:ring-[var(--anim-bronze)]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-body text-sm text-token mb-2">
              Describe Your Design *
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about the dress you have in mind..."
              rows={5}
              className="w-full border border-token bg-transparent px-4 py-3 text-sm text-token outline-none resize-none focus:ring-1 focus:ring-[var(--anim-bronze)]"
            />
          </div>

          {/* Colors / Fabric / Silhouette */}
          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <label className="block font-body text-sm text-token mb-2">
                Colors
              </label>

              <input
                type="text"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder="Example: Pastel pink and gold"
                className="w-full border border-token bg-transparent px-4 py-3 text-sm text-token outline-none focus:ring-1 focus:ring-[var(--anim-bronze)]"
              />
            </div>

            <div>
              <label className="block font-body text-sm text-token mb-2">
                Fabric
              </label>

              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="Example: Silk"
                className="w-full border border-token bg-transparent px-4 py-3 text-sm text-token outline-none focus:ring-1 focus:ring-[var(--anim-bronze)]"
              />
            </div>

            <div>
              <label className="block font-body text-sm text-token mb-2">
                Silhouette
              </label>

              <input
                type="text"
                value={silhouette}
                onChange={(e) => setSilhouette(e.target.value)}
                placeholder="Example: A-line"
                className="w-full border border-token bg-transparent px-4 py-3 text-sm text-token outline-none focus:ring-1 focus:ring-[var(--anim-bronze)]"
              />
            </div>
          </div>

          {/* Inspiration Image */}
          <div>
            <label className="block font-body text-sm text-token mb-2">
              Inspiration Image
            </label>

            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-token p-8 flex flex-col items-center justify-center text-center hover:bg-surface transition"
              >
                <Upload
                  size={28}
                  strokeWidth={1.5}
                  style={{
                    color: "var(--anim-bronze)",
                  }}
                />

                <span className="font-body text-sm text-token mt-3">
                  Upload an inspiration image
                </span>

                <span className="font-body text-xs text-muted mt-1">
                  JPG, PNG, WEBP
                </span>
              </button>
            ) : (
              <div className="relative border border-token p-3">
                <img
                  src={imagePreview}
                  alt="Inspiration preview"
                  className="w-full max-h-80 object-contain"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-5 right-5 h-9 w-9 rounded-full bg-black/70 text-white flex items-center justify-center"
                  aria-label="Remove image"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-2 mt-3 text-sm text-muted">
                  <Check size={16} />
                  <span>{image?.name}</span>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-8 py-3 bg-[var(--anim-bronze)] text-white text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Submitting..."
                : "Submit Custom Design Request"}
            </button>
          </div>
        </form>
      </motion.div>
    </BasicPage>
  );
}