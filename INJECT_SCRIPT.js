// Inject script tag to execute fill script
const script = document.createElement('script');
script.textContent = `(function() {
  console.log('⚡⚡⚡ INSTANT FILL ALL FIELDS ⚡⚡⚡');
  function setValue(sel, val) {
    const el = document.querySelector(sel);
    if (!el) return false;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (setter) setter.call(el, val);
    else el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
    return true;
  }
  function setTextarea(sel, val) {
    const el = document.querySelector(sel);
    if (!el) return false;
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  const fields = [
    ['[data-testid="input-businessPhone"]', '+1-404-676-2121'],
    ['[data-testid="input-businessAddress"]', '1 Coca-Cola Plaza, Atlanta, GA 30313, USA'],
    ['[data-testid="input-domainName"]', 'www.coca-cola.com'],
    ['[data-testid="input-targetAudience"]', 'Global consumers of all ages, retailers, distributors, investors, media, and stakeholders'],
    ['[data-testid="input-brandStyle"]', 'Iconic, timeless, refreshing, optimistic, and globally recognized. The brand embodies happiness, togetherness, and moments of refreshment.'],
    ['[data-testid="input-service-name-0"]', 'Beverage Products'],
    ['[data-testid="input-service-description-0"]', 'Coca-Cola, Diet Coke, Sprite, Fanta, and other iconic beverages'],
  ];
  fields.forEach(([sel, val]) => {
    if (sel.includes('Address') || sel.includes('targetAudience') || sel.includes('brandStyle') || sel.includes('description')) {
      setTextarea(sel, val);
    } else {
      setValue(sel, val);
    }
  });
  setValue('[data-testid="input-primaryColor-hex"]', '#F40009');
  setValue('[data-testid="input-primaryColor-picker"]', '#F40009');
  setValue('[data-testid="input-accentColor-hex"]', '#FFFFFF');
  setValue('[data-testid="input-accentColor-picker"]', '#FFFFFF');
  ['Home', 'About', 'Service /Product', 'Contact'].forEach(page => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => {
      const text = b.textContent?.trim() || '';
      return text.includes(page) && !b.getAttribute('aria-pressed');
    });
    if (btn) btn.click();
  });
  ['Contact Form', 'Social Media Link'].forEach(feature => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => {
      const text = b.textContent?.trim() || '';
      return text.includes(feature) && !b.getAttribute('aria-pressed');
    });
    if (btn) btn.click();
  });
  const dropdowns = [
    { find: 'domain', value: 'have' },
    { find: 'industry', value: 'Retail' },
    { find: 'website', value: 'Business' },
    { find: 'call-to-action', value: 'Contact' },
    { find: 'tone', value: 'Friendly' },
    { find: 'mobile', value: 'Critical' },
    { find: 'design', value: 'Modern' },
    { find: 'font', value: 'Sans-serif' },
    { find: 'country', value: 'United States' },
    { find: 'color', value: 'Custom' },
  ];
  dropdowns.forEach(({ find, value }, idx) => {
    setTimeout(() => {
      const sel = Array.from(document.querySelectorAll('[role="combobox"]')).find(cb => {
        const name = (cb.getAttribute('name') || '').toLowerCase();
        const label = (cb.closest('label')?.textContent || '').toLowerCase();
        return name.includes(find.toLowerCase()) || label.includes(find.toLowerCase());
      });
      if (sel) {
        sel.click();
        setTimeout(() => {
          const opt = Array.from(document.querySelectorAll('[role="option"]')).find(o => {
            const text = (o.textContent?.trim() || '').toLowerCase();
            return text.includes(value.toLowerCase());
          });
          if (opt) opt.click();
        }, 100);
      }
    }, idx * 150);
  });
  setTimeout(() => {
    const continueBtn = Array.from(document.querySelectorAll('button')).find(
      btn => {
        const text = btn.textContent?.trim() || '';
        return (text.includes('Continue') || text.includes('Investigation')) && !btn.disabled;
      }
    );
    if (continueBtn) {
      continueBtn.click();
      console.log('✅✅✅ CONTINUE CLICKED - INVESTIGATION STARTING! ✅✅✅');
    }
  }, 2000);
})();`;
document.head.appendChild(script);
