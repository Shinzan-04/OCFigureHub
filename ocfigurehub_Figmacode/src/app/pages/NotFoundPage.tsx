import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 text-center gap-5">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl font-black mb-2"
        style={{ backgroundColor: '#111111' }}
      >
        404
      </div>
      <h1 className="text-3xl font-black text-white">Trang không tồn tại</h1>
      <p className="text-sm max-w-sm" style={{ color: '#A1A1A1' }}>
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Hãy quay về trang chủ để tiếp tục khám phá.
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
      >
        Về trang chủ
      </Link>
    </div>
  );
}
