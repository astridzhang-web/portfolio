/* Four static portfolio views. Hash routes work under any repository subpath. */
(() => {
  'use strict';
  const routes = ['home', 'led-inquiry', 'us-buyer-research', 'product-copy'];
  const keys = ['home', 'led', 'research', 'product'];
  const app = document.getElementById('app');
  const labels = {
    zh: { skip: '跳至正文', nav: '项目作品', navigation: '项目导航', language: '页面语言',
      back: '返回项目列表', view: '查看项目', missing: '找不到此页面',
      missingText: '请返回项目作品集，选择要查看的项目。',
      rail: ['首页', '询盘跟进', '买家研究', '产品优化'], previous: '上一个项目', next: '下一个项目', sequence: '项目顺序',
      title: '外贸与海外商务作品集', original: '原始描述 / Original', revised: '修改稿 / Revised draft' },
    en: { skip: 'Skip to content', nav: 'Selected Projects', navigation: 'Project navigation', language: 'Page language',
      back: 'Back to projects', view: 'View project', missing: 'Page not found',
      missingText: 'Return to the portfolio to choose a project.',
      rail: ['Home', 'LED Inquiry', 'Buyer Research', 'Product Copy'], previous: 'Previous project', next: 'Next project', sequence: 'Project sequence',
      title: 'Foreign Trade & Overseas Business Portfolio', original: 'Original', revised: 'Revised draft' }
  };
  let current;
  let navigationToken = 0;
  const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plain = text => text.replace(/\*/g, '').trim();
  const inline = text => escape(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  const paragraphs = text => text.split(/\n\s*\n/).map(p => `<p>${inline(p)}</p>`).join('');
  const blockText = block => block ? block.text : '';
  const titleText = block => plain(blockText(block));
  const tableIn = blocks => blocks.find(b => b.type === 'table');
  const routeURL = (page, lang = current.lang, section = '') => `#/${page}${lang === 'en' ? '?lang=en' : ''}${section ? `${lang === 'en' ? '&' : '?'}section=${section}` : ''}`;
  const arrow = '<span class="arrow" aria-hidden="true">→</span>';

  function readRoute() {
    const hash = location.hash;
    if (!hash || hash === '#' || hash === '#main') return { page: 'home', lang: 'zh', section: '' };
    const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
    const params = new URLSearchParams(query);
    return { page: path || 'home', lang: params.get('lang') === 'en' ? 'en' : 'zh', section: params.get('section') || '' };
  }

  function header() {
    const l = labels[current.lang];
    return `<header class="site-header"><a class="skip-link" href="${routeURL(current.page, current.lang, 'main')}" id="skip-link">${l.skip}</a><div class="wrap header-inner">
      <a class="wordmark" href="${routeURL('home')}" lang="en">Astrid Zhang</a>
      <div class="language-switch" role="group" aria-label="${l.language}">
        <button type="button" data-lang="zh" lang="zh-CN" aria-pressed="${current.lang === 'zh'}" aria-label="中文">中文</button>
        <span aria-hidden="true">/</span>
        <button type="button" data-lang="en" lang="en" aria-pressed="${current.lang === 'en'}" aria-label="EN / English">EN</button>
      </div>
    </div></header>`;
  }

  function projectRail() {
    const l = labels[current.lang];
    const homeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m3 10 9-7 9 7"/><path d="M5 9v12h5v-7h4v7h5V9"/></svg>';
    return `<nav class="project-rail" data-current-index="${routes.indexOf(current.page)}" aria-label="${l.navigation}"><ol>${routes.map((route, index) => {
      const number = index ? `0${index}` : '';
      const short = `${number ? number + ' ' : ''}${l.rail[index]}`;
      const name = index ? `${short} — ${CONTENT[current.lang][keys[index]].title}` : l.rail[0];
      return `<li><a href="${routeURL(route)}" data-project-route="${route}" aria-label="${escape(name)}" ${current.page === route ? 'aria-current="page"' : ''}>
        <span class="rail-marker ${index ? '' : 'rail-home-icon'}" aria-hidden="true">${index ? number : homeIcon}</span> <span class="rail-label">${inline(l.rail[index])}</span>
      </a></li>`;
    }).join('')}</ol></nav>`;
  }

  // Keep this small shared component mounted so its CSS underline can transition
  // between routes. Page content and the language header still render normally.
  function updateProjectRail() {
    const nav = app.querySelector('.project-rail');
    const l = labels[current.lang];
    nav.dataset.currentIndex = routes.indexOf(current.page);
    nav.setAttribute('aria-label', l.navigation);
    nav.querySelectorAll('a').forEach((link, index) => {
      const short = `${index ? `0${index} ` : ''}${l.rail[index]}`;
      link.setAttribute('href', routeURL(routes[index]));
      link.setAttribute('aria-label', index ? `${short} — ${CONTENT[current.lang][keys[index]].title}` : short);
      link.querySelector('.rail-label').textContent = l.rail[index];
      if (current.page === routes[index]) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function footer(home) {
    if (home) return `<footer class="site-footer home-footer"><div class="wrap footer-inner"><p class="disclosure">${inline(CONTENT[current.lang].home.note)}</p><div class="footer-signature"><span lang="en">Astrid Zhang</span><span>2026</span></div></div></footer>`;
    const l = labels[current.lang];
    const index = routes.indexOf(current.page);
    const previous = index === 1 ? 3 : index - 1;
    const next = index === 3 ? 1 : index + 1;
    const projectLink = (destination, direction, text) => `<a class="project-turn project-${direction}" href="${routeURL(routes[destination])}">
      <span class="turn-direction">${direction === 'previous' ? '<span aria-hidden="true">←</span> ' : ''}${text}${direction === 'next' ? ' <span aria-hidden="true">→</span>' : ''}</span>
      <span class="turn-title">0${destination} — ${inline(l.rail[destination])}</span>
    </a>`;
    return `<footer class="site-footer detail-footer"><div class="wrap footer-inner">
      ${index > 0 ? `<nav class="project-pagination" aria-label="${l.sequence}">${projectLink(previous, 'previous', l.previous)}${projectLink(next, 'next', l.next)}</nav>` : ''}
      <div class="detail-signature"><span lang="en">Astrid Zhang</span><span>2026</span></div>
    </div></footer>`;
  }

  const projectCovers = [
    'project-01-led-inquiry-cover.webp',
    'project-02-us-buyer-research-cover.webp',
    'project-03-product-optimization-cover.webp'
  ];

  function homeView() {
    const d = CONTENT[current.lang].home;
    const l = labels[current.lang];
    return `<main id="main" tabindex="-1" class="home-main wrap">
      <section class="home-hero" aria-labelledby="page-title"><div class="hero-identity">
        <p class="overline" lang="en">PORTFOLIO <span>/</span> 2026</p>
        <h1 id="page-title" lang="en">Astrid Zhang</h1>
        <p class="professional-field">${inline(d.field)}</p><p class="hero-subtitle">${inline(d.subtitle)}</p>
      </div><aside class="hero-summary"><h2>${inline(d.summary)}</h2>${d.themes.map(t => `<p>${inline(t)}</p>`).join('')}</aside></section>
      <section class="selected-work" id="projects" tabindex="-1" aria-labelledby="projects-title">
        <div class="selected-heading"><p class="overline" lang="en">SELECTED WORK</p><h2 id="projects-title">${inline(d.selected)}</h2><span class="mobile-count">01 — 03</span></div>
        <div class="project-grid">${d.projects.map((p, i) => `<article class="project-preview">
          <a class="image-slot image-slot-${i + 1}" href="${routeURL(routes[i + 1])}" tabindex="-1" aria-hidden="true"><img src="assets/images/projects/${projectCovers[i]}" width="1448" height="1086" alt="" decoding="async"></a>
          <div class="project-heading"><span class="project-number">0${i + 1}</span><h3><a href="${routeURL(routes[i + 1])}">${inline(p.title)}</a></h3><p class="project-product">${inline(p.product)}</p></div>
          <p class="project-description">${inline(p.description)}</p>
          <a class="project-link" href="${routeURL(routes[i + 1])}" aria-label="${l.view}: ${escape(p.title)}">${l.view} ${arrow}</a>
        </article>`).join('')}</div>
      </section>
    </main>${footer(true)}`;
  }

  function pageIntro(d, index) {
    const tags = ['EU INQUIRY', 'US BUYERS', 'PRODUCT COPY'];
    const ids = index === 3 ? ['section-1', 'warranty', 'section-2', 'section-3'] : ['section-1', 'section-2', 'section-3', 'section-4'];
    return `<div class="case-intro"><div class="case-tag" aria-hidden="true">${tags[index - 1]}</div>
      <p class="overline" lang="en">PROJECT 0${index}<span class="desktop-overline"> / SELECTED WORK</span></p>
      <h1 id="page-title">${inline(d.title)}</h1><p class="case-subtitle">${inline(d.subtitle)}</p>
      <p class="case-description">${inline(d.intro)}</p>
      ${d.snapshot ? `<p class="snapshot">${inline(d.snapshot)}</p>` : ''}
      <nav class="contents-nav" aria-label="${current.lang === 'zh' ? '内容导航' : 'On this page'}">${d.nav.map((text, i) => `<a href="${routeURL(current.page, current.lang, ids[i])}" ${current.section === ids[i] ? 'aria-current="location"' : ''}>${inline(text)}</a>`).join('')}</nav>
    </div>`;
  }

  function sectionStart(section, index, introduction = '') {
    return `<section class="case-section" id="section-${index}" tabindex="-1" aria-labelledby="heading-${index}">
      <div class="section-heading"><span class="section-number" aria-hidden="true">0${index}</span><div><h2 id="heading-${index}">${inline(section.title)}</h2>${introduction ? `<p class="section-intro">${inline(introduction)}</p>` : ''}</div></div>`;
  }

  // Definition lists keep label/value associations intact when columns stack.
  function definitionRows(table, className = '') {
    return `<dl class="definition-rows ${className}">${table.rows.map(row => `<div><dt>${inline(row[0])}</dt><dd>${inline(row[1])}</dd></div>`).join('')}</dl>`;
  }

  function editingNote(text) {
    const match = text.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
    return `<aside class="editing-note">${match ? `<strong>${inline(match[1])}</strong><p>${inline(match[2])}</p>` : `<p>${inline(text)}</p>`}</aside>`;
  }

  function emailCard(titleBlock, quote, note, extraClass = '') {
    const [title, subject] = titleBlock.text.split('\n').map(plain);
    return `<article class="email-example ${extraClass}"><div class="email-paper"><h3>${escape(title)}</h3><p class="email-subject" lang="en">${escape(subject)}</p><blockquote lang="en">${paragraphs(quote.text)}</blockquote></div>${editingNote(note.text)}</article>`;
  }

  function ledView(d) {
    const [inquiry, checks, sample, emails] = d.sections;
    const q = inquiry.blocks;
    const c = checks.blocks;
    const internal = tableIn(c);
    const rules = c.find(b => b.type === 'list');
    const tableIndex = c.indexOf(internal);
    const s = sample.blocks;
    const timeline = tableIn(s);
    const e = emails.blocks;
    const mailStart = e.findIndex(b => b.type === 'quote') - 1;
    return `${sectionStart(inquiry, 1)}<div class="inquiry-columns">
      <div class="inquiry-evidence"><h3 class="small-heading">${inline(titleText(q[0]).replace(/[：:]$/, ''))}</h3><blockquote class="rfq-quote" lang="en">${paragraphs(q[1].text)}</blockquote></div>
      <div class="preparation"><h3 class="small-heading">${inline(titleText(q[2]))}</h3>${definitionRows(q[3])}</div>
    </div></section>
    ${sectionStart(checks, 2, c[0].text)}<div class="checks-columns"><div class="internal-checks">
      ${tableIndex > 1 ? `<h3 class="small-heading">${inline(titleText(c[tableIndex - 1]))}</h3>` : ''}${definitionRows(internal)}</div>
      <aside class="reply-principles"><h3 class="small-heading">${inline(titleText(c[c.indexOf(rules) - 1]).replace(/[：:]$/, ''))}</h3>
        <ul>${rules.items.map(t => { const [, label, text] = t.match(/^\*\*(.+?)\*\*\s*(.*)$/); return `<li><h4>${inline(label.replace(/[：:]$/, ''))}</h4><p>${inline(text)}</p></li>`; }).join('')}</ul>
      </aside></div></section>
    ${sectionStart(sample, 3, s[0].type === 'text' ? s[0].text : '')}<ol class="sample-timeline">${timeline.rows.map(row => `<li><h3>${inline(row[0])}</h3><p>${inline(row[1])}</p></li>`).join('')}</ol>
      <p class="source-caveat">${inline(s.find(b => b.type === 'quote').text)}</p></section>
    ${sectionStart(emails, 4, mailStart > 0 ? e[0].text : '')}<div class="email-grid">${emailCard(e[mailStart], e[mailStart + 1], e[mailStart + 2])}${emailCard(e[mailStart + 3], e[mailStart + 4], e[mailStart + 5])}</div></section>`;
  }

  function researchView(d) {
    const [process, buyers, review, framework] = d.sections;
    const p = process.blocks;
    const stages = tableIn(p);
    const b = buyers.blocks;
    const r = review.blocks;
    const reviews = tableIn(r);
    const f = framework.blocks;
    const versions = tableIn(f);
    const title = f[1].text.split('\n');
    return `${sectionStart(process, 1, p[0].type === 'text' ? p[0].text : '')}
      <ol class="research-process">${stages.rows.map(row => `<li><span class="process-number">${inline(row[1])}</span><h3>${inline(row[0])}</h3><p>${inline(row[2])}</p></li>`).join('')}</ol>
      <div class="process-notes">${p.filter(x => x.type === 'text' && x !== p[0]).map(x => `<p>${inline(x.text)}</p>`).join('')}</div></section>
    ${sectionStart(buyers, 2, b[0].text)}<div class="buyers-list">${[1, 3, 5].map((i, n) => {
      const [name, angle] = b[i].text.split('\n').map(plain);
      return `<article class="buyer-analysis"><header><span class="buyer-index">0${n + 1}</span><h3>${escape(name)}</h3><p class="buyer-angle">${escape(angle)}</p></header>
        ${b[i + 1].items.map((text, j) => { const [, label, body] = text.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/); return `<div class="buyer-evidence evidence-${j}"><h4>${inline(label.replace(/[：:]$/, ''))}</h4><p>${inline(body)}</p></div>`; }).join('')}</article>`;
    }).join('')}</div></section>
    ${sectionStart(review, 3, r[0].text)}<div class="review-grid">${reviews.rows.map((row, i) => `<article class="qualification-review ${i ? 'review-hold' : 'review-qualified'}"><h3>${inline(row[0])}</h3><div><h4>${inline(reviews.head[1])}</h4><p>${inline(row[1])}</p></div><div class="review-result"><h4>${inline(reviews.head[2])}</h4><p>${inline(row[2])}</p></div></article>`).join('')}</div><p class="review-note">${inline(r[2].text)}</p></section>
    ${sectionStart(framework, 4)}<ol class="framework-versions">${versions.rows.map(row => `<li><h3>${inline(row[0])}</h3><p>${inline(row[1])}</p></li>`).join('')}</ol>
      <article class="outreach-example"><h3 class="small-heading">${inline(plain(title[0]))}</h3><div class="outreach-paper"><p class="email-subject" lang="en">${inline(plain(title[1]))}</p><blockquote lang="en">${paragraphs(f[2].text)}</blockquote></div>${editingNote(f[3].text)}</article></section>`;
  }

  function parameterReview(table) {
    return `<div class="parameter-review"><div class="parameter-head" aria-hidden="true">${table.head.map(h => `<span>${inline(h)}</span>`).join('')}</div>${table.rows.map(row => `<dl class="parameter-row">${row.map((cell, i) => `<div><dt class="mobile-label">${inline(table.head[i])}</dt><dd>${inline(cell)}</dd></div>`).join('')}</dl>`).join('')}</div>`;
  }

  function productView(d) {
    const [parameters, copy, faq] = d.sections;
    const p = parameters.blocks;
    const c = copy.blocks;
    const exampleStart = current.lang === 'zh' ? 1 : 0;
    const questions = faq.blocks[0];
    return `${sectionStart(parameters, 1)}${parameterReview(p[0])}
      <aside class="warranty" id="warranty" tabindex="-1"><h3>${inline(titleText(p[1]))}</h3><dl class="warranty-details">${p[2].rows[0].map((value, i) => `<div><dt>${inline(p[2].head[i])}</dt><dd lang="en">${inline(value)}</dd></div>`).join('')}</dl><p>${inline(p[3].text)}</p></aside></section>
    ${sectionStart(copy, 2, exampleStart ? c[0].text : '')}${[exampleStart, exampleStart + 6].map(i => `<article class="copy-example"><h3>${inline(titleText(c[i]))}</h3>
      <div class="copy-pair"><div class="copy-original"><h4>${inline(titleText(c[i + 1]))}</h4><blockquote lang="en">${paragraphs(c[i + 2].text)}</blockquote></div>
        <span class="copy-arrow" aria-hidden="true"><span class="arrow-right">➜</span><span class="arrow-down">⬇</span></span>
        <div class="copy-revised"><h4>${inline(titleText(c[i + 3]))}</h4><blockquote lang="en">${paragraphs(c[i + 4].text)}</blockquote></div>
      </div><p class="copy-explanation">${inline(c[i + 5].text)}</p></article>`).join('')}</section>
    ${sectionStart(faq, 3)}${definitionRows(questions, 'buyer-faq')}</section>`;
  }

  function detailView(index) {
    const key = keys[index];
    const d = CONTENT[current.lang][key];
    return `<main id="main" tabindex="-1" class="detail-main wrap page-${key}">${pageIntro(d, index)}${{ led: ledView, research: researchView, product: productView }[key](d)}</main>${footer(false)}`;
  }

  function render() {
    const previous = current;
    current = readRoute();
    const samePage = previous && previous.page === current.page;
    const languageChanged = samePage && previous.lang !== current.lang;
    const activeLanguage = document.activeElement?.dataset.lang;
    // Preserve the reader's current section and relative position during translation.
    const anchor = languageChanged ? [...document.querySelectorAll('.case-section, .selected-work, .home-hero')].reverse().find(el => el.getBoundingClientRect().top <= 120) : null;
    const anchorId = anchor?.id;
    const offset = anchor?.getBoundingClientRect().top;
    const savedScroll = window.scrollY;
    const index = routes.indexOf(current.page);
    const l = labels[current.lang];
    document.body.dataset.page = keys[index] || 'missing';
    document.documentElement.lang = current.lang === 'zh' ? 'zh-CN' : 'en';
    document.title = `Astrid Zhang — ${index > 0 ? CONTENT[current.lang][keys[index]].title : l.title}`;
    document.querySelector('meta[name="description"]').content = index > 0 ? CONTENT[current.lang][keys[index]].intro : CONTENT[current.lang].home.note;
    if (!(samePage && !languageChanged)) {
      const view = index === 0 ? homeView() : index > 0 ? detailView(index) : `<main id="main" tabindex="-1" class="wrap not-found"><h1 id="page-title">${l.missing}</h1><p>${l.missingText}</p><a href="${routeURL('home')}">${l.back}</a></main>${footer(false)}`;
      const pageView = app.querySelector('#page-view');
      if (pageView) {
        app.querySelector('.site-header').outerHTML = header();
        updateProjectRail();
        pageView.innerHTML = view;
      } else {
        app.innerHTML = header() + projectRail() + `<div id="page-view">${view}</div>`;
      }
    } else {
      app.querySelectorAll('.contents-nav a').forEach(a => {
        const active = a.hash === location.hash;
        if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    }
    const token = ++navigationToken;
    requestAnimationFrame(() => {
      if (token !== navigationToken) return;
      if (languageChanged) {
        const target = anchorId && document.getElementById(anchorId);
        window.scrollTo(0, target ? window.scrollY + target.getBoundingClientRect().top - offset : savedScroll);
        if (activeLanguage) app.querySelector(`[data-lang="${activeLanguage}"]`)?.focus({ preventScroll: true });
      } else if (current.section) {
        const target = document.getElementById(current.section);
        if (target) { target.scrollIntoView(); target.focus({ preventScroll: true }); }
      } else {
        window.scrollTo(0, 0);
        if (previous) document.getElementById('main').focus({ preventScroll: true });
      }
    });
  }

  app.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (link && link.getAttribute('href') === location.hash) {
      event.preventDefault();
      const target = document.getElementById(current.section || 'main');
      if (target) {
        if (current.section) target.scrollIntoView(); else window.scrollTo(0, 0);
        target.focus({ preventScroll: true });
      }
      return;
    }
    const button = event.target.closest('button[data-lang]');
    if (!button || button.dataset.lang === current.lang) return;
    location.hash = routeURL(current.page, button.dataset.lang, current.section).slice(1);
  });
  window.addEventListener('hashchange', render);
  render();
})();
