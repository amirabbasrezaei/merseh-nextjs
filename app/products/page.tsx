import { permanentRedirect } from 'next/navigation'

 
export default  async function Prodile() {
  permanentRedirect("/category/1") // Navigate to the new user profile
}

