// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://biryar.ciyalabs.com',
  integrations: [
    starlight({
      title: 'Biryar',
      description:
        'A self-hosted Amazon operations cockpit. Reads your own seller account, ' +
        'measures what Amazon actually charged, and prices from it.',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/ciyalabs/biryar' },
      ],
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
          { label: 'Install', slug: 'setup/install' },
          { label: 'Getting your SP-API keys', slug: 'setup/sp-api' },
          { label: 'Keepa', slug: 'setup/keepa' },
        ]},
        { label: 'How it works', items: [
          { label: 'How the fees are measured', slug: 'methodology/fees' },
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
