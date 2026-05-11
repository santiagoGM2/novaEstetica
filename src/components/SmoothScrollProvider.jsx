import { useLenis } from '../hooks/useLenis'

export default function SmoothScrollProvider({ children }) {
  useLenis()
  return children
}
