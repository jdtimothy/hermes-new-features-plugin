import { host, ROUTES_AREA, SIDEBAR_NAV_AREA } from '@hermes/plugin-sdk';
import { useEffect, useState } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

const FEATURE_GROUPS = [
  {
    release: 'Prerelease',
    note: 'Upcoming capabilities to explore before their first stable release.',
    features: [
      {
        id: 'desktop-plugin-sdk',
        name: 'Desktop plugin SDK',
        description: 'Add native panes, commands, routes, and status items without rebuilding Hermes.',
      },
      {
        id: 'desktop-plugin-storage',
        name: 'Plugin-local storage',
        description: 'Keep plugin preferences and exploration progress locally on the device.',
      },
    ],
  },
  {
    release: '2026.1',
    note: 'Stable Hermes features.',
    features: [
      {
        id: 'persistent-memory',
        name: 'Persistent memory',
        description: 'Carry high-signal preferences and environment facts between sessions.',
      },
      {
        id: 'desktop-plugins',
        name: 'Desktop plugins',
        description: 'Extend the desktop app with theme-native UI surfaces that hot reload.',
      },
    ],
  },
];

const styles = {
  pane: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: '100%',
    overflow: 'auto',
    padding: '16px',
    color: 'var(--ui-text-primary)',
  },
  heading: { margin: 0, fontSize: '16px', fontWeight: 650 },
  subheading: { margin: '4px 0 0', color: 'var(--ui-text-secondary)', fontSize: '12px' },
  release: { display: 'flex', flexDirection: 'column', gap: '8px' },
  releaseTitle: { margin: 0, fontSize: '13px', color: 'var(--ui-text-primary)' },
  releaseNote: { margin: 0, fontSize: '12px', color: 'var(--ui-text-secondary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' },
  card: {
    appearance: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    border: '1px solid var(--ui-stroke-secondary)',
    borderRadius: '8px',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    padding: '12px',
    textAlign: 'left',
    transition: 'opacity 140ms ease, border-color 140ms ease',
  },
  featureName: { fontWeight: 600, fontSize: '13px' },
  description: { color: 'var(--ui-text-secondary)', fontSize: '12px', lineHeight: 1.45 },
  status: { color: 'var(--ui-text-quaternary)', fontSize: '11px' },
};

function FeatureCard({ feature, explored, onExplore }) {
  const [hovered, setHovered] = useState(false);
  const dimmed = explored && !hovered;

  return jsx('button', {
    type: 'button',
    onClick: onExplore,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: { ...styles.card, opacity: dimmed ? 0.52 : 1 },
    'aria-pressed': explored,
    children: jsxs('span', {
      children: [
        jsx('span', { style: styles.featureName, children: feature.name }),
        jsx('span', { style: styles.description, children: feature.description }),
        jsx('span', { style: styles.status, children: explored ? 'Explored' : 'Mark explored' }),
      ],
    }),
  });
}

function NewFeaturesPane({ ctx }) {
  const [explored, setExplored] = useState({});

  useEffect(() => {
    let active = true;
    Promise.resolve(ctx.storage.get('explored-features')).then((saved) => {
      if (active && saved && typeof saved === 'object') setExplored(saved);
    });
    return () => { active = false; };
  }, [ctx]);

  const markExplored = (featureId) => {
    setExplored((current) => {
      const next = { ...current, [featureId]: true };
      Promise.resolve(ctx.storage.set('explored-features', next));
      return next;
    });
  };

  return jsx('section', {
    style: styles.pane,
    children: [
      jsxs('header', {
        children: [
          jsx('h2', { style: styles.heading, children: 'What’s new' }),
          jsx('p', { style: styles.subheading, children: 'Explore notable Hermes features at your own pace.' }),
        ],
      }),
      ...FEATURE_GROUPS.map((group) => jsxs('section', {
        style: styles.release,
        children: [
          jsx('h3', { style: styles.releaseTitle, children: group.release }),
          jsx('p', { style: styles.releaseNote, children: group.note }),
          jsx('div', {
            style: styles.grid,
            children: group.features.map((feature) => jsx(FeatureCard, {
              feature,
              explored: Boolean(explored[feature.id]),
              onExplore: () => markExplored(feature.id),
            }, feature.id)),
          }),
        ],
      }, group.release)),
    ],
  });
}

export default {
  id: 'hermes-new-features',
  name: 'Hermes New Features',
  description: 'A release-organized, theme-native guide to notable Hermes features.',
  defaultEnabled: false,
  register(ctx) {
    ctx.register({
      id: 'hermes-new-features.pane',
      area: 'panes',
      order: 60,
      data: {
        title: 'What’s new',
        placement: 'right',
        width: '320px',
      },
      render: () => jsx(NewFeaturesPane, { ctx }),
    });

    ctx.register({
      id: 'hermes-new-features.page',
      area: ROUTES_AREA,
      data: { path: '/hermes-new-features' },
      render: () => jsx(NewFeaturesPane, { ctx }),
    });

    ctx.register({
      id: 'hermes-new-features.nav',
      area: SIDEBAR_NAV_AREA,
      order: 60,
      data: {
        path: '/hermes-new-features',
        label: 'What’s new',
        codicon: 'sparkle',
      },
    });

    host.logs('info', 'Hermes New Features plugin registered');
  },
};
