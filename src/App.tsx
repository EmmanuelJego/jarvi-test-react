import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DefaultLayout } from '@/layouts/DefaultLayout'
import { StatsPage } from '@/pages/StatsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route index element={<StatsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
