(function () {
    // Resolve locale once from <html lang>, with minimal branching
    const locale = ({
        uk: 'uk-UA',
        ar: 'ar-SA',
    }[(document.documentElement.getAttribute('lang') || 'en').trim().toLowerCase()]) || (document.documentElement.getAttribute('lang') || 'en').trim() || 'en';

    const isArabic = /^ar(\b|-|_)/i.test(locale);
    const forceLatinDigitsOnArabic = false;
    const opts = (o) => (isArabic && forceLatinDigitsOnArabic ? { ...o, numberingSystem: 'latn' } : o);

    // Intl formatters
    const fmtMonthDay = new Intl.DateTimeFormat(locale, opts({ month: 'long', day: 'numeric' }));
    const fmtWeekday  = new Intl.DateTimeFormat(locale, opts({ weekday: 'long' }));

    // Utilities
    const capitalize = (s) => {
        if (!s) return s;
        const m = s.match(/^(\s*)(.)([\s\S]*)$/);
        return m ? m[1] + m[2].toLocaleUpperCase(locale) + m[3] : s;
    };

    const parseDate = (raw) => {
        if (!raw) return null;
        const s = String(raw).trim();
        const d = /^\d+$/.test(s) ? new Date(parseInt(s, 10)) : new Date(s);
        return isNaN(d) ? null : d;
    };

    const findDateFor = (el) => {
        // 1) nearest ancestor with data-date
        for (let p = el; p && p.nodeType === 1; p = p.parentElement) {
            const v = p.getAttribute?.('data-date');
            const d = v && parseDate(v);
            if (d) return d;
        }
        // 2) time[datetime] inside nearest .event-card or parent
        const host = el.closest?.('.event-card') || el.parentElement;
        const dt = host?.querySelector?.('time[datetime]')?.getAttribute?.('datetime');
        const byTime = dt && parseDate(dt);
        if (byTime) return byTime;

        // 3) data-date on element
        const selfDate = el.getAttribute?.('data-date');
        const bySelf = selfDate && parseDate(selfDate);
        if (bySelf) return bySelf;

        // 4) ISO string in text
        const m = (el.textContent || '').match(/\b\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?)?\b/);
        return m ? parseDate(m[0]) : null;
    };

    const monthOnly = (date) => {
        const parts = fmtMonthDay.formatToParts(date);
        const month = parts.find(p => p.type === 'month')?.value || fmtMonthDay.format(date);
        return capitalize(month);
    };

    const weekdayCap = (date) => capitalize(fmtWeekday.format(date));

    const fill = (selector, formatter) => {
        document.querySelectorAll(selector).forEach(el => {
            const d = findDateFor(el);
            if (d) el.textContent = typeof formatter === 'function' ? formatter(d) : formatter.format(d);
        });
    };

    const applyAll = () => {
        fill('[month-format]', monthOnly);  // "Січня", "Липня"
        fill('[day-format]', weekdayCap);   // "Понеділок"
    };

    // Initial run
    applyAll();

    // Observe mutations with simple microtask debounce
    const mo = new MutationObserver(() => {
        Promise.resolve().then(applyAll);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
})();