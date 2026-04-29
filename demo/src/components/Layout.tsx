type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">
            Anime4K.js
            <span className="text-gray-400 font-normal text-base ml-2">Demo</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            WebGL port of Anime4K
          </p>
        </header>

        {children}
      </div>
    </div>
  )
}
