const numberFormat = new Intl.NumberFormat('hu-HU');

function element(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
}

function renderItem(item) {
  const article = element('article', `price-item${item.featured ? ' featured' : ''}`);
  const main = element('div', 'item-main');
  const name = element('div', 'item-name', item.name);
  if (item.featured) name.append(element('span', 'popular', 'NÉPSZERŰ'));
  main.append(name, element('p', '', item.description));

  const price = element('div', 'item-price');
  const amount = element('strong');
  amount.append(document.createTextNode(numberFormat.format(Number(item.price)) + ' '));
  amount.append(element('small', '', 'Ft'));
  price.append(amount, element('span', '', `/ ${item.unit}`));
  article.append(main, price);
  return article;
}

function renderCategory(category, index) {
  const section = element('section', 'category');
  const heading = element('div', 'category-title');
  const number = element('span', 'category-number', String(index + 1).padStart(2, '0'));
  const copy = element('div');
  copy.append(element('h3', '', category.name), element('p', '', category.description));
  heading.append(number, copy, element('span', 'category-symbol', '↘'));

  const items = element('div', 'items');
  for (const item of category.items) items.append(renderItem(item));
  section.append(heading, items);
  return section;
}

function renderPriceList(data) {
  if (!data || !Array.isArray(data.categories)) return;

  document.querySelector('.hero-copy h1').textContent = data.title;
  document.querySelector('.intro').textContent = data.intro;
  document.querySelector('.price-aside > p').textContent = data.note;
  document.querySelector('.aside-count').textContent = String(data.categories.length).padStart(2, '0');

  const categoryList = document.querySelector('.category-list');
  categoryList.replaceChildren(...data.categories.map(renderCategory));

  const itemCount = data.categories.reduce((sum, category) => sum + category.items.length, 0);
  document.querySelector('.price-footer span:first-child').textContent = `${itemCount} VÁLASZTHATÓ LEHETŐSÉG`;
}

async function refreshPriceList() {
  try {
    const response = await fetch('/api/arlista', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    renderPriceList(await response.json());
  } catch (error) {
    console.warn('A GitHub árlista most nem érhető el; a beépített előnézeti adatok maradnak.', error);
  }
}

refreshPriceList();
window.addEventListener('focus', refreshPriceList);
window.setInterval(() => {
  if (!document.hidden) refreshPriceList();
}, 60_000);
