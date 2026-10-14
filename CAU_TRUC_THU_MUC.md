# Cấu trúc thư mục Hải Hà Hưng

- `sites/bao-gia/`: lập báo giá
- `sites/danh-muc-nhom/`: danh mục nhôm
- `sites/phu-kien/`: danh mục phụ kiện
- `sites/lich-su-bao-gia/`: lịch sử báo giá
- `sites/in-bao-gia/`: mẫu in/PDF
- `assets/css/`: stylesheet
- `assets/js/`: JavaScript
- `assets/images/`: logo và hình ảnh
- `data/`: dữ liệu JSON

`index.html` ở thư mục gốc là điểm vào tương thích GitHub Pages, tự chuyển đến trang báo giá. Khi dùng Live Server, mở `index.html` ở thư mục gốc. Không mở trực tiếp bằng `file://` vì các trang tải JSON bằng `fetch()`.
