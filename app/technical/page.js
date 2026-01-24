import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Book, Wrench, ExternalLink, Youtube, FileText, Play, Mail } from 'lucide-react';

export const metadata = {
  title: 'Technical Info | Rolls-Royce & Bentley Technical Videos and Parts Related Content',
  description: 'Technical videos, workshop guides, and parts-related content for Rolls-Royce and Bentley vehicles. Subscribe to our YouTube channel for new technical videos.',
};

// IntroCar Technical Videos - organized by category
// Real video IDs from IntroCar YouTube channel: https://www.youtube.com/channel/UCXXKCVAUeBYx6TpLREJ_5rQ
const technicalVideos = [
  // Bentley Continental GT Series
  {
    title: 'What Goes Wrong on a Bentley Continental GT? 6 Problems We See Often',
    description: 'Phil explains the most common issues that affect Bentley Continental GT models and how to address them.',
    youtubeId: 'KTXFOh_fFTg',
    category: 'Continental GT',
  },
  {
    title: 'Own a Classic Rolls-Royce or Bentley? Don\'t Ignore These 5 Common Issues!',
    description: 'Important maintenance tips and common problems to watch out for on classic Rolls-Royce and Bentley models.',
    youtubeId: 'FF-6KuYezBs',
    category: 'Continental GT',
  },
  {
    title: 'The Engineering Behind Prestige Parts: Remanufacturing Rolls-Royce & Bentley Components',
    description: 'An in-depth look at how Prestige Parts remanufactures components to OEM specifications.',
    youtubeId: 'wN6iwpaCDSM',
    category: 'Continental GT',
  },
  {
    title: 'Changing your Wiper Blades on Bentley Arnage models: How-to Guide',
    description: 'Step-by-step guide on how to replace wiper blades on Bentley Arnage models.',
    youtubeId: 'SNgtHqsJvXo',
    category: 'Continental GT',
  },
  {
    title: 'Changing your Wiper Blades on SZ Rolls-Royce & Bentley models: How-to Guide',
    description: 'Step-by-step guide on how to replace wiper blades on SZ series models.',
    youtubeId: 'FoIjIL3oBqE',
    category: 'Continental GT',
  },
  {
    title: 'Rolls-Royce Seraph & Bentley Arnage How-to guide: Initializing the car\'s seat memory',
    description: 'How to initialize and set up the seat memory function on Seraph and Arnage models.',
    youtubeId: 'BLEyIZwDGfQ',
    category: 'Continental GT',
  },
  {
    title: 'Rolls-Royce & Bentley Bonnet / Hood Spring Opening Fix - Arnage, Azure',
    description: 'How to fix bonnet spring opening issues on Arnage and Azure models.',
    youtubeId: 'q5td9vtMcXs',
    category: 'Continental GT',
  },
  // Brake System Videos
  {
    title: 'Reconditioning Rolls-Royce & Bentley Brake Accumulator Spheres: Part 1 Disassembly',
    description: 'Brake accumulator spheres are a vital component of the braking system in Rolls-Royce and Bentley models. This video covers disassembly.',
    youtubeId: 'em3vc2iNzDA',
    category: 'Brakes',
  },
  {
    title: 'Bleeding the Brakes - Rolls-Royce & Bentley Models with Brake Pumps',
    description: 'Matt shows us how to bleed the brakes on a 1992 Bentley Turbo R. He explains in three easy steps how to do this.',
    youtubeId: 'cQ12QDrnBuo',
    category: 'Brakes',
  },
  {
    title: 'Hydraulic Brake Pressure Testing',
    description: 'Matt puts the hydraulic system of a 1996 Bentley Brooklands to the test in this quick brake pressure test.',
    youtubeId: 'DFSznpbv6J0',
    category: 'Brakes',
  },
  {
    title: 'Accumulator Valve Body Testing',
    description: 'Matt shows how to test two Accumulator Valve Bodies for the final stage of the reconditioning process.',
    youtubeId: 'LSel-MmEItY',
    category: 'Brakes',
  },
  {
    title: 'Accumulator Valve Body Assembly',
    description: 'Matt Duncan shows how to assemble two Accumulator Valve Bodies to demonstrate the next stage of the reconditioning process.',
    youtubeId: 'cYuJ0ufiodQ',
    category: 'Brakes',
  },
  {
    title: 'Accumulator Valve Body Dismantling',
    description: 'Matt Duncan shows how to dismantle / strip two Accumulator Valve Bodies to demonstrate the first stage of reconditioning.',
    youtubeId: '_PtkNX-bT0c',
    category: 'Brakes',
  },
  {
    title: 'Hydraulic System Pressure Test for your Rolls-Royce or Bentley',
    description: 'Matt demonstrates a simple pressure test that can be performed on all Rolls-Royce & Bentley models for brake systems.',
    youtubeId: 'AlU_CnvG4Hg',
    category: 'Brakes',
  },
  {
    title: 'Testing Brake Pumps: Rolls-Royce Silver Shadow, Wraith II & Bentley T1 & T2',
    description: 'Matt Duncan demonstrates how to test the Brake Pump for your Rolls-Royce Corniche and related models.',
    youtubeId: 'jFA4DWbtxlc',
    category: 'Brakes',
  },
  {
    title: 'Brake Pump Fix Part 2: Reassembly',
    description: 'An in-depth reassembly tutorial of a Rolls-Royce Silver Shadow Brake Pump by Matt Duncan.',
    youtubeId: '__AFOuJvusY',
    category: 'Brakes',
  },
  {
    title: 'Brake Pump Fix Part 1: Strip Down',
    description: 'An in-depth dismantling and overhaul of a Rolls-Royce Silver Shadow Brake Pump by Matt Duncan.',
    youtubeId: 'i3oRCMp_aC0',
    category: 'Brakes',
  },
  {
    title: 'Understanding Rolls-Royce & Bentley Brake Pump Issues',
    description: 'The Brake Pump explained for Rolls-Royce Silver Shadow, Silver Shadow II, Bentley T1, Bentley T2, Silver Spirit and more.',
    youtubeId: 'RUlJncCU4vw',
    category: 'Brakes',
  },
  {
    title: 'SZ Brake Diagnostics',
    description: 'Video to help diagnose brake issues on your Bentley Turbo R, Rolls-Royce Silver Spirit and related models.',
    youtubeId: 't_lcPUVAlco',
    category: 'Brakes',
  },
  // Suspension & Steering
  {
    title: 'Reconditioning a Height Control Valve: UR18083: Part 2',
    description: 'The complete assembly of a Height Control Valve by Matthew Duncan, covering issues, considerations and more.',
    youtubeId: '0zaLqDI8BQc',
    category: 'Suspension',
  },
  {
    title: 'Reconditioning a Height Control Valve: UR18083: Part 1',
    description: 'The complete disassembly of a Height Control Valve by Matthew Duncan, covering issues and considerations.',
    youtubeId: 'Wkwxnhe6Vsg',
    category: 'Suspension',
  },
  {
    title: 'Main Issues with Height Control Valves in Shadows',
    description: 'Matt goes over a fully dismantled Height Control Valve and explains the function of each component.',
    youtubeId: 'gOR8LOMAVPo',
    category: 'Suspension',
  },
  {
    title: 'The Evolution of Suspension Components in Rolls-Royce & Bentley models from 1967 onwards',
    description: 'Matt explains the main differences in suspension components between different Rolls-Royce & Bentley models.',
    youtubeId: 'WcmYnBMil_Q',
    category: 'Suspension',
  },
  {
    title: 'Front & Rear Dampers for Rolls Royce & Bentley models from 1966 onwards',
    description: 'Matt details the differences between Front and Rear dampers for the Rolls-Royce Silver Shadow and Spirit models.',
    youtubeId: 'ObAPQ2BlJsc',
    category: 'Suspension',
  },
  {
    title: 'Fit Pre-active Ride Dampers to Your Rolls-Royce or Bentley for a Smoother Ride',
    description: 'Fitting pre-active ride dampers to your Rolls-Royce or Bentley motorcar is cheaper and easier than you think.',
    youtubeId: 'N6n5Yn-z5pU',
    category: 'Suspension',
  },
  {
    title: 'Handling kits for Rolls Royce & Bentley models from 1965 to 2003',
    description: 'Handling kits for early Rolls-Royce & Bentley chassis SZ models including Silver Shadow, Silver Spirit and more.',
    youtubeId: 'wV9JeQPZEmM',
    category: 'Suspension',
  },
  {
    title: 'Quick fix to your trailing arm for Rolls Royce & Bentley from 1965 to 2002',
    description: 'We offer a fixing kit for broken or worn cup in the trailing arms. No need to change the whole trailing arm!',
    youtubeId: 'c4nMRnAveA4',
    category: 'Suspension',
  },
  {
    title: 'Removing Driveshaft Flange from Hub',
    description: 'The drive shaft flanges on Rolls-Royce Silver Shadows (T type) and early Silver Spirits can be tricky. Matt shows the process.',
    youtubeId: 'EE2TxOwFj2U',
    category: 'Suspension',
  },
  {
    title: 'Splitting Rolls-Royce & Bentley Hubs',
    description: 'Everything you didn\'t know you needed to know about splitting Rolls-Royce & Bentley rear hubs.',
    youtubeId: 'CNUsUBbosVI',
    category: 'Suspension',
  },
  {
    title: 'Rack & Pinion Steering Racks: Rolls-Royce & Bentley Technical',
    description: 'Everything you may need to know about Steering Racks for your Rolls-Royce or Bentley.',
    youtubeId: 'cxD9b2YD20M',
    category: 'Suspension',
  },
  // Engine & Mechanical
  {
    title: 'Main issues with the V8 Camshaft on Rolls-Royce & Bentley cars',
    description: 'Matt goes over the main issues with the V8 camshafts, tappets and push rods for Rolls-Royce & Bentley models.',
    youtubeId: 'aGm_ibAYE6M',
    category: 'Engine',
  },
  {
    title: 'How to Diagnose an Engine Noise',
    description: 'Video to help diagnose engine noise in your Bentley T, T2, Rolls-Royce Silver Shadow and related models.',
    youtubeId: '199qcPLl5pA',
    category: 'Engine',
  },
  {
    title: 'Steel or Bronze oil pump gear on your Silver Shadow II?',
    description: 'Matt confirms the right material for your Crankshaft gears. Originally cars had a steel gear on the crankshaft.',
    youtubeId: 'RzS2rofGyaM',
    category: 'Engine',
  },
  {
    title: 'More about Tappets for Rolls-Royce & Bentley Six Cylinder and V8 Engines',
    description: 'Matt explains the difference between 6 cylinder and V8 engine tappets (also known as \'lifters\').',
    youtubeId: 'Lsn7hYvcAyg',
    category: 'Engine',
  },
  {
    title: 'Sealing your crankcase has never been this easy',
    description: 'Matt shows how to make this easy crankshaft modification for your Rolls-Royce or Bentley classic.',
    youtubeId: 'gBQLy6zMO80',
    category: 'Engine',
  },
  {
    title: 'Bentley and Rolls Royce Decarbonising kits for all models from 1946 to 2002',
    description: 'Matt goes over the decoke kit RH2379 for the Rolls Royce Silver Shadow and all the parts it comes with.',
    youtubeId: 'Qk65rF4Jsr0',
    category: 'Engine',
  },
  {
    title: 'Automatic Choke Issues in V8 Rolls-Royce & Bentley Motorcars',
    description: 'How the Choke System works and related issues for Rolls Royce Silver Shadow I, II and Bentley T1 & T2.',
    youtubeId: 'WoIh-BWKQic',
    category: 'Engine',
  },
  // Filters & Service
  {
    title: 'Rolls-Royce & Bentley Fuel Filters: Which is right for your car?',
    description: 'Matt looks at the different Rolls-Royce & Bentley Fuel Filters & their model applications for all motorcars.',
    youtubeId: '4xEhygBRoxE',
    category: 'Service',
  },
  {
    title: 'Rolls-Royce & Bentley Oil Filters: Which is right for your car?',
    description: 'Matt looks at the different Rolls-Royce & Bentley Oil Filters & their model applications.',
    youtubeId: 'LO7Xi8lkEi8',
    category: 'Service',
  },
  {
    title: 'More on Rolls-Royce & Bentley Air Filters for cars from 1965 onwards',
    description: 'More on Rolls-Royce & Bentley Air Filters for models from 1965 onwards including Silver Shadow & T Series.',
    youtubeId: 'T49HKcHWabA',
    category: 'Service',
  },
  {
    title: 'Which Brake Fluid is the right one for your Rolls-Royce or Bentley?',
    description: 'Matt looks at the different Brake Fluid options, which is right for each Rolls-Royce or Bentley car.',
    youtubeId: 'in8HL3jHEtw',
    category: 'Service',
  },
  {
    title: 'Rolls-Royce and Bentley Waterpumps: New versus Reconditioning',
    description: 'Matt details the differences between the generations of Rolls-Royce and Bentley waterpumps.',
    youtubeId: 'tOzBmIPclpg',
    category: 'Service',
  },
  {
    title: 'Save on \'All-in-One\' Service Kits for your Rolls-Royce or Bentley',
    description: 'Full Service Kits available for most classic Rolls-Royce & Bentley models from 1966 onward.',
    youtubeId: 'X-_6VS1VRyg',
    category: 'Service',
  },
  // Accumulators & Hydraulics
  {
    title: 'What You Need to Know About Accumulator Spheres for Rolls-Royce Silver Shadow & Bentley T Series',
    description: 'Matt details everything you may need to know about Accumulator Spheres for Rolls Royce Silver Shadow models.',
    youtubeId: '8R_jDTYF0_I',
    category: 'Hydraulics',
  },
  {
    title: 'Everything You Need to Know About Valve Bodies for Rolls-Royce Silver Shadow & Bentley T Series Cars',
    description: 'Matt details everything you may need to know about Valve Bodies for Rolls Royce Silver Shadow models.',
    youtubeId: 'LGBiLwQnlyY',
    category: 'Hydraulics',
  },
  {
    title: 'Accumulators & Valve Bodies for Rolls-Royce Silver Shadow & Bentley T Series (Part 1)',
    description: 'Everything you may need to know about Accumulator & Valve Bodies for Rolls Royce Silver Shadow models.',
    youtubeId: 'l9Hhw2E8ikw',
    category: 'Hydraulics',
  },
  {
    title: 'Accumulators for Mineral Oil Systems in Rolls Royce & Bentley models after 1980',
    description: 'Matt explains all about Rolls Royce & Bentley mineral oil hydraulic systems & accumulator spheres.',
    youtubeId: '0YFGSe_y73U',
    category: 'Hydraulics',
  },
  // Diagnostics
  {
    title: 'How to Diagnose Coolant Warning Light Issues',
    description: 'Video to help diagnose coolant warning light issues in your Bentley or Rolls-Royce.',
    youtubeId: 'VrG5igOf_j8',
    category: 'Diagnostics',
  },
];

