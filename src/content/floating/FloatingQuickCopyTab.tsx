import React, { useState, useMemo } from 'react';
import { Copy, Check, Search } from 'lucide-react';
import { UserProfile, getEffectiveProfile } from '../../types/profile';

interface FloatingQuickCopyTabProps {
  profile: UserProfile | null;
  onCopy: (text: string, label: string) => void;
}

interface CopyItem {
  id: string;
  category: 'links' | 'personal' | 'professional' | 'snippets';
  title: string;
  value: string;
}

export const FloatingQuickCopyTab: React.FC<FloatingQuickCopyTabProps> = ({ profile, onCopy }) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const effective = useMemo(() => {
    return profile ? getEffectiveProfile(profile) : null;
  }, [profile]);

  const items: CopyItem[] = useMemo(() => {
    if (!profile) return [];
    const prof = effective || profile;
    const list: CopyItem[] = [];

    // Links
    if (prof.profiles.linkedin) {
      list.push({ id: 'linkedin', category: 'links', title: 'LinkedIn URL', value: prof.profiles.linkedin });
    }
    if (prof.profiles.github) {
      list.push({ id: 'github', category: 'links', title: 'GitHub URL', value: prof.profiles.github });
    }
    if (prof.profiles.portfolio) {
      list.push({ id: 'portfolio', category: 'links', title: 'Portfolio URL', value: prof.profiles.portfolio });
    }
    if (prof.profiles.leetcode) {
      list.push({ id: 'leetcode', category: 'links', title: 'LeetCode URL', value: prof.profiles.leetcode });
    }

    // Personal
    if (prof.personal.fullName) {
      list.push({ id: 'fullname', category: 'personal', title: 'Full Name', value: prof.personal.fullName });
    }
    if (prof.personal.email) {
      list.push({ id: 'email', category: 'personal', title: 'Email Address', value: prof.personal.email });
    }
    if (prof.personal.phone) {
      list.push({ id: 'phone', category: 'personal', title: 'Phone Number', value: prof.personal.phone });
    }
    if (prof.personal.location) {
      list.push({ id: 'location', category: 'personal', title: 'Location', value: prof.personal.location });
    }

    // Professional & Education
    if (prof.education.college) {
      list.push({ id: 'college', category: 'professional', title: 'University / College', value: prof.education.college });
    }
    if (prof.education.degree) {
      list.push({ id: 'degree', category: 'professional', title: 'Degree & Major', value: `${prof.education.degree}${prof.education.branch ? ' in ' + prof.education.branch : ''}` });
    }
    if (prof.professional.skills && prof.professional.skills.length > 0) {
      list.push({ id: 'skills', category: 'professional', title: 'Key Technical Skills', value: prof.professional.skills.join(', ') });
    }
    if (prof.professional.summary) {
      list.push({ id: 'summary', category: 'professional', title: 'Executive Summary', value: prof.professional.summary });
    }

    // Custom snippets
    if (prof.snippets) {
      for (const s of prof.snippets) {
        if (s.content) {
          list.push({ id: s.id, category: 'snippets', title: s.title, value: s.content });
        }
      }
    }

    return list;
  }, [profile, effective]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q)
    );
  }, [items, search]);

  const handleCopy = (item: CopyItem) => {
    onCopy(item.value, item.title);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="ak-search-input"
          placeholder="Search URLs, credentials, or snippets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search
          size={13}
          style={{ position: 'absolute', right: '10px', top: '9px', color: '#71717a', pointerEvents: 'none' }}
        />
      </div>

      <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {filtered.length > 0 ? (
          <div className="ak-quick-grid">
            {filtered.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="ak-copy-card"
                  onClick={() => handleCopy(item)}
                  title={`Click to copy: ${item.value}`}
                >
                  <div className="ak-copy-card-title">
                    <span>{item.title}</span>
                    {isCopied ? (
                      <Check size={12} style={{ color: '#34d399' }} />
                    ) : (
                      <Copy size={11} style={{ color: '#71717a' }} />
                    )}
                  </div>
                  <div className="ak-copy-card-value">
                    {item.value}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ak-card" style={{ textAlign: 'center', padding: '16px', color: '#a1a1aa', fontSize: '11px' }}>
            No matching items found. Configure your profile in Settings.
          </div>
        )}
      </div>
    </div>
  );
};
