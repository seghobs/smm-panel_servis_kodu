(() => {
    const data = window.modules.siteOrder;

    if (!data || !data.services) {
        console.error("siteOrder verisi bulunamadı.");
        return;
    }

    // Kategori ID -> Kategori Adı
    const categoryMap = Object.fromEntries(
        [...document.querySelectorAll('#orderform-category option')]
            .map(opt => [opt.value.trim(), opt.textContent.trim()])
    );

    console.log("Kategori sayısı:", Object.keys(categoryMap).length);

    const tree = {};

    Object.values(data.services).forEach(s => {

        const cid = String(s.cid);

        const categoryName =
            categoryMap[cid] ||
            `Bilinmeyen-${cid}`;

        if (!tree[cid]) {
            tree[cid] = {
                categoryId: cid,
                categoryName,
                services: []
            };
        }

        tree[cid].services.push({
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
            hiddenForUsers: s.hidden_for_users === "1",
            platformName: s.platform_name || null,
            platformId: s.platform_id || null,
            nameTemplate: s.name_template || null,
            description: s.description
                ?.replace(/<[^>]+>/g, "")
                .replace(/\s+/g, " ")
                .trim() || null
        });
    });

    const result = Object.values(tree).sort((a, b) =>
        a.categoryName.localeCompare(b.categoryName, "tr")
    );

    console.log("Toplam kategori:", result.length);
    console.log("Toplam servis:", Object.keys(data.services).length);

    const unknown = result.filter(x => x.categoryName.startsWith("Bilinmeyen"));
    console.log("Bulunamayan kategoriler:", unknown);

    const json = JSON.stringify(result, null, 2);

    const blob = new Blob([json], {
        type: "application/json"
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "reklambayi_services_FINAL.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);

    console.log("✅ reklambayi_services_FINAL.json indirildi.");
})();
