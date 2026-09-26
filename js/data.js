// Catalog data. Prices in VND. storages: [label, price, listPrice]
const CATEGORIES = [
  { id: 'iphone', name: 'iPhone', tagline: 'Mạnh mẽ. Bền bỉ. Đẹp từ mọi góc.', art: 'phone-pro', color: '#f77e2d' },
  { id: 'ipad', name: 'iPad', tagline: 'Làm việc, sáng tạo, giải trí trên một màn hình.', art: 'tablet', color: '#d7e5e6' },
  { id: 'mac', name: 'Mac', tagline: 'Hiệu năng chip Apple, pin cả ngày dài.', art: 'laptop', color: '#c8d8e0' },
  { id: 'watch', name: 'Apple Watch', tagline: 'Sức khoẻ và luyện tập ngay trên cổ tay.', art: 'watch', color: '#1a2530' },
  { id: 'airpods', name: 'AirPods', tagline: 'Âm thanh không gian, chống ồn chủ động.', art: 'airpods-pro', color: '#f2f2f2' },
  { id: 'accessory', name: 'Phụ kiện', tagline: 'Sạc, ốp lưng, bút và mọi thứ bạn cần.', art: 'pencil', color: '#f2f2f2' },
];

const CONDS = {
  new: { label: 'Máy mới', note: 'Nguyên seal, bảo hành 12 tháng', f: 1 },
  likenew: { label: 'Like new 99%', note: 'Đẹp như mới, bảo hành 6 tháng', f: 0.87 },
  used: { label: 'Đã qua sử dụng', note: 'Ngoại hình 95%, bảo hành 3 tháng', f: 0.76 },
};

const C = { // swatch colours taken from apple.com compare / product pages (Sep 2026)
  // iPhone 17 Pro / Pro Max
  cosmic: ['Cam Vũ Trụ', '#f77e2d'], deepblue: ['Xanh Đậm', '#32374a'], silver17p: ['Bạc', '#f5f5f5'],
  // iPhone Air
  airsky: ['Xanh Da Trời', '#f0f9ff'], airgold: ['Vàng Nhạt', '#fffcf5'], cloudwhite: ['Trắng Mây', '#fcfcfc'], spaceblack: ['Đen Không Gian', '#000000'],
  // iPhone 17
  lavender: ['Tím Oải Hương', '#dfceea'], sage: ['Xanh Xô Thơm', '#a9b689'], mistblue: ['Xanh Sương', '#96aed1'], white17: ['Trắng', '#f5f5f5'], black17: ['Đen', '#353839'],
  // iPhone 16 / 16e
  ultramarine: ['Xanh Lưu Ly', '#9aadf6'], teal: ['Xanh Mòng Két', '#b0d4d2'], pink16: ['Hồng', '#f2adda'], white: ['Trắng', '#fafafa'], black: ['Đen', '#3c4042'],
  // iPhone 15
  pink15: ['Hồng', '#e3c8ca'], yellow15: ['Vàng', '#e6e0c1'], green15: ['Xanh Lá', '#cad4c5'], blue15: ['Xanh Dương', '#ced5d9'], black15: ['Đen', '#35393b'],
  // iPad
  silver: ['Bạc', '#e3e4e5'], spaceblackpro: ['Đen Không Gian', '#2e2c2e'],
  airblue: ['Xanh Dương', '#d7e5e6'], airpurple: ['Tím', '#e3dee9'], airstarlight: ['Ánh Sao', '#e5e0d8'], airgray: ['Xám Không Gian', '#6b696e'],
  a16blue: ['Xanh Dương', '#88aebf'], a16pink: ['Hồng', '#de6274'], a16yellow: ['Vàng', '#f0d95b'],
  miniblue: ['Xanh Dương', '#cee3f6'], minipurple: ['Tím', '#b9b8d1'], ministarlight: ['Ánh Sao', '#e3dcd1'], minigray: ['Xám Không Gian', '#68696d'],
  // Mac
  mbasky: ['Xanh Da Trời', '#c8d8e0'], mbasilver: ['Bạc', '#e3e4e6'], mbastarlight: ['Ánh Sao', '#f0e4d3'], mbamidnight: ['Xanh Nửa Đêm', '#2e3642'],
  imacblue: ['Xanh Dương', '#a9c7de'], imacgreen: ['Xanh Lá', '#a8b89b'], imacpink: ['Hồng', '#f1c9cf'], imacpurple: ['Tím', '#b6a4cf'],
  // Apple Watch
  natural: ['Titan Tự Nhiên', '#ccc4bc'], titanblack: ['Titan Đen', '#0f0e0e'],
  jetblack: ['Đen Bóng', '#010203'], wsilver: ['Bạc', '#e0e0e0'], rosegold: ['Vàng Hồng', '#f4d4c6'], spacegray: ['Xám Không Gian', '#727272'],
  midnight: ['Xanh Nửa Đêm', '#1a2530'], starlight: ['Ánh Sao', '#ded6d1'],
  // AirPods Max & accessories (not listed as swatches on apple.com; approximations)
  maxmidnight: ['Xanh Nửa Đêm', '#2e3542'], maxstarlight: ['Ánh Sao', '#e8e1d5'], maxblue: ['Xanh Dương', '#b6cde0'], maxpurple: ['Tím', '#b6a4cf'], orange: ['Cam', '#e59a5c'],
};
const colors = (...keys) => keys.map(k => ({ key: k, name: C[k][0], hex: C[k][1] }));

