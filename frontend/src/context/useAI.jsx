import { useContext } from 'react'
import AIContext from './AIContext'

const useAI = () => {
  const ctx = useContext(AIContext)
  if (!ctx) throw new Error('useAI must be used within AIContextProvider')
  return ctx
}

export default useAI