// Get unique categories from videos
const categories = [...new Set(technicalVideos.map(v => v.category))].sort();

export default function TechnicalPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-introcar-blue to-introcar-charcoal text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Wrench className="w-8 h-8" />
              <span className="text-sm font-medium uppercase tracking-wider">Resources</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-light text-white mb-6">
              Technical
            </h1>
            <p className="text-xl text-white/80 leading-relaxed mb-6">
              Subscribe to our RR technical videos on any of our social channels. We release new technical videos regularly covering maintenance, repairs, and parts for Rolls-Royce and Bentley vehicles.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((cat) => (
                <a
                  key={cat}
                  href={`#${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  className="inline-flex items-center px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-full hover:bg-white/20 transition-colors"
                >
                  {cat}
                </a>
              ))}
            </div>
            <a
              href="mailto:info@introcar.com?subject=Technical Video Request"
              className="inline-flex items-center px-6 py-3 bg-white text-introcar-charcoal font-medium rounded-full hover:bg-introcar-light transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              Request a Technical Video
            </a>
          </div>
        </div>
      </section>

      {/* Technical Videos by Category */}
      {categories.map((category) => {
        const categoryVideos = technicalVideos.filter(v => v.category === category);
        return (
          <section key={category} className="py-12 border-b border-gray-100 last:border-b-0" id={category.toLowerCase().replace(/\s+/g, '-')}>
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-3 mb-8">
                <Play className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-display font-light text-introcar-charcoal">
                  {category}
                </h2>
                <span className="text-sm text-gray-400">({categoryVideos.length} videos)</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryVideos.map((video) => (
                  <div
                    key={video.title}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="aspect-video bg-gray-900 relative">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0`}
                        title={video.title}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-medium text-introcar-charcoal mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2">{video.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Subscribe CTA */}
      <section className="py-16 bg-introcar-light">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Youtube className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-4">
            Subscribe for New Technical Videos
          </h2>
          <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
            We regularly release new technical videos covering maintenance, repairs, and parts for Rolls-Royce and Bentley vehicles. Subscribe to our YouTube channel to stay updated.
          </p>
          <a
            href="https://www.youtube.com/channel/UCXXKCVAUeBYx6TpLREJ_5rQ?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors"
          >
            <Youtube className="w-5 h-5 mr-2" />
            Subscribe to Our YouTube Channel
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-display font-light text-introcar-charcoal mb-4">
            Need Technical Assistance?
          </h2>
          <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
            Our team has over 38 years of experience with Rolls-Royce and Bentley vehicles.
            We're here to help you find the right parts and provide technical guidance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-introcar-blue text-white font-medium rounded-full hover:bg-introcar-charcoal transition-colors"
            >
              Contact Our Team
            </Link>
            <a
              href="mailto:info@introcar.com?subject=Technical Question"
              className="inline-flex items-center px-6 py-3 border-2 border-introcar-blue text-introcar-blue font-medium rounded-full hover:bg-introcar-blue hover:text-white transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              Email Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
