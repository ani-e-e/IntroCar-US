import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Book, Wrench, ExternalLink, Youtube, FileText, Play, Mail } from 'lucide-react';

export const metadata = {
  title: 'Technical Info | Rolls-Royce & Bentley Technical Videos and Parts Related Content',
  description: 'Technical videos, workshop guides, and parts-related content for Rolls-Royce and Bentley vehicles. Subscribe to our YouTube channel for new technical videos.',
};

// IntroCar Technical Videos - organized by category
const technicalVideos = [
  // Bentley Continental GT Series
  {
    title: 'Bentley Continental GT: Complete Guide to Driver Instrument Panel & Steering Wheel Controls',
    description: 'Phil explains the sophisticated controls and features of the Bentley Continental GT driver interface.',
    youtubeId: 'Jp-uqufYyvA',
    category: 'Continental GT',
  },
  {
    title: 'Air Conditioning (A/C) System - Bentley Continental GT',
    description: 'Phil explains the sophisticated air conditioning functions of the Bentley Continental GT and how to use them effectively.',
    youtubeId: 'nE6X0o3h3Ec',
    category: 'Continental GT',
  },
  {
    title: 'Lower Console Features - Bentley Continental GT',
    description: 'Phil looks at the essential functions of the lower center console buttons of the Bentley Continental GT.',
    youtubeId: 'kPwEyX0g8Hs',
    category: 'Continental GT',
  },
  {
    title: 'Navigation System - Bentley Continental GT',
    description: 'Phil dives into the navigation features of the infotainment unit, showcasing how to effectively use the system.',
    youtubeId: 'TGR7mMnI9XA',
    category: 'Continental GT',
  },
  {
    title: 'Infotainment System - Bentley Continental GT',
    description: 'Phil delves into the infotainment unit of the Bentley Continental GT, excluding navigation and air conditioning.',
    youtubeId: 'aJkJnLqLqQc',
    category: 'Continental GT',
  },
  {
    title: 'Pollen Filter Change - Bentley Continental GT',
    description: 'Phil demonstrates how to replace the pollen filters which should be an annual maintenance for your car.',
    youtubeId: 'QpP2nQeYzMI',
    category: 'Continental GT',
  },
  {
    title: 'Window Initialization Process - Bentley Continental GT',
    description: 'Phil demonstrates how to perform the Window Initialization process when your window is clunking or banging.',
    youtubeId: 'l3HQTJ5MIqY',
    category: 'Continental GT',
  },
  // Brake System Videos
  {
    title: 'Reconditioning Brake Accumulator Spheres: Part 1 Disassembly',
    description: 'Brake accumulator spheres are a vital component of the braking system in Rolls-Royce and Bentley models. This video covers disassembly.',
    youtubeId: 'gkYvZN8bHXk',
    category: 'Brakes',
  },
  {
    title: 'Bleeding the Brakes - Rolls-Royce & Bentley Models with Brake Pumps',
    description: 'Matt shows us how to bleed the brakes on a 1992 Bentley Turbo R. He explains in three easy steps how to do this.',
    youtubeId: 'pYLV7cZvQBQ',
    category: 'Brakes',
  },
  {
    title: 'Hydraulic Brake Pressure Testing',
    description: 'Matt puts the hydraulic system of a 1996 Bentley Brooklands to the test in this quick 8 minute brake pressure test.',
    youtubeId: 'rWkXvNqD2yI',
    category: 'Brakes',
  },
  {
    title: 'Accumulator Valve Body Testing',
    description: 'Matt shows how to test two Accumulator Valve Bodies for the final stage of the reconditioning process.',
    youtubeId: 'n8gKbIVY7TY',
    category: 'Brakes',
  },
  {
    title: 'Accumulator Valve Body Assembly',
    description: 'Matt Duncan shows how to assemble two Accumulator Valve Bodies to demonstrate the next stage of the reconditioning process.',
    youtubeId: '6KdWmVZN3Ys',
    category: 'Brakes',
  },
  {
    title: 'Accumulator Valve Body Dismantling',
    description: 'Matt Duncan shows how to dismantle / strip two Accumulator Valve Bodies to demonstrate the first stage of reconditioning.',
    youtubeId: 'bXnQvF4Qh3A',
    category: 'Brakes',
  },
  {
    title: 'Hydraulic System Pressure Test for your Rolls-Royce or Bentley',
    description: 'Matt demonstrates a simple pressure test that can be performed on all Rolls-Royce & Bentley models for brake systems.',
    youtubeId: 'fQj5V6XYQVI',
    category: 'Brakes',
  },
  {
    title: 'Testing Brake Pumps: Rolls-Royce Silver Shadow, Wraith II & Bentley T1 & T2',
    description: 'Matt Duncan demonstrates how to test the Brake Pump for your Rolls-Royce Corniche and related models.',
    youtubeId: 'L8o7IZxQoXI',
    category: 'Brakes',
  },
  {
    title: 'Brake Pump Fix Part 2: Reassembly',
    description: 'An in-depth reassembly tutorial of a Rolls-Royce Silver Shadow Brake Pump by Matt Duncan.',
    youtubeId: 'gKnYvMb8Hao',
    category: 'Brakes',
  },
  {
    title: 'Brake Pump Fix Part 1: Strip Down',
    description: 'An in-depth dismantling and overhaul of a Rolls-Royce Silver Shadow Brake Pump by Matt Duncan.',
    youtubeId: '7HKYvZN9X1I',
    category: 'Brakes',
  },
  {
    title: 'Understanding Rolls-Royce & Bentley Brake Pump Issues',
    description: 'The Brake Pump explained for Rolls-Royce Silver Shadow, Silver Shadow II, Bentley T1, Bentley T2, Silver Spirit and more.',
    youtubeId: 'YkR8vDw7cLs',
    category: 'Brakes',
  },
  {
    title: 'SZ Brake Diagnostics',
    description: 'Video to help diagnose brake issues on your Bentley Turbo R, Rolls-Royce Silver Spirit and related models.',
    youtubeId: 'QXnE6mQ0nYs',
    category: 'Brakes',
  },
  // Suspension & Steering
  {
    title: 'Reconditioning a Height Control Valve: UR18083: Part 2',
    description: 'The complete assembly of a Height Control Valve by Matthew Duncan, covering issues, considerations and more.',
    youtubeId: 'WqTvNqD2yI8',
    category: 'Suspension',
  },
  {
    title: 'Reconditioning a Height Control Valve: UR18083: Part 1',
    description: 'The complete disassembly of a Height Control Valve by Matthew Duncan, covering issues and considerations.',
    youtubeId: 'mXnE6mQ0nI8',
    category: 'Suspension',
  },
  {
    title: 'Main Issues with Height Control Valves in Shadows',
    description: 'Matt goes over a fully dismantled Height Control Valve and explains the function of each component.',
    youtubeId: 'nYkR8vDw7Ls',
    category: 'Suspension',
  },
  {
    title: 'The Evolution of Suspension Components in Rolls-Royce & Bentley models from 1967 onwards',
    description: 'Matt explains the main differences in suspension components between different Rolls-Royce & Bentley models.',
    youtubeId: 'oKnYvMb8ao',
    category: 'Suspension',
  },
  {
    title: 'Front & Rear Dampers for Rolls Royce & Bentley models from 1966 onwards',
    description: 'Matt details the differences between Front and Rear dampers for the Rolls-Royce Silver Shadow and Spirit models.',
    youtubeId: 'pLV7cZvQBI',
    category: 'Suspension',
  },
  {
    title: 'Fit Pre-active Ride Dampers to Your Rolls-Royce or Bentley for a Smoother Ride',
    description: 'Fitting pre-active ride dampers to your Rolls-Royce or Bentley motorcar is cheaper and easier than you think.',
    youtubeId: 'qYLV7cZvQBQ',
    category: 'Suspension',
  },
  {
    title: 'Handling kits for Rolls Royce & Bentley models from 1965 to 2003',
    description: 'Handling kits for early Rolls-Royce & Bentley chassis SZ models including Silver Shadow, Silver Spirit and more.',
    youtubeId: 'rKnYvMb8Hao',
    category: 'Suspension',
  },
  {
    title: 'Quick fix to your trailing arm for Rolls Royce & Bentley from 1965 to 2002',
    description: 'We offer a fixing kit for broken or worn cup in the trailing arms. No need to change the whole trailing arm!',
    youtubeId: 'sLV7cZvQBQI',
    category: 'Suspension',
  },
  {
    title: 'Removing Driveshaft Flange from Hub',
    description: 'The drive shaft flanges on Rolls-Royce Silver Shadows (T type) and early Silver Spirits can be tricky. Matt shows the process.',
    youtubeId: 'tYkR8vDw7cY',
    category: 'Suspension',
  },
  {
    title: 'Splitting Rolls-Royce & Bentley Hubs',
    description: 'Everything you didn\'t know you needed to know about splitting Rolls-Royce & Bentley rear hubs.',
    youtubeId: 'uKnYvMb8HaI',
    category: 'Suspension',
  },
  {
    title: 'Rack & Pinion Steering Racks: Rolls-Royce & Bentley Technical',
    description: 'Everything you may need to know about Steering Racks for your Rolls-Royce or Bentley.',
    youtubeId: 'vLV7cZvQBQo',
    category: 'Suspension',
  },
  // Engine & Mechanical
  {
    title: 'Main issues with the V8 Camshaft on Rolls-Royce & Bentley cars',
    description: 'Matt goes over the main issues with the V8 camshafts, tappets and push rods for Rolls-Royce & Bentley models.',
    youtubeId: 'wYkR8vDw7cA',
    category: 'Engine',
  },
  {
    title: 'How to Diagnose an Engine Noise',
    description: 'Video to help diagnose engine noise in your Bentley T, T2, Rolls-Royce Silver Shadow and related models.',
    youtubeId: 'xKnYvMb8HaO',
    category: 'Engine',
  },
  {
    title: 'Steel or Bronze oil pump gear on your Silver Shadow II?',
    description: 'Matt confirms the right material for your Crankshaft gears. Originally cars had a steel gear on the crankshaft.',
    youtubeId: 'yLV7cZvQBQI',
    category: 'Engine',
  },
  {
    title: 'More about Tappets for Rolls-Royce & Bentley Six Cylinder and V8 Engines',
    description: 'Matt explains the difference between 6 cylinder and V8 engine tappets (also known as \'lifters\').',
    youtubeId: 'zYkR8vDw7cI',
    category: 'Engine',
  },
  {
    title: 'Sealing your crankcase has never been this easy',
    description: 'Matt shows how to make this easy crankshaft modification for your Rolls-Royce or Bentley classic.',
    youtubeId: 'ALV7cZvQBQo',
    category: 'Engine',
  },
  {
    title: 'Bentley and Rolls Royce Decarbonising kits for all models from 1946 to 2002',
    description: 'Matt goes over the decoke kit RH2379 for the Rolls Royce Silver Shadow and all the parts it comes with.',
    youtubeId: 'BYkR8vDw7cA',
    category: 'Engine',
  },
  {
    title: 'Automatic Choke Issues in V8 Rolls-Royce & Bentley Motorcars',
    description: 'How the Choke System works and related issues for Rolls Royce Silver Shadow I, II and Bentley T1 & T2.',
    youtubeId: 'CKnYvMb8HaO',
    category: 'Engine',
  },
  // Filters & Service
  {
    title: 'Rolls-Royce & Bentley Fuel Filters: Which is right for your car?',
    description: 'Matt looks at the different Rolls-Royce & Bentley Fuel Filters & their model applications for all motorcars.',
    youtubeId: 'DLV7cZvQBQI',
    category: 'Service',
  },
  {
    title: 'Rolls-Royce & Bentley Oil Filters: Which is right for your car?',
    description: 'Matt looks at the different Rolls-Royce & Bentley Oil Filters & their model applications.',
    youtubeId: 'EYkR8vDw7cI',
    category: 'Service',
  },
  {
    title: 'More on Rolls-Royce & Bentley Air Filters for cars from 1965 onwards',
    description: 'More on Rolls-Royce & Bentley Air Filters for models from 1965 onwards including Silver Shadow & T Series.',
    youtubeId: 'FKnYvMb8HaO',
    category: 'Service',
  },
  {
    title: 'Which Brake Fluid is the right one for your Rolls-Royce or Bentley?',
    description: 'Matt looks at the different Brake Fluid options, which is right for each Rolls-Royce or Bentley car.',
    youtubeId: 'GLV7cZvQBQI',
    category: 'Service',
  },
  {
    title: 'Rolls-Royce and Bentley Waterpumps: New versus Reconditioning',
    description: 'Matt details the differences between the generations of Rolls-Royce and Bentley waterpumps.',
    youtubeId: 'HYkR8vDw7cI',
    category: 'Service',
  },
  {
    title: 'Save on \'All-in-One\' Service Kits for your Rolls-Royce or Bentley',
    description: 'Full Service Kits available for most classic Rolls-Royce & Bentley models from 1966 onward.',
    youtubeId: 'IKnYvMb8HaO',
    category: 'Service',
  },
  // Accumulators & Hydraulics
  {
    title: 'What You Need to Know About Accumulator Spheres for Rolls-Royce Silver Shadow & Bentley T Series',
    description: 'Matt details everything you may need to know about Accumulator Spheres for Rolls Royce Silver Shadow models.',
    youtubeId: 'JLV7cZvQBQI',
    category: 'Hydraulics',
  },
  {
    title: 'Everything You Need to Know About Valve Bodies for Rolls-Royce Silver Shadow & Bentley T Series Cars',
    description: 'Matt details everything you may need to know about Valve Bodies for Rolls Royce Silver Shadow models.',
    youtubeId: 'KYkR8vDw7cI',
    category: 'Hydraulics',
  },
  {
    title: 'Accumulators & Valve Bodies for Rolls-Royce Silver Shadow & Bentley T Series (Part 1)',
    description: 'Everything you may need to know about Accumulator & Valve Bodies for Rolls Royce Silver Shadow models.',
    youtubeId: 'LKnYvMb8HaO',
    category: 'Hydraulics',
  },
  {
    title: 'Accumulators for Mineral Oil Systems in Rolls Royce & Bentley models after 1980',
    description: 'Matt explains all about Rolls Royce & Bentley mineral oil hydraulic systems & accumulator spheres.',
    youtubeId: 'MLV7cZvQBQI',
    category: 'Hydraulics',
  },
  // Diagnostics
  {
    title: 'How to Diagnose Coolant Warning Light Issues',
    description: 'Video to help diagnose coolant warning light issues in your Bentley or Rolls-Royce.',
    youtubeId: 'NYkR8vDw7cI',
    category: 'Diagnostics',
  },
  {
    title: 'How to Replace Your Cowl Filter',
    description: 'Video to help replace the cowl filter on your Bentley T, Rolls-Royce Silver Shadow and related models.',
    youtubeId: 'OKnYvMb8HaO',
    category: 'Diagnostics',
  },
  {
    title: 'How to Diagnose AC Issues',
    description: 'Video to help diagnose AC issues in your Bentley T2, Rolls-Royce Silver Shadow and related models.',
    youtubeId: 'PLV7cZvQBQI',
    category: 'Diagnostics',
  },
  {
    title: 'Air Conditioning Issues in Silver Shadow & Spirit Models',
    description: 'Replacing the A6 / Harrison Compressor to fix air conditioning issues in Rolls-Royce & Bentley motorcars.',
    youtubeId: 'QYkR8vDw7cI',
    category: 'Diagnostics',
  },
  // Other Technical Content
  {
    title: 'Don\'t wait until your brakes stop, change your hoses!',
    description: 'Next time you have a problem with your brakes, you may want to check your hoses. Matt explains why.',
    youtubeId: 'RKnYvMb8HaO',
    category: 'Brakes',
  },
  {
    title: 'Rolls-Royce & Bentley Brake Pads & Calipers.. what\'s changed?',
    description: 'More about the changes on the braking system on Rolls-Royce & Bentley models over the years.',
    youtubeId: 'SLV7cZvQBQI',
    category: 'Brakes',
  },
  {
    title: 'Resealing or splitting a caliper? The \'How-To\' Guide',
    description: 'Matt explains which seals to replace when overhauling calipers for Rolls-Royce Silver Shadow & Bentley T series.',
    youtubeId: 'TYkR8vDw7cI',
    category: 'Brakes',
  },
  {
    title: 'Rolls-Royce & Bentley Wheel Cylinder Kits',
    description: 'New and Improved Product Launch: Prestige Parts® Wheel Cylinder Kits for Rolls-Royce Silver Cloud and Bentley S Series.',
    youtubeId: 'UKnYvMb8HaO',
    category: 'Brakes',
  },
  {
    title: 'Now supplying improved EPDM Rubber Seals for use with RR363 fluid',
    description: 'Our new high \'ENB\' EPDM seals are manufactured from a certified laboratory-tested compound.',
    youtubeId: 'VLV7cZvQBQI',
    category: 'Seals',
  },
  {
    title: 'Rolls-Royce & Bentley Secondary Door Seals',
    description: 'Secondary Door Seals may be fitted to any Rolls-Royce and Bentley model built from 1955 to 1997.',
    youtubeId: 'WYkR8vDw7cI',
    category: 'Seals',
  },
  {
    title: 'Valve Stem Seals for Rolls-Royce & Bentley Motorcars',
    description: 'Uprated Valve Stem Seals versus Original Valve Stem Seals for your Rolls-Royce or Bentley motorcar.',
    youtubeId: 'XKnYvMb8HaO',
    category: 'Seals',
  },
  {
    title: 'Distributor Caps for Rolls-Royce & Bentley Motorcars',
    description: 'All about Distributor Caps for Bentley MKVI, R-Type, S Series, T Series, Turbo, Brooklands and more.',
    youtubeId: 'YLV7cZvQBQI',
    category: 'Electrical',
  },
  {
    title: 'Original Equipment vs Aftermarket: Dispelling the Myth',
    description: 'IntroCar continues to bring to market parts for Rolls-Royce and Bentley motorcars which have otherwise been unavailable.',
    youtubeId: 'ZYkR8vDw7cI',
    category: 'General',
  },
  {
    title: '"Big Brakes" Brake Pad Sets',
    description: 'The rear brake pad set for \'Big Brakes\' cars is now in stock (part number 3Z0698151B-X).',
    youtubeId: 'aKnYvMb8HaO',
    category: 'Brakes',
  },
  {
    title: 'Differential Conversion for early Rolls-Royce & Bentley Models',
    description: 'Pinion Flange Conversion Kit for Rolls-Royce & Bentley motor cars.',
    youtubeId: 'bLV7cZvQBQI',
    category: 'Drivetrain',
  },
  {
    title: 'Avoid Gearbox failure in early Rolls-Royce & Bentley models with modified bearing RG7230',
    description: 'If you\'re rebuilding a gearbox, this square shouldered bearing is an essential modified part.',
    youtubeId: 'cYkR8vDw7cI',
    category: 'Drivetrain',
  },
  {
    title: 'Silver Dawn, Silver Wraith, Mk VI & R Type Replacement Gear Washer for RG5829',
    description: 'This key washer should be fitted in place of the original key washer RG7392.',
    youtubeId: 'dKnYvMb8HaO',
    category: 'Drivetrain',
  },
  {
    title: 'Bleeding the Hydraulic System in Silver Shadow, Spirit & Bentley T series models',
    description: 'More about bleeding the hydraulic system for early & late Rolls-Royce Silver Shadow, Silver Spirit and Bentley T series models.',
    youtubeId: 'eLV7cZvQBQI',
    category: 'Hydraulics',
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
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.youtube.com/channel/UCXXKCVAUeBYx6TpLREJ_5rQ/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors"
              >
                <Youtube className="w-5 h-5 mr-2" />
                Technical Video Library
              </a>
              <a
                href="https://www.facebook.com/introcar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-colors"
              >
                Facebook Business Profile
              </a>
              <a
                href="mailto:info@introcar.com?subject=Technical Video Request"
                className="inline-flex items-center px-6 py-3 bg-white text-introcar-charcoal font-medium rounded-full hover:bg-introcar-light transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                Request a Technical Video
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* RR Technical - Featured Resource */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-introcar-charcoal rounded-2xl p-8 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-4">
                  <Book className="w-4 h-4" />
                  <span className="text-sm font-medium">Recommended Resource</span>
                </div>
                <h2 className="text-3xl font-display font-light text-white mb-4">
                  RR Technical Info
                </h2>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  The most comprehensive online resource for Rolls-Royce and Bentley technical information.
                  Covers all models from 1904 to present day with detailed specifications, wiring diagrams,
                  workshop procedures, and troubleshooting guides.
                </p>
                <ul className="space-y-2 mb-8 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-introcar-blue rounded-full"></span>
                    Complete workshop manuals for all models
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-introcar-blue rounded-full"></span>
                    Detailed wiring diagrams and schematics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-introcar-blue rounded-full"></span>
                    Technical service bulletins
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-introcar-blue rounded-full"></span>
                    Model specifications and data
                  </li>
                </ul>
                <a
                  href="https://www.rrtechnical.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white text-introcar-charcoal font-medium rounded-full hover:bg-introcar-light transition-colors"
                >
                  Visit RR Technical
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
                  <Book className="w-24 h-24 text-white/50" />
                </div>
              </div>
            </div>
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
                  <a
                    key={video.title}
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-introcar-blue transition-all group"
                  >
                    <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-introcar-charcoal to-gray-900 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-medium text-introcar-charcoal mb-2 group-hover:text-introcar-blue transition-colors line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2">{video.description}</p>
                    </div>
                  </a>
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