const PHONE_SPECS = (chip, screen, cam, bat) => ({ 'Màn hình': screen, 'Chip': chip, 'Camera sau': cam, 'Pin': bat, 'Kết nối': '5G, Wi‑Fi 7, Bluetooth 6, USB‑C', 'Hệ điều hành': 'iOS 26', 'Bảo mật': 'Face ID' });

const PRODUCTS = [
  // ---------------- iPhone
  { id: 'iphone-17-pro-max', cat: 'iphone', name: 'iPhone 17 Pro Max', line: 'iPhone 17 Series', year: 2025, art: 'phone-pro',
    storages: [['256GB', 34490000, 37990000], ['512GB', 40990000, 44490000], ['1TB', 47490000, 50990000], ['2TB', 59990000, 63990000]],
    colors: colors('cosmic', 'deepblue', 'silver17p'), conds: ['new', 'likenew'], badges: ['new', 'hot'], rating: 4.9, reviews: 1284, stock: 'in',
    tagline: 'Đỉnh cao công nghệ. Sức mạnh vượt giới hạn.',
    specs: PHONE_SPECS('A19 Pro, CPU 6 lõi, GPU 6 lõi', '6.9" Super Retina XDR, ProMotion 120Hz', '48MP Fusion + 48MP Ultra Wide + 48MP Tele 4x', 'Xem video đến 37 giờ') },
  { id: 'iphone-17-pro', cat: 'iphone', name: 'iPhone 17 Pro', line: 'iPhone 17 Series', year: 2025, art: 'phone-pro',
    storages: [['256GB', 30490000, 32990000], ['512GB', 36990000, 39490000], ['1TB', 43490000, 45990000]],
    colors: colors('cosmic', 'deepblue', 'silver17p'), conds: ['new', 'likenew'], badges: ['new'], rating: 4.8, reviews: 862, stock: 'in',
    tagline: 'Pro trong lòng bàn tay.',
    specs: PHONE_SPECS('A19 Pro, CPU 6 lõi, GPU 6 lõi', '6.3" Super Retina XDR, ProMotion 120Hz', '48MP Fusion + 48MP Ultra Wide + 48MP Tele 4x', 'Xem video đến 31 giờ') },
  { id: 'iphone-air', cat: 'iphone', name: 'iPhone Air', line: 'iPhone 17 Series', year: 2025, art: 'phone-air',
    storages: [['256GB', 27490000, 31990000], ['512GB', 33490000, 37490000], ['1TB', 39490000, 43490000]],
    colors: colors('airsky', 'airgold', 'cloudwhite', 'spaceblack'), conds: ['new', 'likenew'], badges: ['new', 'sale'], rating: 4.7, reviews: 431, stock: 'in',
    tagline: 'Mỏng nhất từ trước đến nay.',
    specs: PHONE_SPECS('A19 Pro, CPU 6 lõi, GPU 5 lõi', '6.5" Super Retina XDR, ProMotion 120Hz', '48MP Fusion', 'Xem video đến 27 giờ') },
  { id: 'iphone-17', cat: 'iphone', name: 'iPhone 17', line: 'iPhone 17 Series', year: 2025, art: 'phone',
    storages: [['256GB', 23990000, 24990000], ['512GB', 29990000, 31490000]],
    colors: colors('lavender', 'sage', 'mistblue', 'white17', 'black17'), conds: ['new', 'likenew'], badges: ['hot'], rating: 4.8, reviews: 976, stock: 'in',
    tagline: 'Nhiều hơn mong đợi.',
    specs: PHONE_SPECS('A19, CPU 6 lõi, GPU 5 lõi', '6.3" Super Retina XDR, ProMotion 120Hz', '48MP Fusion + 48MP Ultra Wide', 'Xem video đến 30 giờ') },
  { id: 'iphone-16', cat: 'iphone', name: 'iPhone 16', line: 'iPhone 16 Series', year: 2024, art: 'phone',
    storages: [['128GB', 18990000, 22990000], ['256GB', 21990000, 25990000], ['512GB', 27490000, 31990000]],
    colors: colors('ultramarine', 'teal', 'pink16', 'white', 'black'), conds: ['new', 'likenew', 'used'], badges: ['sale'], rating: 4.8, reviews: 2210, stock: 'in',
    tagline: 'Camera Control. Apple Intelligence.',
    specs: PHONE_SPECS('A18, CPU 6 lõi, GPU 5 lõi', '6.1" Super Retina XDR OLED', '48MP Fusion + 12MP Ultra Wide', 'Xem video đến 22 giờ') },
  { id: 'iphone-16e', cat: 'iphone', name: 'iPhone 16e', line: 'iPhone 16 Series', year: 2025, art: 'phone-e',
    storages: [['128GB', 14990000, 16990000], ['256GB', 17990000, 19990000], ['512GB', 23490000, 25990000]],
    colors: colors('white', 'black'), conds: ['new', 'likenew'], badges: ['sale'], rating: 4.6, reviews: 588, stock: 'in',
    tagline: 'Tất cả những gì bạn cần.',
    specs: PHONE_SPECS('A18, CPU 6 lõi, GPU 4 lõi', '6.1" Super Retina XDR OLED', '48MP Fusion 2‑in‑1', 'Xem video đến 26 giờ') },
  { id: 'iphone-15', cat: 'iphone', name: 'iPhone 15', line: 'iPhone 15 Series', year: 2023, art: 'phone',
    storages: [['128GB', 15490000, 19990000], ['256GB', 18490000, 22990000]],
    colors: colors('pink15', 'yellow15', 'green15', 'blue15', 'black15'), conds: ['new', 'likenew', 'used'], badges: ['sale'], rating: 4.7, reviews: 3120, stock: 'in',
    tagline: 'Dynamic Island. Camera 48MP.',
    specs: PHONE_SPECS('A16 Bionic', '6.1" Super Retina XDR OLED', '48MP chính + 12MP Ultra Wide', 'Xem video đến 20 giờ') },

  // ---------------- iPad
  { id: 'ipad-pro-m5', cat: 'ipad', name: 'iPad Pro M5 11"', line: 'iPad Pro', year: 2025, art: 'tablet-pro', varLabel: 'Dung lượng',
    storages: [['256GB Wi‑Fi', 28990000, 30990000], ['512GB Wi‑Fi', 34990000, 36990000], ['1TB Wi‑Fi', 46990000, 48990000]],
    colors: colors('silver', 'spaceblackpro'), conds: ['new'], badges: ['new'], rating: 4.9, reviews: 214, stock: 'in',
    tagline: 'Mỏng không tưởng. Mạnh vô cùng.',
    specs: { 'Màn hình': '11" Ultra Retina XDR, Tandem OLED', 'Chip': 'Apple M5, CPU 9 lõi', 'Camera': '12MP rộng, LiDAR', 'Pin': 'Đến 10 giờ', 'Kết nối': 'Wi‑Fi 7, Thunderbolt/USB 4', 'Phụ kiện hỗ trợ': 'Apple Pencil Pro, Magic Keyboard' } },
  { id: 'ipad-air-m3', cat: 'ipad', name: 'iPad Air M3 11"', line: 'iPad Air', year: 2025, art: 'tablet',
    storages: [['128GB Wi‑Fi', 15990000, 16990000], ['256GB Wi‑Fi', 18990000, 19990000], ['512GB Wi‑Fi', 24490000, 25990000]],
    colors: colors('airblue', 'airpurple', 'airstarlight', 'airgray'), conds: ['new', 'likenew'], badges: ['hot'], rating: 4.8, reviews: 402, stock: 'in',
    tagline: 'Nhẹ nhàng. Đa năng. Mạnh mẽ.',
    specs: { 'Màn hình': '11" Liquid Retina', 'Chip': 'Apple M3, CPU 8 lõi', 'Camera': '12MP rộng', 'Pin': 'Đến 10 giờ', 'Kết nối': 'Wi‑Fi 6E, USB‑C', 'Phụ kiện hỗ trợ': 'Apple Pencil Pro, Magic Keyboard Air' } },
  { id: 'ipad-a16', cat: 'ipad', name: 'iPad A16 11"', line: 'iPad', year: 2025, art: 'tablet',
    storages: [['128GB Wi‑Fi', 9490000, 10990000], ['256GB Wi‑Fi', 12490000, 13990000]],
    colors: colors('a16blue', 'a16pink', 'a16yellow', 'silver'), conds: ['new', 'likenew', 'used'], badges: ['sale'], rating: 4.7, reviews: 690, stock: 'in',
    tagline: 'Đầy màu sắc, cho mọi người.',
    specs: { 'Màn hình': '11" Liquid Retina', 'Chip': 'A16', 'Camera': '12MP rộng', 'Pin': 'Đến 10 giờ', 'Kết nối': 'Wi‑Fi 6, USB‑C', 'Phụ kiện hỗ trợ': 'Apple Pencil (USB‑C)' } },
  { id: 'ipad-mini-a17', cat: 'ipad', name: 'iPad mini A17 Pro', line: 'iPad mini', year: 2024, art: 'tablet',
    storages: [['128GB Wi‑Fi', 12990000, 14990000], ['256GB Wi‑Fi', 15990000, 17990000]],
    colors: colors('miniblue', 'minipurple', 'ministarlight', 'minigray'), conds: ['new', 'likenew'], badges: [], rating: 4.7, reviews: 188, stock: 'soon',
    tagline: 'Nhỏ gọn. Trọn vẹn.',
    specs: { 'Màn hình': '8.3" Liquid Retina', 'Chip': 'A17 Pro', 'Camera': '12MP rộng', 'Pin': 'Đến 10 giờ', 'Kết nối': 'Wi‑Fi 6E, USB‑C', 'Phụ kiện hỗ trợ': 'Apple Pencil Pro' } },

  // ---------------- Mac
  { id: 'macbook-air-m4-13', cat: 'mac', name: 'MacBook Air M4 13"', line: 'MacBook Air', year: 2025, art: 'laptop', varLabel: 'Cấu hình',
    storages: [['16GB · 256GB', 24990000, 26990000], ['16GB · 512GB', 29990000, 31990000], ['24GB · 512GB', 34990000, 36990000]],
    colors: colors('mbasky', 'mbasilver', 'mbastarlight', 'mbamidnight'), conds: ['new', 'likenew'], badges: ['hot'], rating: 4.9, reviews: 745, stock: 'in',
    tagline: 'Mỏng nhẹ. Pin đến 18 giờ.',
    specs: { 'Màn hình': '13.6" Liquid Retina', 'Chip': 'Apple M4, CPU 10 lõi, GPU 8 lõi', 'RAM': '16GB hợp nhất', 'Pin': 'Đến 18 giờ', 'Cổng kết nối': '2x Thunderbolt 4, MagSafe 3, jack 3.5mm', 'Trọng lượng': '1.24 kg' } },
  { id: 'macbook-air-m4-15', cat: 'mac', name: 'MacBook Air M4 15"', line: 'MacBook Air', year: 2025, art: 'laptop', varLabel: 'Cấu hình',
    storages: [['16GB · 256GB', 30990000, 32990000], ['16GB · 512GB', 35990000, 37990000], ['24GB · 512GB', 40990000, 42990000]],
    colors: colors('mbasky', 'mbasilver', 'mbastarlight', 'mbamidnight'), conds: ['new'], badges: [], rating: 4.8, reviews: 312, stock: 'in',
    tagline: 'Màn hình lớn. Vẫn siêu mỏng.',
    specs: { 'Màn hình': '15.3" Liquid Retina', 'Chip': 'Apple M4, CPU 10 lõi, GPU 10 lõi', 'RAM': '16GB hợp nhất', 'Pin': 'Đến 18 giờ', 'Cổng kết nối': '2x Thunderbolt 4, MagSafe 3, jack 3.5mm', 'Trọng lượng': '1.51 kg' } },
  { id: 'macbook-pro-m5-14', cat: 'mac', name: 'MacBook Pro M5 14"', line: 'MacBook Pro', year: 2025, art: 'laptop-pro', varLabel: 'Cấu hình',
    storages: [['16GB · 512GB', 42990000, 44990000], ['16GB · 1TB', 47990000, 49990000], ['24GB · 1TB', 53990000, 55990000]],
    colors: colors('spaceblackpro', 'silver'), conds: ['new', 'likenew'], badges: ['new'], rating: 4.9, reviews: 156, stock: 'in',
    tagline: 'Hiệu năng Pro cho công việc thật.',
    specs: { 'Màn hình': '14.2" Liquid Retina XDR', 'Chip': 'Apple M5, CPU 10 lõi, GPU 10 lõi', 'RAM': '16GB hợp nhất', 'Pin': 'Đến 24 giờ', 'Cổng kết nối': '3x Thunderbolt 4, HDMI, SDXC, MagSafe 3', 'Trọng lượng': '1.55 kg' } },
  { id: 'imac-m4', cat: 'mac', name: 'iMac M4 24"', line: 'iMac', year: 2024, art: 'imac', varLabel: 'Cấu hình',
    storages: [['16GB · 256GB', 34990000, 37990000], ['16GB · 512GB', 40990000, 43990000]],
    colors: colors('imacblue', 'imacgreen', 'imacpink', 'silver', 'imacpurple'), conds: ['new'], badges: ['sale'], rating: 4.8, reviews: 97, stock: 'in',
    tagline: 'Đẹp đến từng góc nhìn.',
    specs: { 'Màn hình': '24" Retina 4.5K', 'Chip': 'Apple M4, CPU 8 lõi', 'RAM': '16GB hợp nhất', 'Camera': '12MP Center Stage', 'Cổng kết nối': '2x Thunderbolt', 'Phụ kiện': 'Magic Keyboard, Magic Mouse' } },
  { id: 'mac-mini-m4', cat: 'mac', name: 'Mac mini M4', line: 'Mac mini', year: 2024, art: 'macmini', varLabel: 'Cấu hình',
    storages: [['16GB · 256GB', 14490000, 15990000], ['16GB · 512GB', 19490000, 20990000], ['24GB · 512GB', 24490000, 25990000]],
    colors: colors('silver'), conds: ['new', 'likenew'], badges: ['hot'], rating: 4.9, reviews: 403, stock: 'in',
    tagline: 'Nhỏ đến bất ngờ.',
    specs: { 'Chip': 'Apple M4, CPU 10 lõi, GPU 10 lõi', 'RAM': '16GB hợp nhất', 'Cổng kết nối': '3x Thunderbolt 4, HDMI, Ethernet, 2x USB‑C trước', 'Kích thước': '12.7 x 12.7 x 5 cm', 'Trọng lượng': '0.67 kg' } },

  // ---------------- Watch
  { id: 'watch-ultra-3', cat: 'watch', name: 'Apple Watch Ultra 3', line: 'Apple Watch Ultra', year: 2025, art: 'watch-ultra', varLabel: 'Kích thước',
    storages: [['49mm GPS + Cellular', 23990000, 24990000]],
    colors: colors('natural', 'titanblack'), conds: ['new'], badges: ['new'], rating: 4.9, reviews: 121, stock: 'in',
    tagline: 'Chinh phục mọi địa hình.',
    specs: { 'Màn hình': 'LTPO3 OLED, 3000 nit', 'Chip': 'S10 SiP', 'Vỏ': 'Titan', 'Pin': 'Đến 42 giờ', 'Chống nước': 'WR100, EN13319', 'Kết nối': '5G, liên lạc vệ tinh' } },
  { id: 'watch-s11', cat: 'watch', name: 'Apple Watch Series 11', line: 'Apple Watch Series', year: 2025, art: 'watch', varLabel: 'Kích thước',
    storages: [['42mm GPS', 10990000, 11990000], ['46mm GPS', 11990000, 12990000]],
    colors: colors('jetblack', 'wsilver', 'rosegold', 'spacegray'), conds: ['new', 'likenew'], badges: ['new', 'hot'], rating: 4.8, reviews: 340, stock: 'in',
    tagline: 'Đồng hành sức khoẻ mỗi ngày.',
    specs: { 'Màn hình': 'LTPO3 OLED Always‑On', 'Chip': 'S10 SiP', 'Vỏ': 'Nhôm', 'Pin': 'Đến 24 giờ', 'Chống nước': 'WR50', 'Sức khoẻ': 'ECG, SpO2, huyết áp, giấc ngủ' } },
  { id: 'watch-se-3', cat: 'watch', name: 'Apple Watch SE 3', line: 'Apple Watch SE', year: 2025, art: 'watch', varLabel: 'Kích thước',
    storages: [['40mm GPS', 6490000, 7490000], ['44mm GPS', 7290000, 8290000]],
    colors: colors('midnight', 'starlight'), conds: ['new', 'likenew', 'used'], badges: ['sale'], rating: 4.7, reviews: 512, stock: 'in',
    tagline: 'Thông minh. Vừa túi tiền.',
    specs: { 'Màn hình': 'Retina OLED Always‑On', 'Chip': 'S10 SiP', 'Vỏ': 'Nhôm', 'Pin': 'Đến 18 giờ', 'Chống nước': 'WR50', 'Sức khoẻ': 'Nhịp tim, giấc ngủ, phát hiện té ngã' } },

  // ---------------- AirPods
  { id: 'airpods-pro-3', cat: 'airpods', name: 'AirPods Pro 3', line: 'AirPods Pro', year: 2025, art: 'airpods-pro', varLabel: 'Phiên bản',
    storages: [['Hộp sạc MagSafe USB‑C', 6490000, 6990000]],
    colors: colors('white'), conds: ['new'], badges: ['new', 'hot'], rating: 4.9, reviews: 870, stock: 'in',
    tagline: 'Chống ồn gấp đôi. Đo nhịp tim.',
    specs: { 'Chip': 'H2', 'Chống ồn': 'ANC thế hệ mới, Xuyên âm thích ứng', 'Pin': 'Đến 8 giờ (ANC)', 'Chống nước': 'IP57', 'Tính năng': 'Đo nhịp tim, Dịch trực tiếp', 'Cổng sạc': 'USB‑C, MagSafe, Qi' } },
  { id: 'airpods-4-anc', cat: 'airpods', name: 'AirPods 4', line: 'AirPods', year: 2024, art: 'airpods', varLabel: 'Phiên bản',
    storages: [['Tiêu chuẩn', 3290000, 3690000], ['Chống ồn chủ động', 4490000, 4990000]],
    colors: colors('white'), conds: ['new'], badges: ['sale'], rating: 4.7, reviews: 1045, stock: 'in',
    tagline: 'Thoải mái cả ngày.',
    specs: { 'Chip': 'H2', 'Chống ồn': 'Tuỳ phiên bản', 'Pin': 'Đến 5 giờ', 'Chống nước': 'IP54', 'Cổng sạc': 'USB‑C' } },
  { id: 'airpods-max', cat: 'airpods', name: 'AirPods Max', line: 'AirPods Max', year: 2024, art: 'airpods-max', varLabel: 'Phiên bản',
    storages: [['USB‑C', 12990000, 13990000]],
    colors: colors('maxmidnight', 'maxstarlight', 'maxblue', 'maxpurple', 'orange'), conds: ['new', 'likenew'], badges: [], rating: 4.6, reviews: 233, stock: 'soon',
    tagline: 'Âm thanh độ trung thực cao.',
    specs: { 'Chip': 'H1 (mỗi bên)', 'Chống ồn': 'ANC, Xuyên âm', 'Pin': 'Đến 20 giờ', 'Âm thanh': 'Âm thanh không gian cá nhân hoá', 'Cổng sạc': 'USB‑C' } },

  // ---------------- Accessories
  { id: 'pencil-pro', cat: 'accessory', name: 'Apple Pencil Pro', line: 'Bút & bàn phím', year: 2024, art: 'pencil', varLabel: 'Phiên bản',
    storages: [['Tiêu chuẩn', 3190000, 3490000]], colors: colors('white'), conds: ['new'], badges: ['hot'], rating: 4.8, reviews: 402, stock: 'in',
    tagline: 'Bóp, xoay, vẽ.', specs: { 'Tương thích': 'iPad Pro M4/M5, iPad Air M2/M3, iPad mini A17 Pro', 'Kết nối': 'Gắn nam châm, sạc không dây', 'Tính năng': 'Bóp, cuộn thân bút, phản hồi xúc giác' } },
  { id: 'magsafe-charger', cat: 'accessory', name: 'Sạc MagSafe 25W', line: 'Sạc & cáp', year: 2025, art: 'magsafe', varLabel: 'Chiều dài',
    storages: [['1m', 1190000, 1290000], ['2m', 1390000, 1490000]], colors: colors('white'), conds: ['new'], badges: [], rating: 4.7, reviews: 318, stock: 'in',
    tagline: 'Sạc nhanh không dây.', specs: { 'Công suất': 'Đến 25W', 'Tương thích': 'iPhone 12 trở lên, AirPods', 'Đầu cắm': 'USB‑C' } },
  { id: 'adapter-20w', cat: 'accessory', name: 'Củ sạc USB‑C 20W', line: 'Sạc & cáp', year: 2023, art: 'adapter', varLabel: 'Phiên bản',
    storages: [['Tiêu chuẩn', 490000, 590000]], colors: colors('white'), conds: ['new'], badges: ['sale'], rating: 4.8, reviews: 2804, stock: 'in',
    tagline: 'Nhỏ gọn, sạc nhanh.', specs: { 'Công suất': '20W', 'Cổng': 'USB‑C', 'Tương thích': 'iPhone, iPad, AirPods' } },
  { id: 'cable-usbc', cat: 'accessory', name: 'Cáp USB‑C 240W bện dù', line: 'Sạc & cáp', year: 2023, art: 'cable', varLabel: 'Chiều dài',
    storages: [['1m', 490000, 590000], ['2m', 790000, 890000]], colors: colors('white'), conds: ['new'], badges: [], rating: 4.7, reviews: 944, stock: 'in',
    tagline: 'Bền bỉ, sạc đến 240W.', specs: { 'Công suất': 'Đến 240W', 'Chất liệu': 'Bện dù', 'Truyền dữ liệu': 'USB 2' } },
  { id: 'case-17pm', cat: 'accessory', name: 'Ốp lưng MagSafe iPhone 17 Pro Max', line: 'Ốp lưng', year: 2025, art: 'case', varLabel: 'Phiên bản',
    storages: [['Silicone', 1390000, 1490000]], colors: colors('orange', 'maxmidnight', 'sage', 'maxpurple'), conds: ['new'], badges: ['new'], rating: 4.6, reviews: 211, stock: 'in',
    tagline: 'Bảo vệ, vẫn đẹp.', specs: { 'Chất liệu': 'Silicone, lót vi sợi', 'Tương thích': 'iPhone 17 Pro Max', 'Tính năng': 'MagSafe, Camera Control' } },
  { id: 'airtag', cat: 'accessory', name: 'AirTag', line: 'Định vị', year: 2021, art: 'airtag', varLabel: 'Gói',
    storages: [['1 chiếc', 790000, 890000], ['4 chiếc', 2690000, 2990000]], colors: colors('white'), conds: ['new'], badges: ['hot'], rating: 4.8, reviews: 1570, stock: 'in',
    tagline: 'Không bao giờ thất lạc đồ.', specs: { 'Kết nối': 'Bluetooth, Ultra Wideband', 'Pin': 'CR2032, khoảng 1 năm', 'Chống nước': 'IP67' } },
];

