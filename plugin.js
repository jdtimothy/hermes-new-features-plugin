import {
  Badge,
  Button,
  cn,
  Codicon,
  EmptyState,
  haptic,
  host,
  ROUTES_AREA,
  SIDEBAR_NAV_AREA,
} from '@hermes/plugin-sdk';
import { useEffect, useMemo, useState } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

const ID = 'hermes-new-features';
let storage;

const FEATURE_GROUPS = [
  {
    release: 'Prerelease',
    note: 'Preview capabilities worth exploring before their first stable release.',
    features: [
      {
        id: 'desktop-plugin-sdk',
        icon: 'extensions',
        name: 'Desktop plugin SDK',
        description: 'Build native panes, commands, routes, and status items without rebuilding Hermes.',
      },
      {
        id: 'desktop-plugin-storage',
        icon: 'database',
        name: 'Plugin-local storage',
        description: 'Keep preferences and exploration progress local to each desktop installation.',
      },
    ],
  },
  {
    release: '2026.1',
    note: 'Stable capabilities available in Hermes today.',
    features: [
      {
        id: 'persistent-memory',
        icon: 'heart',
        name: 'Persistent memory',
        description: 'Carry high-signal preferences and environment facts between sessions.',
      },
      {
        id: 'desktop-plugins',
        icon: 'milestone',
        name: 'Desktop plugins',
        description: 'Extend the desktop app with theme-native UI that reloads in place.',
      },
    ],
  },
];

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unexplored', label: 'To explore' },
  { id: 'explored', label: 'Explored' },
];

function FeatureCard({ feature, release, explored, onExplore }) {
  return jsxs('article', {
    className: cn(
      'group flex min-h-48 flex-col rounded-lg border p-4 transition-colors',
      explored
        ? 'border-(--ui-stroke-secondary) bg-(--ui-bg-secondary) opacity-65 hover:bg-(--ui-bg-tertiary) hover:opacity-100'
        : 'border-(--ui-stroke-strong) bg-(--ui-bg-tertiary)'
    ),
    children: [
      jsxs('div', {
        className: 'flex items-start justify-between gap-3',
        children: [
          jsx('div', {
            className: cn(
              'flex size-8 shrink-0 items-center justify-center rounded-md border',
              explored
                ? 'border-(--ui-stroke-secondary) text-(--ui-text-tertiary)'
                : 'border-(--ui-stroke-secondary) bg-(--ui-accent-muted) text-(--ui-accent)'
            ),
            children: jsx(Codicon, { name: feature.icon, size: '0.9rem' }),
          }),
          jsx(Badge, {
            variant: 'outline',
            className: 'shrink-0 bg-(--ui-accent) text-(--ui-text-primary)',
            children: release,
          }),
        ],
      }),
      jsx('h2', {
        className: 'mt-4 text-sm font-medium tracking-[-0.01em] text-(--ui-text-primary)',
        children: feature.name,
      }),
      jsx('p', {
        className: 'mt-1.5 line-clamp-3 text-xs leading-relaxed text-(--ui-text-tertiary)',
        children: feature.description,
      }),
      jsxs('div', {
        className: 'mt-auto flex items-center justify-between gap-3 pt-4',
        children: [
          jsxs('span', {
            className: 'inline-flex items-center gap-1.5 text-[0.6875rem] text-(--ui-text-quaternary)',
            children: [
              jsx('span', {
                className: cn('size-1.5 rounded-full', explored ? 'bg-(--ui-text-quaternary)' : 'bg-(--ui-accent)'),
              }),
              explored ? 'Explored' : 'New to you',
            ],
          }),
          jsx(Button, {
            type: 'button',
            variant: explored ? 'ghost' : 'secondary',
            size: 'sm',
            onClick: () => {
              haptic('tap');
              onExplore(feature.id);
            },
            children: explored ? 'Review' : 'Explore',
          }),
        ],
      }),
    ],
  });
}

function ReleaseSection({ group, explored, filter, onExplore }) {
  const features = group.features.filter((feature) => {
    const isExplored = Boolean(explored[feature.id]);
    return filter === 'all' || (filter === 'explored' ? isExplored : !isExplored);
  });

  if (!features.length) return null;

  return jsxs('section', {
    className: 'space-y-3',
    children: [
      jsxs('div', {
        className: 'flex items-start justify-between gap-4',
        children: [
          jsxs('div', {
            children: [
              jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  jsx('h1', { className: 'text-sm font-medium', children: group.release }),
                  group.release === 'Prerelease'
                    ? jsx(Badge, { variant: 'outline', className: 'text-[0.625rem] text-(--ui-accent)', children: 'Preview' })
                    : null,
                ],
              }),
              jsx('p', { className: 'mt-1 text-xs text-(--ui-text-tertiary)', children: group.note }),
            ],
          }),
          jsx('span', { className: 'pt-0.5 text-xs tabular-nums text-(--ui-text-quaternary)', children: `${features.length} features` }),
        ],
      }),
      jsx('div', {
        className: 'grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3',
        children: features.map((feature) => jsx(FeatureCard, {
          feature,
          release: group.release,
          explored: Boolean(explored[feature.id]),
          onExplore,
        }, feature.id)),
      }),
    ],
  });
}

