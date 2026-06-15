import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { getTeacherPath } from '../utils/teacherPath';

const highlightMatch = (text, query) => {
  if (!query.trim()) return text;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.trim().toLowerCase() ? (
      <mark key={i} className="suggestion-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export default function TeacherSearch({ value, onChange, faculty, department, searching }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const results = await api.getSuggestions({
        q: query,
        faculty,
        department,
        limit: 8,
      });
      setSuggestions(results);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [faculty, department]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) fetchSuggestions(value);
    }, 200);
    return () => clearTimeout(timer);
  }, [value, open, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectSuggestion = (teacher) => {
    onChange(teacher.name);
    setOpen(false);
    navigate(getTeacherPath(teacher));
  };

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) {
      if (e.key === 'Escape') setOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showDropdown = open && value.trim().length > 0;

  return (
    <div className="search-autocomplete" ref={wrapRef}>
      <div className="search-input-wrap">
        <input
          ref={inputRef}
          id="search"
          type="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          placeholder="Search by teacher name or department..."
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {(searching || loadingSuggestions) && <span className="search-spinner" aria-hidden="true" />}
      </div>

      {showDropdown && (
        <ul id="search-suggestions" className="search-suggestions" role="listbox">
          {loadingSuggestions && suggestions.length === 0 ? (
            <li className="suggestion-item suggestion-status">Searching...</li>
          ) : suggestions.length === 0 ? (
            <li className="suggestion-item suggestion-status">No matching teachers found</li>
          ) : (
            suggestions.map((teacher, index) => (
              <li key={teacher._id} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  className={`suggestion-btn ${index === activeIndex ? 'active' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectSuggestion(teacher)}
                >
                  <span className="suggestion-name">{highlightMatch(teacher.name, value)}</span>
                  <span className="suggestion-meta">
                    {teacher.department !== 'General' ? teacher.department : teacher.faculty}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
