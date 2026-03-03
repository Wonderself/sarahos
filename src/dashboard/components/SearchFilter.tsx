'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { label: string; value: string }[];
}

export interface ActiveFilter {
  key: string;
  value: unknown;
}

interface SearchFilterProps {
  filters: FilterConfig[];
  onFilter: (activeFilters: ActiveFilter[]) => void;
  searchPlaceholder?: string;
}

// ─── Debounce hook ────────────────────────────────────────

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// ─── Component ────────────────────────────────────────────

export default function SearchFilter({
  filters,
  onFilter,
  searchPlaceholder = 'Rechercher...',
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const onFilterRef = useRef(onFilter);
  onFilterRef.current = onFilter;

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Combine search + filters into active filters and notify parent
  const activeFilters = useMemo(() => {
    const result: ActiveFilter[] = [];

    if (debouncedSearch.trim()) {
      result.push({ key: '_search', value: debouncedSearch.trim() });
    }

    for (const [key, value] of Object.entries(filterValues)) {
      if (value !== '' && value !== null && value !== undefined) {
        result.push({ key, value });
      }
    }

    return result;
  }, [debouncedSearch, filterValues]);

  useEffect(() => {
    onFilterRef.current(activeFilters);
  }, [activeFilters]);

  const handleFilterChange = useCallback((key: string, value: unknown) => {
    setFilterValues((prev) => {
      const next = { ...prev };
      if (value === '' || value === null || value === undefined) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  }, []);

  const removeFilter = useCallback((key: string) => {
    if (key === '_search') {
      setSearchQuery('');
    } else {
      setFilterValues((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }, []);

  const resetAll = useCallback(() => {
    setSearchQuery('');
    setFilterValues({});
    setPanelOpen(false);
  }, []);

  // Get label for a filter key
  const getFilterLabel = useCallback(
    (key: string) => {
      if (key === '_search') return 'Recherche';
      return filters.find((f) => f.key === key)?.label ?? key;
    },
    [filters],
  );

  // Get display value for a filter
  const getDisplayValue = useCallback(
    (key: string, value: unknown): string => {
      if (key === '_search') return String(value);
      const config = filters.find((f) => f.key === key);
      if (config?.type === 'select' && config.options) {
        const opt = config.options.find((o) => o.value === String(value));
        return opt?.label ?? String(value);
      }
      return String(value);
    },
    [filters],
  );

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Search bar row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Search input */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            transition: 'border-color 0.15s ease',
          }}
        >
          <span style={{ fontSize: 14, color: 'var(--text-muted)', flexShrink: 0 }}>
            {'\ud83d\udd0d'}
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 14,
                padding: 0,
                lineHeight: 1,
                flexShrink: 0,
              }}
              aria-label="Effacer la recherche"
            >
              {'\u2715'}
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setPanelOpen((prev) => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            background: panelOpen ? 'var(--accent-muted)' : 'var(--bg-secondary)',
            border: `1px solid ${panelOpen ? 'var(--accent)' : 'var(--border-primary)'}`,
            borderRadius: 'var(--radius-md)',
            color: panelOpen ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 14 }}>{'\u2699\ufe0f'}</span>
          Filtres
          {activeFilters.filter((f) => f.key !== '_search').length > 0 && (
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {activeFilters.filter((f) => f.key !== '_search').length}
            </span>
          )}
        </button>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginTop: 10,
            alignItems: 'center',
          }}
        >
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                background: 'var(--accent-muted)',
                border: '1px solid var(--accent)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--accent)',
              }}
            >
              <span style={{ fontWeight: 600 }}>{getFilterLabel(filter.key)}:</span>
              <span>{getDisplayValue(filter.key, filter.value)}</span>
              <button
                onClick={() => removeFilter(filter.key)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: 0,
                  lineHeight: 1,
                  marginLeft: 2,
                }}
                aria-label={`Supprimer le filtre ${getFilterLabel(filter.key)}`}
              >
                {'\u2715'}
              </button>
            </span>
          ))}

          <button
            onClick={resetAll}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              padding: '4px 8px',
              textDecoration: 'underline',
            }}
          >
            Reinitialiser les filtres
          </button>
        </div>
      )}

      {/* Expandable filter panel */}
      <div
        style={{
          maxHeight: panelOpen ? 400 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div
          style={{
            marginTop: 12,
            padding: 16,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {filters.map((config) => (
            <div key={config.key}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {config.label}
              </label>

              {config.type === 'select' && config.options ? (
                <select
                  value={String(filterValues[config.key] ?? '')}
                  onChange={(e) => handleFilterChange(config.key, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                  }}
                >
                  <option value="">Tous</option>
                  {config.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : config.type === 'date' ? (
                <input
                  type="date"
                  value={String(filterValues[config.key] ?? '')}
                  onChange={(e) => handleFilterChange(config.key, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                  }}
                />
              ) : config.type === 'number' ? (
                <input
                  type="number"
                  value={String(filterValues[config.key] ?? '')}
                  onChange={(e) => handleFilterChange(config.key, e.target.value)}
                  placeholder={config.label}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                  }}
                />
              ) : (
                <input
                  type="text"
                  value={String(filterValues[config.key] ?? '')}
                  onChange={(e) => handleFilterChange(config.key, e.target.value)}
                  placeholder={config.label}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
