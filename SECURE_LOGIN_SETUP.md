# Hướng dẫn triển khai đăng nhập bảo mật Hải Hà Hưng

Gói này bổ sung giao diện đăng nhập và Cloudflare Pages Functions, không sửa logic báo giá/danh mục/mẫu in hiện có.

## Rất quan trọng
- GitHub Pages thuần không chạy API xác thực hoặc `functions/`.
- Cần triển khai repository này bằng **Cloudflare Pages** (Git integration), không phải Worker static upload.
- Không lưu mật khẩu trong JSON hoặc JavaScript công khai.
- Chỉ chuyển domain sau khi đã thử nghiệm thành công trên `pages.dev`.

## 1. Cấu hình Cloudflare Pages
1. Trong Cloudflare, tạo Pages project kết nối repository `agrihaihahung/alu`.
2. Framework preset: None; Build command để trống; Build output directory đặt là `.`.
3. Đảm bảo thư mục `functions/` nằm ở thư mục gốc của repository để Pages nhận diện Functions.
4. Triển khai trước trên domain `*.pages.dev`.

## 2. Thêm biến môi trường
Trong Pages → Settings → Variables and Secrets, tạo các biến Production:
- `HHH_USERNAME`: tên đăng nhập quản trị, ví dụ `admin`.
- `HHH_PASSWORD_HASH`: chuỗi `saltHex:derivedHashHex` dùng PBKDF2-SHA256 (310.000 vòng).
- `HHH_SESSION_SECRET`: chuỗi ngẫu nhiên tối thiểu 32 bytes, lưu dưới dạng Secret.

Tạo salt và hash trên máy quản trị bằng Python:
```bash
python -c "import hashlib,secrets,getpass; p=getpass.getpass('Mật khẩu mới: ').encode(); s=secrets.token_hex(16); h=hashlib.pbkdf2_hmac('sha256',p,bytes.fromhex(s),310000).hex(); print(s+':'+h)"
```
Tạo session secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```
Không commit các giá trị thật vào repository.

## 3. Kiểm tra
- Đăng nhập đúng chuyển về trang đã yêu cầu.
- Đăng nhập sai báo lỗi.
- Mở trang báo giá/danh mục trực tiếp trong cửa sổ riêng phải chuyển về login.
- Sau đăng xuất phải đăng nhập lại.
- Kiểm tra trang in, tải JSON, CSS/JS, lưu Drive và lịch sử báo giá.
- Thử nghiệm xong mới chuyển DNS/domain.

## Giới hạn
Đây là một tài khoản dùng chung, không có phân quyền theo nhân viên. Nên bật rate limiting/WAF cho endpoint đăng nhập. Tài nguyên được phục vụ từ GitHub Pages gốc vẫn công khai; cần phục vụ website qua Cloudflare Pages để middleware có hiệu lực.