const REVIEW_POOL = [
  ['Minh T.', 5, 'Máy đẹp, giao nhanh trong 2 giờ. Nhân viên tư vấn kỹ, kích hoạt bảo hành ngay tại chỗ.'],
  ['Hà N.', 5, 'Hàng chính hãng VN/A, hộp nguyên seal. Mua trả góp 0% thủ tục rất gọn.'],
  ['Quân L.', 4, 'Hiệu năng quá tốt, pin trâu hơn máy cũ nhiều. Trừ 1 sao vì hết màu mình thích phải đợi 2 ngày.'],
  ['Thảo P.', 5, 'Đóng gói cẩn thận, có tặng kèm dán cường lực. Sẽ ủng hộ tiếp.'],
  ['Duy K.', 4, 'Giá tốt hơn nhiều nơi khác, được thu cũ đổi mới giá hợp lý.'],
];

const PROMOS = [
  'Giảm thêm 500.000₫ khi thanh toán qua thẻ tín dụng (đơn từ 10 triệu)',
  'Trả góp 0% lãi suất qua thẻ tín dụng, kỳ hạn 6–12 tháng',
  'Thu cũ đổi mới: trợ giá đến 2.000.000₫',
  'Tặng gói bảo hành rơi vỡ 6 tháng cho đơn hàng trên 20 triệu',
];

const COUPONS = { TDMOBILE500: { off: 500000, min: 10000000, text: 'Giảm 500.000₫ cho đơn từ 10 triệu' }, WELCOME5: { pct: 5, max: 1000000, min: 0, text: 'Giảm 5%, tối đa 1.000.000₫' } };

const PROVINCES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Bình Dương', 'Đồng Nai', 'Khánh Hoà', 'Thừa Thiên Huế', 'Quảng Ninh', 'Khác'];

// Real product photos. Products/colours not listed here fall back to the SVG renders in art.js.
// Put files in images/products/<product-id>/ and list them per colour key (first image = main image).
// Use "default" for photos shared by every colour. PNG/WebP on a white or transparent background works best.
// Example:
//   'iphone-17-pro-max': {
//     cosmic: ['images/products/iphone-17-pro-max/cosmic-1.webp', 'images/products/iphone-17-pro-max/cosmic-2.webp'],
//     deepblue: ['images/products/iphone-17-pro-max/deepblue-1.webp'],
//   },
const PHOTOS = {
};
