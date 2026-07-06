Promise.all([
  fetch('/').then(r => r.text()),
  fetch('/services').then(r => r.text())
]).then(([homeHtml, servicesHtml]) => {
  
  const match = homeHtml.match(/window\.modules\.siteOrder\s*=\s*(\{.*?\});/s);
  const data = JSON.parse(match[1]);
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(servicesHtml, 'text/html');
  
  const categoryMap = {};
  doc.querySelectorAll('[data-category-id]').forEach(el => {
    const cid = el.dataset.categoryId;
    const spans = el.querySelectorAll('.catbox span:not([class])');
    const name = spans[spans.length - 1]?.textContent?.trim() 
              || el.querySelector('.catbox')?.dataset?.categoryName;
    if(cid && name) categoryMap[cid] = name;
  });

  const tree = {};
  Object.values(data.services).forEach(s => {
    const catName = categoryMap[s.cid] || 'Bilinmeyen-' + s.cid;
    if(!tree[s.cid]) tree[s.cid] = { categoryId: s.cid, categoryName: catName, services: [] };
    tree[s.cid].services.push({
      id: s.id,
      name: s.origin_name || s.name,
      price: s.price,
      origPrice: s.orig_price,
      min: s.min,
      max: s.max,
      minMaxLabel: s.min_max_label || null,
      type: s.type,
      linkType: s.link_type,
      position: s.position,
      dripFeed: s.drip_feed,
      averageTime: s.average_time?.trim() || null,
      favorite: s.favorite,
      addedToFavoriteAt: s.added_to_favorite_at || null,
      hiddenForUsers: s.hidden_for_users === '1',
      platformName: s.platform_name || null,
      platformId: s.platform_id || null,
      nameTemplate: s.name_template || null,
      description: s.description?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || null
    });
  });

  const result = Object.values(tree).sort((a,b) => a.categoryName.localeCompare(b.categoryName));
  
  console.log('✅ Toplam kategori:', result.length);
  console.log('✅ Toplam servis:', Object.values(data.services).length);

  const json = JSON.stringify(result, null, 2);
  const blob = new Blob([json], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'reklambayi_services_FINAL.json';
  a.click();
  
  console.log('✅ reklambayi_services_FINAL.json indirildi!');
});
