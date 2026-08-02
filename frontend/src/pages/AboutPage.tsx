import BasicPage from '@/components/BasicPage';

export default function AboutPage() {
  return (
    <BasicPage
      eyebrow="About"
      title="The Shreemithra Story"
      description="Shreemithra Ladies Boutique is a premium women's fashion house — blending traditional craft with contemporary design. From ready-made elegance to bespoke creations, every piece is made with intention."
      cta={{ label: 'Explore Our Collections', to: '/collections' }}
    >
      <div className="grid sm:grid-cols-3 gap-5">
        {[
          { title: 'Craft First', text: 'Every garment is finished by hand in our atelier, with attention to the details that matter.' },
          { title: 'Made for You', text: 'Customization is at the heart of what we do — fit, fabric, color and embroidery.' },
          { title: 'Timeless, Not Trendy', text: 'We design pieces meant to be worn and loved for years, not seasons.' },
        ].map((v, i) => (
          <div key={v.title} className="bg-surface border border-token p-6">
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-muted">0{i + 1}</span>
            <h3 className="font-display text-xl text-token mt-2">{v.title}</h3>
            <p className="font-body text-sm text-muted mt-2 leading-relaxed">{v.text}</p>
          </div>
        ))}
      </div>
    </BasicPage>
  );
}
