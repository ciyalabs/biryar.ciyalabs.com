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
      sidebar: [
        { label: 'Start here', items: [
          { label: 'What Biryar is', link: '/' },
          { label: 'Get Biryar', slug: 'get' },
          { label: 'Free and Pro', slug: 'plans' },
          { label: 'Support', slug: 'support' },
        ]},
        { label: 'Setting up', items: [
          { label: 'Install', slug: 'setup/install' },
          { label: 'Getting your SP-API keys', slug: 'setup/sp-api' },
          { label: 'Keepa', slug: 'setup/keepa' },
        ]},
        { label: 'Using it', items: [
          { label: 'Repricing', slug: 'guide/repricing' },
          { label: 'Adding a retailer', slug: 'guide/adapters' },
        ]},
        { label: 'How it works', items: [
          { label: 'How the fees are measured', slug: 'methodology/fees' },
          { label: 'How tenants are kept apart', slug: 'architecture/tenancy' },
          { label: 'BiryarBot', slug: 'bot' },
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
