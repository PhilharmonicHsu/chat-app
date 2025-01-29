import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Welcome to Chat App</h1>
      <p className="mt-4">Select a chat room to join:</p>
      <div className="mt-6 space-y-2">
        <Link href="/chat/room1"
              className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Room 1
        </Link>
        <Link href="/chat/room2"
              className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Room 2
        </Link>
      </div>
    </div>
  );
}