function NewFeaturesPage() {
  const [explored, setExplored] = useState({});
  const [filter, setFilter] = useState('all');
  const allFeatures = useMemo(() => FEATURE_GROUPS.flatMap((group) => group.features), []);
  const exploredCount = allFeatures.filter((feature) => explored[feature.id]).length;

  useEffect(() => {
    let active = true;
    Promise.resolve(storage.get('explored-features')).then((saved) => {
      if (active && saved && typeof saved === 'object') setExplored(saved);
    });
    return () => { active = false; };
  }, []);

  const updateExplored = (next) => {
    setExplored(next);
    Promise.resolve(storage.set('explored-features', next));
  };

  const markExplored = (featureId) => {
    updateExplored({ ...explored, [featureId]: true });
  };

  const resetExploration = () => {
    updateExplored({});
    setFilter('all');
  };

  return jsxs('main', {
    className: 'flex h-full min-h-0 flex-col',
    children: [
      jsxs('header', {
        className: 'border-b border-(--ui-stroke-secondary) px-6 py-5',
        children: [
          jsxs('div', {
            className: 'flex items-start justify-between gap-5',
            children: [
              jsxs('div', {
                children: [
                  jsxs('div', {
                    className: 'flex items-center gap-2.5',
                    children: [
                      jsx('div', {
                        className: 'flex size-8 items-center justify-center rounded-md bg-(--ui-accent-muted) text-(--ui-accent)',
                        children: jsx(Codicon, { name: 'sparkle', size: '1rem' }),
                      }),
                      jsx('h1', { className: 'text-base font-medium tracking-[-0.015em]', children: 'What’s new' }),
                    ],
                  }),
                  jsx('p', { className: 'mt-2 text-sm text-(--ui-text-secondary)', children: 'A curated field guide to the Hermes features worth trying next.' }),
                ],
              }),
              jsxs('div', {
                className: 'shrink-0 text-right',
                children: [
                  jsx('div', { className: 'text-2xl font-semibold tabular-nums tracking-[-0.03em]', children: `${exploredCount}/${allFeatures.length}` }),
                  jsx('div', { className: 'mt-0.5 text-[0.6875rem] text-(--ui-text-tertiary)', children: 'explored' }),
                ],
              }),
            ],
          }),
          jsxs('div', {
            className: 'mt-5 flex items-center justify-between gap-4',
            children: [
              jsx('div', {
                className: 'flex items-center gap-1 rounded-lg border border-(--ui-stroke-secondary) bg-(--ui-bg-secondary) p-1',
                children: FILTERS.map((item) => jsx('button', {
                  type: 'button',
                  onClick: () => setFilter(item.id),
                  className: cn(
                    'rounded-md px-2.5 py-1 text-xs transition-colors',
                    filter === item.id
                      ? 'bg-(--ui-bg-quaternary) text-(--ui-text-primary)'
                      : 'text-(--ui-text-tertiary) hover:text-(--ui-text-primary)'
                  ),
                  children: item.label,
                }, item.id)),
              }),
              exploredCount
                ? jsx(Button, { variant: 'ghost', size: 'sm', onClick: resetExploration, children: 'Reset progress' })
                : null,
            ],
          }),
        ],
      }),
      jsx('div', {
        className: 'flex-1 overflow-y-auto px-6 py-6',
        children: FEATURE_GROUPS.some((group) => group.features.some((feature) => filter === 'all' || (filter === 'explored' ? explored[feature.id] : !explored[feature.id])))
          ? jsx('div', {
              className: 'mx-auto flex max-w-6xl flex-col gap-8',
              children: FEATURE_GROUPS.map((group) => jsx(ReleaseSection, { group, explored, filter, onExplore: markExplored }, group.release)),
            })
          : jsx(EmptyState, {
              title: filter === 'explored' ? 'Nothing explored yet' : 'You’re all caught up',
              description: filter === 'explored' ? 'Explore a feature card to begin building your history.' : 'Every feature in this guide has been explored.',
            }),
      }),
    ],
  });
}

export default {
  id: ID,
  name: 'Hermes New Features',
  description: 'A release-organized, theme-native field guide to notable Hermes features.',
  defaultEnabled: true,
  register(ctx) {
    storage = ctx.storage;
    ctx.registerMany([
      {
        id: 'page',
        area: ROUTES_AREA,
        data: { path: '/hermes-new-features' },
        title: 'What’s new',
        render: () => jsx(NewFeaturesPage, {}),
      },
      {
        id: 'nav',
        area: SIDEBAR_NAV_AREA,
        order: 60,
        data: { path: '/hermes-new-features', label: 'What’s new', codicon: 'sparkle' },
      },
    ]);
    host.logs('info', 'Hermes New Features plugin registered');
  },
};
