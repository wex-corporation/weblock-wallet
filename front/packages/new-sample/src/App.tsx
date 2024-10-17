import Router from './routes/Router.tsx'
import { useRecoilValue } from 'recoil'
import { errorState } from './atom/ErrorAtom.ts'
import Loading from './components/Loading.tsx'

function App() {
  const error = useRecoilValue(errorState)

  return (
    <div className="flex flex-col items-center justify-center gap-12 min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center">RWX Wallet SDK Demo</h1>

      {error && <p className="w-full text-red-500 text-center">{error}</p>}
      <Loading />
      <Router />
    </div>
  )
}

export default App
