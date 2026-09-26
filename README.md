# TD Mobile Store

Giao diện website bán lẻ thiết bị Apple (iPhone, iPad, Mac, Apple Watch, AirPods, phụ kiện).
HTML/CSS/JavaScript thuần, không cần build.

## Chạy trên máy

```bash
python -m http.server 5178
```

Mở http://localhost:5178

## Cấu trúc

- `index.html` — khung trang
- `css/styles.css` — giao diện, responsive
- `js/data.js` — sản phẩm, giá, màu, mã giảm giá, danh sách ảnh (`PHOTOS`)
- `js/art.js` — ảnh minh hoạ SVG (dùng khi sản phẩm chưa có ảnh thật)
- `js/app.js` — điều hướng, giỏ hàng, các trang
- `images/products/` — ảnh sản phẩm thật

Sau khi sửa CSS/JS, đổi số `?v=` trong `index.html` để trình duyệt tải bản mới.

## Ghi chú

Bản demo giao diện: giỏ hàng, đơn hàng, đăng nhập lưu trong trình duyệt; chưa có backend và thanh toán thật.

© 2026 TD Mobile Store. All rights reserved. Xem [LICENSE](LICENSE).
