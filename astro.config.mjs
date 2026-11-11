// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://biryar.ciyalabs.com',
  integrations: [
    starlight({
      title: 'Biryar',
      logo: { src: './src/assets/biryar.svg', alt: '' },
      favicon: '/favicon.svg',
      description:
        'A self-hosted Amazon operations cockpit. Reads your own seller account, ' +
        'measures what Amazon actually charged, and prices from it.',
      // No link to the product repository: it is private. The site is
      // the public face, and a link that answers 404 to everyone who is
      // not a customer reads as a broken product rather than a closed one.
      editLink: {
        baseUrl: 'https://github.com/ciyalabs/biryar.ciyalabs.com/edit/main/',
      },
      // The six technical reports are standalone HTML with their own styling
      // and citation widget. They are served from public/reports untouched
      // rather than ported, so the writing stays exactly as it was published.
      customCss: ['./src/styles/biryar.css'],
      // The foot of every page says who makes Biryar and links the imprint.
      components: { Footer: './src/components/Footer.astro' },
      // The maker, in the header beside the theme switch.
      social: [
        { icon: 'external', label: 'Ciya Labs, the company that makes Biryar', href: 'https://ciyalabs.com/' },
        { icon: 'email', label: 'Write to Ciya Labs', href: 'mailto:info@ciyalabs.com' },
      ],
      sidebar: [
        { label: 'Start here', items: [
          { label: 'What Biryar is', link: '/' },
          { label: 'Get Biryar', slug: 'get' },
          { label: 'Free and Pro', slug: 'plans' },
          { label: 'What is new', slug: 'whats-new' },
          { label: 'Words used here', slug: 'words' },
          { label: 'Support', slug: 'support' },
        ]},
        { label: 'Setting up', items: [
          { label: 'Install', slug: 'setup/install' },
          { label: 'Connecting Amazon', slug: 'setup/sp-api' },
          { label: 'Keepa', slug: 'setup/keepa' },
          { label: 'ScraperAPI', slug: 'setup/scraperapi' },
          { label: 'Getting back in', slug: 'setup/getting-back-in' },
        ]},
        { label: 'Using it', items: [
          { label: 'Sourcing', slug: 'guide/sourcing' },
          { label: 'Repricing', slug: 'guide/repricing' },
          { label: 'Portfolio', slug: 'guide/portfolio' },
        ]},
        { label: 'How it works', items: [
          { label: 'How the fees are measured', slug: 'methodology/fees' },
          { label: 'Where your data lives', slug: 'methodology/your-data' },
          { label: 'BiryarBot, for shop owners', slug: 'bot' },
        ]},
        // The two pages here expect a reader who writes code. They sit in a
        // group that says so, so a seller does not open one, meet SQL, and
        // conclude the whole product is written for somebody else.
        { label: 'For developers', collapsed: true, items: [
          { label: 'Adding a retailer', slug: 'guide/adapters' },
          { label: 'How businesses are kept apart', slug: 'architecture/tenancy' },
        ]},
        { label: 'Reports', items: [
          { label: 'All reports', slug: 'reports' },
          { label: 'Sourcing', link: '/reports/sourcing/', attrs: { target: '_blank' } },
          { label: 'Portfolio', link: '/reports/portfolio/', attrs: { target: '_blank' } },
          { label: 'Repricing', link: '/reports/repricing/', attrs: { target: '_blank' } },
          { label: 'Reimbursements', link: '/reports/reimbursements/', attrs: { target: '_blank' } },
          { label: 'Upstream', link: '/reports/manufacturers/', attrs: { target: '_blank' } },
          { label: 'Ungating', link: '/reports/ungating/', attrs: { target: '_blank' } },
        ]},
      ],
    }),
  ],
});
