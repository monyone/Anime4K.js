import { useState } from 'react'
import VideoDemo from '../components/VideoDemo'
import ImageDemo from '../components/ImageDemo'
import Layout from '../components/Layout'

type Tab = 'video' | 'image'

function App() {
  const [tab, setTab] = useState<Tab>('video')

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex gap-1 border-b border-gray-700">
          <button
            type="button"
            onClick={() => setTab('video')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'video'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Video
          </button>
          <button
            type="button"
            onClick={() => setTab('image')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'image'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Image
          </button>
        </div>
      </div>

      {tab === 'video' && <VideoDemo />}
      {tab === 'image' && <ImageDemo />}
    </Layout>
  )
}

export default App
